import React from 'react';
import { SavedPipelineRun } from '../types';
import {
  History,
  Trash2,
  FileSpreadsheet,
  Calendar,
  Layers,
  ChevronRight,
  Database
} from 'lucide-react';
import { downloadCSV } from '../utils/csv';

interface PipelineHistoryProps {
  runs: SavedPipelineRun[];
  onSelectRun: (run: SavedPipelineRun) => void;
  onClear: () => void;
  activeRunId?: string;
}

export const PipelineHistory: React.FC<PipelineHistoryProps> = ({
  runs,
  onSelectRun,
  onClear,
  activeRunId,
}) => {
  if (runs.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Pipeline Search History
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {runs.length} {runs.length === 1 ? 'Run' : 'Runs'}
          </span>
        </div>

        <button
          onClick={onClear}
          type="button"
          className="text-xs font-medium text-slate-400 hover:text-rose-600 flex items-center gap-1 transition cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear Runs</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {runs.map((run) => {
          const isActive = run.id === activeRunId;
          return (
            <div
              key={run.id}
              onClick={() => onSelectRun(run)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {run.timestamp}
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                    {run.leads.length} leads
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 truncate" title={run.querySummary}>
                  {run.querySummary}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Database className="w-3 h-3 text-slate-400" />
                  {run.logs.serpApiUsed ? 'SerpAPI' : 'SmartSearch'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadCSV(run.csvContent, `leads_${run.id}.csv`);
                  }}
                  className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-bold hover:underline"
                >
                  <FileSpreadsheet className="w-3 h-3" />
                  <span>CSV</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
