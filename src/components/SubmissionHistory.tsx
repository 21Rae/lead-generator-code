import React from 'react';
import { SubmittedRecord } from '../types';
import { History, Trash2, Calendar, FileSpreadsheet } from 'lucide-react';

interface SubmissionHistoryProps {
  records: SubmittedRecord[];
  onClear: () => void;
  onSelectRecord: (record: SubmittedRecord) => void;
  onDownloadCSV: (record: SubmittedRecord) => void;
}

export const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({
  records,
  onClear,
  onSelectRecord,
  onDownloadCSV,
}) => {
  if (records.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs mb-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-bold text-slate-900">
            Form Submissions Log ({records.length})
          </h3>
        </div>
        <button
          onClick={onClear}
          id="clear-submissions-btn"
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Log
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {records.map((rec) => (
          <div
            key={rec.id}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-amber-50/40 hover:border-amber-300 transition cursor-pointer group flex flex-col justify-between"
            onClick={() => onSelectRecord(rec)}
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-slate-900 group-hover:text-amber-900">
                    {rec.data.position}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">{rec.data.industry}</p>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  {rec.id}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-1 text-xs text-slate-600 border-t border-slate-200/60 pt-2 mb-3">
                <div><span className="text-slate-400">City:</span> {rec.data.city}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {rec.submittedAt}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadCSV(rec);
                }}
                className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-3 h-3" />
                CSV
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
