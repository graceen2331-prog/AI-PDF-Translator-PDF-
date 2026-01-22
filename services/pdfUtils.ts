import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist';

// Configure the worker to use the same version as the main library.
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;

interface TextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const extractTextFromPdf = async (file: File): Promise<string[]> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the document
    const loadingTask = getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    const numPages = pdf.numPages;
    const pagesText: string[] = [];

    // Iterate through pages
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const items = textContent.items as any[];

      if (items.length === 0) {
        pagesText.push("");
        continue;
      }

      // 1. Map to cleaner object with coordinates and filter empty strings
      // PDF coordinates: (0,0) is bottom-left usually. 
      // transform[4] is X, transform[5] is Y.
      const mappedItems: TextItem[] = items.map(item => ({
        str: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
        height: item.height || 10
      })).filter(item => item.str.trim().length > 0);

      if (mappedItems.length === 0) {
        pagesText.push("");
        continue;
      }

      // 2. Sort by Y (descending - Top to Bottom) then X (ascending - Left to Right)
      mappedItems.sort((a, b) => {
        const yDiff = b.y - a.y;
        // Tolerance for items on the same visual line
        if (Math.abs(yDiff) < 5) { 
          return a.x - b.x;
        }
        return yDiff;
      });

      // 3. Group into logical lines
      const lines: { y: number, text: string }[] = [];
      let currentLineY = mappedItems[0].y;
      let currentLineItems: TextItem[] = [];

      for (const item of mappedItems) {
        // If Y difference is small, it's the same line
        if (Math.abs(item.y - currentLineY) < 8) { 
          currentLineItems.push(item);
        } else {
          // Commit previous line
          if (currentLineItems.length > 0) {
             currentLineItems.sort((a, b) => a.x - b.x); // Ensure LTR order
             lines.push({
               y: currentLineY,
               text: currentLineItems.map(i => i.str).join(' ') // Basic word joining
             });
          }
          // Start new line
          currentLineItems = [item];
          currentLineY = item.y;
        }
      }
      // Commit last line
      if (currentLineItems.length > 0) {
         currentLineItems.sort((a, b) => a.x - b.x);
         lines.push({
           y: currentLineY,
           text: currentLineItems.map(i => i.str).join(' ')
         });
      }

      // 4. Group lines into paragraphs based on vertical spacing
      // This is crucial for fixing "messy" layout where lines are broken rigidly
      let pageContent = '';
      if (lines.length > 0) {
        pageContent = lines[0].text;
        
        for (let j = 1; j < lines.length; j++) {
          const prev = lines[j-1];
          const curr = lines[j];
          const dy = prev.y - curr.y; // Positive gap size (going down)

          // Heuristic: 
          // - Small gap (e.g., 10-18 units) = Line wrap within paragraph
          // - Large gap (e.g., > 20 units) = New paragraph or Header
          
          if (dy > 20) {
             // New paragraph
             pageContent += '\n\n' + curr.text;
          } else {
             // Continuation of same paragraph.
             // We want to reflow this text so Gemini sees complete sentences.
             
             // Check for list items (don't merge bullet points into previous line)
             const isBullet = /^[•\-\*]/.test(curr.text) || /^\d+\./.test(curr.text);
             
             if (isBullet) {
               pageContent += '\n' + curr.text;
             } else {
               // Handle hyphenated words at end of line (e.g. "commu-")
               if (pageContent.endsWith('-')) {
                 pageContent = pageContent.slice(0, -1) + curr.text;
               } else {
                 pageContent += ' ' + curr.text;
               }
             }
          }
        }
      }

      pagesText.push(pageContent);
    }

    return pagesText;
  } catch (error: any) {
    console.error("Error extracting text from PDF:", error);
    const msg = error.message || error.toString();
    throw new Error(`Failed to parse the PDF file. Details: ${msg}`);
  }
};
