import React, { useRef, useState } from 'react';
import { UploadCloud, FileType } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        onFileSelect(file);
      } else {
        alert('Please upload a PDF file.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out p-12 text-center bg-white ${
        isDragging 
          ? 'border-brand-500 bg-brand-50/50' 
          : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={inputRef} 
        className="hidden" 
        accept="application/pdf" 
        onChange={handleChange} 
      />
      
      <div className="flex flex-col items-center gap-4">
        <div className={`p-4 rounded-full transition-colors duration-300 ${isDragging ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-500'}`}>
          <UploadCloud className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">Click to upload or drag and drop</h3>
          <p className="text-slate-500 text-sm">PDF files only (Max 20MB)</p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
