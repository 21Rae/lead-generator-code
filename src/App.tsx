import React, { useState, useEffect } from 'react';
import { SearchQueryParams, SavedPipelineRun, EnrichedLeadRow, PipelineExecutionLog } from './types';
import { PipelineSearchForm } from './components/PipelineSearchForm';
import { PipelineLogs } from './components/PipelineLogs';
import { LeadTable } from './components/LeadTable';
import { PipelineHistory } from './components/PipelineHistory';
import { Search, Sparkles, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { downloadCSV } from './utils/csv';

export default function App() {
  const [historyRuns, setHistoryRuns] = useState<SavedPipelineRun[]>([]);
  const [currentRun, setCurrentRun] = useState<SavedPipelineRun | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRunPipeline = async (params: SearchQueryParams) => {
    setIsProcessing(true);
    setErrorMsg(null);

    const querySummary = `${params.jobTitle} • ${params.industry} • ${params.location}`;
    const runId = `RUN-${Date.now().toString(36).toUpperCase()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      const res = await fetch('/api/enrich-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const rawText = await res.text();
      let resData: any = null;
      try {
        resData = JSON.parse(rawText);
      } catch (_) {
        const isHtmlOrTextErr = rawText.trim().startsWith('<') || rawText.trim().toLowerCase().includes('server error') || rawText.trim().toLowerCase().includes('page');
        const errorDetail = isHtmlOrTextErr
          ? `Server Error (${res.status}): ${res.statusText || 'Service temporarily unavailable'}`
          : rawText;
        throw new Error(errorDetail || 'Pipeline execution failed.');
      }

      if (!res.ok || !resData || !resData.success) {
        throw new Error(resData?.error || 'Pipeline execution failed.');
      }

      const newRun: SavedPipelineRun = {
        id: runId,
        timestamp,
        querySummary,
        logs: resData.logs,
        leads: resData.leads || [],
        csvContent: resData.csvContent,
      };

      setCurrentRun(newRun);
      setHistoryRuns((prev) => [newRun, ...prev]);
    } catch (err: any) {
      console.error('Pipeline error:', err);
      setErrorMsg(err?.message || 'Failed to execute lead enrichment pipeline.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-900">
      {/* NAVBAR */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-amber-500 to-emerald-500 rounded-xl text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                LinkedIn Lead Enrichment Agent
              </h1>
            </div>
          </div>


        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* PIPELINE SEARCH FORM */}
        <PipelineSearchForm
          onRunPipeline={handleRunPipeline}
          isProcessing={isProcessing}
        />

        {/* ERROR NOTIFICATION */}
        {errorMsg && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-2xl">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* PIPELINE LOGS REPORT */}
        {currentRun && (
          <>
            <PipelineLogs logs={currentRun.logs} />
            <LeadTable
              leads={currentRun.leads}
              querySummary={currentRun.querySummary}
            />
          </>
        )}

        {/* PIPELINE HISTORY */}
        <PipelineHistory
          runs={historyRuns}
          onSelectRun={(run) => setCurrentRun(run)}
          onClear={() => {
            setHistoryRuns([]);
            setCurrentRun(null);
          }}
          activeRunId={currentRun?.id}
        />
      </main>
    </div>
  );
}
