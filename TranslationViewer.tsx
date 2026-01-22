import React from 'react';
import { TranslationPage } from '../types';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface TranslationViewerProps {
  pages: TranslationPage[];
}

const TranslationViewer: React.FC<TranslationViewerProps> = ({ pages }) => {
  return (
    <div className="space-y-8 mt-8">
      {pages.map((page) => (
        <div key={page.id} className="scroll-mt-20 break-inside-avoid">
          {/* Print Only Title for Page */}
          <div className="hidden print-only mb-4 border-b border-gray-200 pb-2">
            <h2 className="text-lg font-bold text-gray-500">Page {page.id}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 group">
            
            {/* Original Text */}
            <div className="no-print bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-colors hover:border-slate-300 relative">
              <span className="absolute top-4 right-4 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded">
                Original
              </span>
              <div className="prose prose-sm prose-slate max-w-none font-sans whitespace-pre-wrap leading-relaxed text-slate-600">
                {page.originalText}
              </div>
            </div>

            {/* Translated Text */}
            <div className="bg-white md:rounded-xl md:shadow-sm md:border border-brand-100 md:p-6 print:p-0 print:border-0 print:shadow-none relative bg-gradient-to-br from-white to-brand-50/30">
              <span className="no-print absolute top-4 right-4 text-xs font-semibold text-brand-600 uppercase tracking-wider bg-brand-50 px-2 py-1 rounded border border-brand-100">
                Translated
              </span>
              
              {page.status === 'processing' ? (
                <div className="flex flex-col items-center justify-center h-48 text-brand-500 animate-pulse">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p className="text-sm font-medium">Translating page {page.id}...</p>
                </div>
              ) : page.status === 'error' ? (
                 <div className="text-red-500 p-4 bg-red-50 rounded-lg">Translation failed for this page.</div>
              ) : (
                <div className="prose prose-sm prose-slate max-w-none font-chinese leading-relaxed text-slate-800">
                  <ReactMarkdown>{page.translatedText}</ReactMarkdown>
                </div>
              )}
            </div>

          </div>
          
          {/* Page Break for Print */}
          <div className="print-only" style={{ pageBreakAfter: 'always' }}></div>
        </div>
      ))}
    </div>
  );
};

export default TranslationViewer;