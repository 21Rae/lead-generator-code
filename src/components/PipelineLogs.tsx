import React from 'react';
import { PipelineExecutionLog } from '../types';
import {
  CheckCircle2,
  Search,
  Filter,
  UserCheck,
  FileSpreadsheet,
  Activity,
  Layers,
  Key,
  Webhook
} from 'lucide-react';

interface PipelineLogsProps {
  logs: PipelineExecutionLog;
  webhookSent?: boolean;
  webhookMessage?: string;
}

export const PipelineLogs: React.FC<PipelineLogsProps> = ({
  logs,
  webhookSent,
  webhookMessage,
}) => {
  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-md space-y-5 font-sans">
      {/* TOP TITLE & API KEY BADGES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Pipeline Execution Report
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span
            className={`px-2.5 py-0.5 rounded-md border ${
              logs.serpApiUsed
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                : 'bg-amber-950 text-amber-300 border-amber-800'
            }`}
          >
            SerpAPI: {logs.serpApiUsed ? 'Active Key' : 'Smart Search'}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-md border ${
              logs.pdlUsed
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                : 'bg-indigo-950 text-indigo-300 border-indigo-800'
            }`}
          >
            PDL Enrich: {logs.pdlUsed ? 'Verified API' : 'Engineered Match'}
          </span>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Search className="w-3.5 h-3.5 text-sky-400" />
            <span>1. Found</span>
          </div>
          <p className="text-xl font-bold font-mono text-sky-400">{logs.leads_found}</p>
          <p className="text-[10px] text-slate-500">Google Serp profiles</p>
        </div>

        <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>2. Deduped</span>
          </div>
          <p className="text-xl font-bold font-mono text-amber-400">{logs.leads_deduped}</p>
          <p className="text-[10px] text-slate-500">Unique LinkedIn URLs</p>
        </div>

        <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>3. Enriched</span>
          </div>
          <p className="text-xl font-bold font-mono text-indigo-400">{logs.leads_enriched}</p>
          <p className="text-[10px] text-slate-500">Contact & Company data</p>
        </div>

        <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>4. Output CSV</span>
          </div>
          <p className="text-xl font-bold font-mono text-emerald-400">{logs.leads_written}</p>
          <p className="text-[10px] text-slate-500">Rows formatted</p>
        </div>
      </div>

      {/* PIPELINE STEPPER FLOW */}
      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
        <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          Pipeline Execution Stage Sequence
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="px-2 py-1 bg-slate-800 text-sky-300 rounded border border-slate-700 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-sky-400" />
            SerpAPI Search
          </span>
          <span className="text-slate-600">→</span>
          <span className="px-2 py-1 bg-slate-800 text-amber-300 rounded border border-slate-700 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-amber-400" />
            Dedupe URLs
          </span>
          <span className="text-slate-600">→</span>
          <span className="px-2 py-1 bg-slate-800 text-indigo-300 rounded border border-slate-700 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-indigo-400" />
            PDL Enrich
          </span>
          <span className="text-slate-600">→</span>
          <span className="px-2 py-1 bg-slate-800 text-emerald-300 rounded border border-slate-700 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Flatten & CSV Output
          </span>
        </div>
      </div>

      {/* WEBHOOK STATUS MESSAGES */}
      {webhookMessage && (
        <div className="flex items-center gap-2 p-3 bg-slate-800 rounded-xl border border-slate-700 text-xs text-slate-300 font-mono">
          <Webhook className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{webhookMessage}</span>
        </div>
      )}
    </div>
  );
};
