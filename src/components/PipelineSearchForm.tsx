import React, { useState } from 'react';
import { SearchQueryParams } from '../types';
import {
  Briefcase,
  Building2,
  MapPin,
  Search,
  Sparkles,
  Sliders,
  Play,
  Loader2,
  Wand2
} from 'lucide-react';

interface PipelineSearchFormProps {
  onRunPipeline: (params: SearchQueryParams) => void;
  isProcessing: boolean;
}

export const PipelineSearchForm: React.FC<PipelineSearchFormProps> = ({
  onRunPipeline,
  isProcessing,
}) => {
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [minLikelihoodScore, setMinLikelihoodScore] = useState(7);
  const [customQuery, setCustomQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [aiPrompt, setAiPrompt] = useState('');
  const [isExtractingAi, setIsExtractingAi] = useState(false);

  const handleAiExtract = async () => {
    if (!aiPrompt.trim()) return;
    setIsExtractingAi(true);
    try {
      const res = await fetch('/api/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt: aiPrompt }),
      });
      const data = await res.json();
      if (data.success && data.profile) {
        if (data.profile.position) setJobTitle(data.profile.position);
        if (data.profile.industry) setIndustry(data.profile.industry);
        if (data.profile.city) setLocation(data.profile.city);
      }
    } catch (err) {
      console.error('Failed to extract params via AI:', err);
    } finally {
      setIsExtractingAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRunPipeline({
      jobTitle,
      industry,
      location,
      customQuery: customQuery.trim() || undefined,
      minLikelihoodScore,
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
      {/* FORM HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900">Lead Enrichment Parameters</h2>
          <p className="text-xs text-slate-500">Specify search criteria to find and enrich target LinkedIn profiles.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-slate-500" />
          {showAdvanced ? 'Hide Settings' : 'Advanced Settings'}
        </button>
      </div>

      {/* SEARCH FORM INPUTS */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Job Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Target Job Title
            </label>
            <div className="relative">
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Field Engineer"
                required
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition font-medium text-slate-900"
              />
              <Briefcase className="w-4 h-4 text-amber-500 absolute left-3 top-3" />
            </div>
          </div>

          {/* Industry */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Industry or Company
            </label>
            <div className="relative">
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Construction"
                required
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition font-medium text-slate-900"
              />
              <Building2 className="w-4 h-4 text-emerald-500 absolute left-3 top-3" />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Location / City
            </label>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Austin, TX"
                required
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition font-medium text-slate-900"
              />
              <MapPin className="w-4 h-4 text-rose-500 absolute left-3 top-3" />
            </div>
          </div>
        </div>

        {/* ADVANCED SETTINGS PANEL */}
        {showAdvanced && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs animate-in fade-in duration-150">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Custom Google Search Query Override (Optional)
              </label>
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder={`site:linkedin.com/in "${jobTitle}" "${industry}" "${location}"`}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Leave empty to automatically generate from the inputs above.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/80">
              <div>
                <span className="font-bold text-slate-700">Minimum PDL Likelihood Score: </span>
                <span className="font-mono text-amber-600 font-bold ml-1">{minLikelihoodScore} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={minLikelihoodScore}
                onChange={(e) => setMinLikelihoodScore(parseInt(e.target.value, 10))}
                className="w-48 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* RUN BUTTON */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500 font-mono hidden sm:block">
            Query Preview: <span className="text-slate-800 font-medium">site:linkedin.com/in "{jobTitle}" "{industry}" "{location}"</span>
          </div>

          <button
            type="submit"
            id="run-pipeline-btn"
            disabled={isProcessing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Lead Agent Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Lead Enrichment Pipeline</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
