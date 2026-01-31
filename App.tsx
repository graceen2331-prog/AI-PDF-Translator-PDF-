import React, { useState, useCallback } from 'react';
import { FileUp, FileText, CheckCircle, AlertCircle, Download, Printer, RefreshCw, X } from 'lucide-react';
import { extractTextFromPdf } from './services/pdfUtils';
import { translateTextWithGemini } from './services/geminiService';
import { TranslationPage, MAX_FILE_SIZE, MAX_RETRY_ATTEMPTS, RETRY_DELAY_MS } from './types';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import TranslationViewer from './components/TranslationViewer';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<TranslationPage[]>([]);

  // Retry a failed page translation with exponential backoff
  const retryPageTranslation = useCallback(async (pageId: number) => {
    setPages(prev => prev.map(p => 
      p.id === pageId ? { ...p, status: 'processing', retryCount: (p.retryCount || 0) + 1 } : p
    ));

    const page = pages.find(p => p.id === pageId);
    if (!page || !page.originalText.trim()) return;

    try {
      for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
        try {
          const translated = await translateTextWithGemini(page.originalText);
          setPages(prev => prev.map(p => 
            p.id === pageId 
              ? { ...p, translatedText: translated, status: 'completed', errorMessage: undefined } 
              : p
          ));
          return; // Success
        } catch (err) {
          if (attempt < MAX_RETRY_ATTEMPTS - 1) {
            // Exponential backoff: 1s, 2s, 4s
            const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            throw err; // Last attempt failed
          }
        }
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to translate this page';
      console.error(`Error retrying page ${pageId}:`, err);
      setPages(prev => prev.map(p => 
        p.id === pageId 
          ? { ...p, status: 'error', errorMessage: errorMsg } 
          : p
      ));
    }
  }, [pages]);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    // File size validation
    if (selectedFile.size > MAX_FILE_SIZE) {
      const maxSizeMB = Math.round(MAX_FILE_SIZE / 1024 / 1024);
      setError(`File size exceeds ${maxSizeMB}MB limit. Please upload a smaller file.`);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setIsProcessing(true);
    setProgress(0);
    setPages([]);

    try {
      // 1. Extract Text
      const extractedPages = await extractTextFromPdf(selectedFile);
      
      const initialPages: TranslationPage[] = extractedPages.map((text, index) => ({
        id: index + 1,
        originalText: text,
        translatedText: '',
        status: 'pending',
        retryCount: 0
      }));
      setPages(initialPages);

      // 2. Translate Pages Sequentially
      // We process them one by one to show progress and avoid rate limits
      for (let i = 0; i < initialPages.length; i++) {
        const page = initialPages[i];
        
        // Skip empty pages
        if (!page.originalText || page.originalText.trim().length === 0) {
          setPages(prev => prev.map(p => 
            p.id === page.id ? { ...p, status: 'completed' } : p
          ));
          setProgress(Math.round(((i + 1) / initialPages.length) * 100));
          continue;
        }
        
        // Update status to processing
        setPages(prev => prev.map(p => p.id === page.id ? { ...p, status: 'processing' } : p));
        
        // Try translation with automatic retry
        let translated: string | null = null;
        let lastError: Error | null = null;
        
        for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
          try {
            translated = await translateTextWithGemini(page.originalText);
            lastError = null;
            break; // Success
          } catch (err) {
            lastError = err as Error;
            if (attempt < MAX_RETRY_ATTEMPTS - 1) {
              // Exponential backoff
              const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
              console.log(`Retrying page ${page.id} in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS})`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
        
        if (translated) {
          setPages(prev => prev.map(p => 
            p.id === page.id ? { ...p, translatedText: translated, status: 'completed' } : p
          ));
        } else {
          const errorMsg = lastError?.message || 'Unknown error';
          console.error(`Error translating page ${page.id}:`, lastError);
          setPages(prev => prev.map(p => 
            p.id === page.id ? { ...p, status: 'error', errorMessage: errorMsg } : p
          ));
        }
        
        setProgress(Math.round(((i + 1) / initialPages.length) * 100));
      }

    } catch (err: any) {
      setError(err.message || 'Failed to process PDF file.');
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleReset = () => {
    setFile(null);
    setPages([]);
    setProgress(0);
    setError(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col pb-10">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <div className="no-print space-y-6">
          
          {/* Hero / Intro */}
          {!file && (
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">
                Translate English PDFs to Chinese Instantly
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                Powered by Gemini AI. Upload your document, and we'll preserve the structure while translating it into natural, professional Simplified Chinese.
              </p>
            </div>
          )}

          {/* Upload Area */}
          {!file && <FileUpload onFileSelect={handleFileSelect} />}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto hover:text-red-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Progress / Status Bar */}
          {file && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-30">
              <div className="flex items-center gap-4 w-full md:w-auto overflow-hidden">
                <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate max-w-xs">{file.name}</p>
                  <p className="text-sm text-slate-500">
                    {pages.length} Pages • {isProcessing ? 'Translating...' : 'Completed'}
                  </p>
                </div>
              </div>

              {isProcessing && (
                <div className="flex-grow w-full md:w-1/3 mx-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Processing</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-brand-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto justify-end">
                <button 
                  onClick={handleReset}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Translate another file"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button 
                  onClick={handlePrint}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Translation Result View */}
        {file && pages.length > 0 && (
          <TranslationViewer pages={pages} onRetry={retryPageTranslation} />
        )}
      </main>
    </div>
  );
};

export default App;