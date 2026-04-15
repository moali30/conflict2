import React, { useCallback, useState } from 'react';
import { UploadCloud, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function FileUpload({ onFileSelect, isLoading, error }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-64 p-5 border-2 border-dashed rounded-lg transition-colors duration-200 ease-in-out text-center text-[13px] text-slate-500",
          isDragging 
            ? "border-blue-600 bg-blue-50/50" 
            : "border-slate-200 bg-[#fafafa] hover:bg-slate-50",
          isLoading && "opacity-50 pointer-events-none"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileInput}
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <UploadCloud className="w-8 h-8 text-slate-400" />
          <div>
            <p className="text-[13px] font-semibold text-slate-700">
              {isLoading ? "Processing file..." : "Click or drag file to upload"}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports .xlsx, .xls, and .csv files
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start space-x-3 text-red-800">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="mt-8 bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-[11px] uppercase font-semibold text-slate-500 tracking-[1px] flex items-center">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Expected Format
          </h3>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                <th className="border border-slate-200 p-[10px] text-center bg-slate-50 font-semibold text-slate-500">Course Name</th>
                <th className="border border-slate-200 p-[10px] text-center bg-slate-50 font-semibold text-slate-500">Math 101</th>
                <th className="border border-slate-200 p-[10px] text-center bg-slate-50 font-semibold text-slate-500">Physics 201</th>
                <th className="border border-slate-200 p-[10px] text-center bg-slate-50 font-semibold text-slate-500">Chemistry 101</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-200 p-[10px] text-left bg-slate-50 font-semibold text-slate-900">Math 101</td>
                <td className="border border-slate-200 p-[10px] text-center text-slate-400">—</td>
                <td className="border border-slate-200 p-[10px] text-center bg-red-100 text-red-500 font-bold">5</td>
                <td className="border border-slate-200 p-[10px] text-center text-slate-900">0</td>
              </tr>
              <tr>
                <td className="border border-slate-200 p-[10px] text-left bg-slate-50 font-semibold text-slate-900">Physics 201</td>
                <td className="border border-slate-200 p-[10px] text-center bg-red-100 text-red-500 font-bold">5</td>
                <td className="border border-slate-200 p-[10px] text-center text-slate-400">—</td>
                <td className="border border-slate-200 p-[10px] text-center bg-red-100 text-red-500 font-bold">2</td>
              </tr>
              <tr>
                <td className="border border-slate-200 p-[10px] text-left bg-slate-50 font-semibold text-slate-900">Chemistry 101</td>
                <td className="border border-slate-200 p-[10px] text-center text-slate-900">0</td>
                <td className="border border-slate-200 p-[10px] text-center bg-red-100 text-red-500 font-bold">2</td>
                <td className="border border-slate-200 p-[10px] text-center text-slate-400">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
