import React, { useMemo, useState } from 'react';
import { Conflict } from '@/lib/excelParser';
import { Search, ArrowUpDown, AlertTriangle, BookOpen, Download, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardProps {
  conflicts: Conflict[];
  courses: string[];
  onReset: () => void;
}

type SortField = 'course1' | 'course2' | 'conflictCount';
type SortOrder = 'asc' | 'desc';

export function Dashboard({ conflicts, courses, onReset }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('conflictCount');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedCourse, setSelectedCourse] = useState<string>('All');

  const filteredAndSortedConflicts = useMemo(() => {
    let result = conflicts;

    // Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        c => c.course1.toLowerCase().includes(lowerSearch) || 
             c.course2.toLowerCase().includes(lowerSearch)
      );
    }

    // Filter by selected course
    if (selectedCourse !== 'All') {
      result = result.filter(
        c => c.course1 === selectedCourse || c.course2 === selectedCourse
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'conflictCount') {
        comparison = a.conflictCount - b.conflictCount;
      } else {
        comparison = a[sortField].localeCompare(b[sortField]);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [conflicts, searchTerm, sortField, sortOrder, selectedCourse]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Course 1', 'Course 2', 'Conflict Count'];
    const rows = filteredAndSortedConflicts.map(c => [
      `"${c.course1}"`,
      `"${c.course2}"`,
      c.conflictCount
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'course_conflicts.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats
  const totalConflicts = conflicts.length;
  const totalStudentsAffected = conflicts.reduce((sum, c) => sum + c.conflictCount, 0);
  
  // Find most conflicted course
  const courseConflictCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    conflicts.forEach(c => {
      counts[c.course1] = (counts[c.course1] || 0) + c.conflictCount;
      counts[c.course2] = (counts[c.course2] || 0) + c.conflictCount;
    });
    return counts;
  }, [conflicts]);

  const mostConflictedCourse = Object.entries(courseConflictCounts)
    .sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="w-full flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Conflict Analysis Results</h2>
          <p className="text-slate-500 mt-1 text-[13px]">Review and manage scheduling conflicts between courses.</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="bg-green-500 text-white text-[11px] px-[10px] py-1 rounded-full uppercase tracking-[0.5px] font-semibold hidden sm:inline-block">Analysis Complete</span>
          <button
            onClick={exportToCSV}
            className="bg-white border border-slate-200 text-slate-900 px-4 py-2.5 rounded-md font-semibold text-[13px] hover:bg-slate-50 transition-colors inline-flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
          <button
            onClick={onReset}
            className="bg-blue-600 text-white border-none px-4 py-2.5 rounded-md font-semibold text-[13px] hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            Upload New File
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col justify-center">
          <div className="text-[13px] text-slate-500 mb-1">Total Conflicts</div>
          <div className="text-2xl font-bold text-slate-900">{totalConflicts}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col justify-center">
          <div className="text-[13px] text-slate-500 mb-1">Students Affected</div>
          <div className="text-2xl font-bold text-blue-600">{totalStudentsAffected}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col justify-center">
          <div className="text-[13px] text-slate-500 mb-1">Most Conflicted</div>
          <div className="text-lg font-bold text-red-500 truncate" title={mostConflictedCourse?.[0]}>
            {mostConflictedCourse?.[0] || 'N/A'}
          </div>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 sm:text-[13px] transition-colors"
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="block w-full sm:w-64 pl-3 pr-10 py-2 text-[13px] border-slate-200 focus:outline-none focus:ring-blue-600 focus:border-blue-600 rounded-md border bg-white"
            >
              <option value="All">All Courses</option>
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                <th 
                  scope="col" 
                  className="border border-slate-200 p-[10px] text-center bg-slate-50 font-semibold text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('course1')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Course 1</span>
                    <ArrowUpDown className={cn("h-3 w-3", sortField === 'course1' ? "text-blue-600" : "text-slate-400")} />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="border border-slate-200 p-[10px] text-center bg-slate-50 font-semibold text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('course2')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Course 2</span>
                    <ArrowUpDown className={cn("h-3 w-3", sortField === 'course2' ? "text-blue-600" : "text-slate-400")} />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="border border-slate-200 p-[10px] text-center bg-slate-50 font-semibold text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('conflictCount')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Conflict Count</span>
                    <ArrowUpDown className={cn("h-3 w-3", sortField === 'conflictCount' ? "text-blue-600" : "text-slate-400")} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedConflicts.length > 0 ? (
                filteredAndSortedConflicts.map((conflict) => (
                  <tr key={conflict.id} className="hover:bg-slate-50 transition-colors">
                    <td className="border border-slate-200 p-[10px] text-left bg-slate-50 font-semibold text-slate-900 w-[40%]">
                      {conflict.course1}
                    </td>
                    <td className="border border-slate-200 p-[10px] text-center text-slate-900 w-[40%]">
                      {conflict.course2}
                    </td>
                    <td className="border border-slate-200 p-[10px] text-center">
                      <span className={cn(
                        "inline-flex items-center justify-center px-2 py-1 rounded text-[11px] font-bold",
                        conflict.conflictCount >= 10 ? "bg-red-100 text-red-500" :
                        conflict.conflictCount >= 5 ? "bg-orange-100 text-orange-600" :
                        "bg-slate-100 text-slate-600"
                      )}>
                        {conflict.conflictCount} students
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="border border-slate-200 p-[10px] py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <AlertTriangle className="h-8 w-8 text-slate-300 mb-2" />
                      <p>No conflicts found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-[12px] text-slate-500">
          Showing {filteredAndSortedConflicts.length} of {conflicts.length} total conflicts
        </div>
      </div>
    </div>
  );
}
