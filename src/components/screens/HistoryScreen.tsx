import React, { useState } from 'react';
import { 
  Search, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  MoreVertical, 
  Filter, 
  Download,
  Trash2,
  RefreshCw,
  Eye
} from 'lucide-react';
import { TranslationJob, JobStatus } from '../../types';

interface HistoryScreenProps {
  jobs: TranslationJob[];
  onSelectJob: (job: TranslationJob) => void;
  onDeleteJob?: (jobId: string) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  jobs,
  onSelectJob,
  onDeleteJob,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'completed') return matchesSearch && job.status === 'completed';
    if (statusFilter === 'processing') return matchesSearch && (job.status === 'translating' || job.status === 'analyzing' || job.status === 'extracting' || job.status === 'rebuilding');
    if (statusFilter === 'failed') return matchesSearch && (job.status === 'failed' || job.status === 'cancelled');
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title & Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access past translations, audit logs, and downloaded vector documents.
          </p>
        </div>

        {/* Search Bar (Matching Image 9) */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Grid: Left Filters Sidebar (1 Col) + Right Job List (3 Cols) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Filters Sidebar (Matching Image 9) */}
        <div className="md:col-span-1 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filters</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                STATUS
              </span>
              <div className="space-y-2 text-xs">
                <label className="flex items-center space-x-2.5 text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="status_filter"
                    checked={statusFilter === 'all'}
                    onChange={() => setStatusFilter('all')}
                    className="text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>All ({jobs.length})</span>
                </label>

                <label className="flex items-center space-x-2.5 text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="status_filter"
                    checked={statusFilter === 'completed'}
                    onChange={() => setStatusFilter('completed')}
                    className="text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Completed ({jobs.filter(j => j.status === 'completed').length})</span>
                </label>

                <label className="flex items-center space-x-2.5 text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="status_filter"
                    checked={statusFilter === 'processing'}
                    onChange={() => setStatusFilter('processing')}
                    className="text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Processing ({jobs.filter(j => j.status === 'translating' || j.status === 'analyzing').length})</span>
                </label>

                <label className="flex items-center space-x-2.5 text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="status_filter"
                    checked={statusFilter === 'failed'}
                    onChange={() => setStatusFilter('failed')}
                    className="text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Failed ({jobs.filter(j => j.status === 'failed' || j.status === 'cancelled').length})</span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                STORAGE COMPLIANCE
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Documents are automatically purged after 30 days unless pinned.
              </p>
            </div>
          </div>
        </div>

        {/* Right Job List (Matching Image 9) */}
        <div className="md:col-span-3 space-y-3">
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No translation records found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or filter criteria.</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => onSelectJob(job)}
                className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-sm p-4 sm:p-5 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* File Info Left */}
                <div className="flex items-center space-x-4 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate max-w-sm">
                      {job.filename}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="font-mono text-[11px]">{job.createdAt}</span>
                      <span>•</span>
                      <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {job.sourceLang} → {job.targetLang}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-slate-400">{job.fileSize}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badges & Action Right */}
                <div className="flex items-center space-x-4 self-end sm:self-center">
                  {job.status === 'completed' && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Completed</span>
                    </span>
                  )}

                  {(job.status === 'translating' || job.status === 'analyzing' || job.status === 'extracting') && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1.5">
                      <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                      <span>Processing ({job.progress}%)</span>
                    </span>
                  )}

                  {job.status === 'failed' && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center space-x-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Failed (OCR Error)</span>
                    </span>
                  )}

                  {job.status === 'cancelled' && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Cancelled</span>
                    </span>
                  )}

                  <div className="text-slate-400 hover:text-slate-600 p-1">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

              </div>
            ))
          )}

          {/* Pagination Footer (Matching Image 9) */}
          <div className="pt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Showing 1-{filteredJobs.length} of {filteredJobs.length} results</span>
            
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setCurrentPage(1)}
                className={`w-7 h-7 rounded border flex items-center justify-center font-medium ${
                  currentPage === 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                1
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
