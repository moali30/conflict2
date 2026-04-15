/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { parseExcel, Conflict } from './lib/excelParser';
import { CalendarDays } from 'lucide-react';

export default function App() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await parseExcel(file);
      if (data.conflicts.length === 0) {
        setError("No conflicts found in the file. Please ensure it's formatted correctly.");
      } else {
        setConflicts(data.conflicts);
        setCourses(data.courses);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to parse the file. Please ensure it's a valid Excel or CSV file.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setConflicts([]);
    setCourses([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      <header className="bg-white border-b border-slate-200 h-[60px] flex items-center shrink-0 px-6">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-[10px] font-bold text-blue-600 text-[18px]">
            <CalendarDays className="w-5 h-5" />
            <span>Course Conflict Analyzer</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-5">
        {conflicts.length === 0 ? (
          <div className="max-w-3xl mx-auto w-full">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Detect Scheduling Conflicts
              </h2>
              <p className="mt-4 text-lg text-slate-500">
                Upload your course conflict matrix to automatically identify and analyze overlapping student enrollments between subjects.
              </p>
            </div>
            <FileUpload 
              onFileSelect={handleFileSelect} 
              isLoading={isLoading} 
              error={error} 
            />
          </div>
        ) : (
          <Dashboard 
            conflicts={conflicts} 
            courses={courses} 
            onReset={handleReset} 
          />
        )}
        </div>
      </main>
    </div>
  );
}
