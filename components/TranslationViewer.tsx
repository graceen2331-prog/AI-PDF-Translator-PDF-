import React from 'react';
import { TranslationPage } from '../types';
import { Loader2, RotateCcw, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface TranslationViewerProps {
  pages: TranslationPage[];
  onRetry?: (pageId: number) => void;
}

const TranslationViewer: React.FC<TranslationViewerProps> = ({ pages, onRetry }) => {
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
                <div className="no-print flex flex-col gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-700 font-semibold mb-1">Translation Failed</p>
                      {page.errorMessage && (
                        <p className="text-red-600 text-sm mb-2">{page.errorMessage}</p>
                      )}
                      {page.retryCount ? (
                        <p className="text-red-500 text-xs">Retry attempts: {page.retryCount}/{3}</p>
                      ) : null}
                    </div>
                  </div>
                  {onRetry && (
                    <button
                      onClick={() => onRetry(page.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Retry Translation
                    </button>
                  )}
                </div>
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
