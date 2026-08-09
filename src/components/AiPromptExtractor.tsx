import React, { useState } from 'react';
import { ProfileFormData } from '../types';
import { Sparkles, Loader2, Cpu, Check } from 'lucide-react';

interface AiPromptExtractorProps {
  onProfileExtracted: (profile: ProfileFormData) => void;
}

const PRESET_EXAMPLES = [
  "Field Engineer in Construction, Austin, TX",
  "Site Inspector, Civil Infrastructure, Chicago",
  "Project Manager in Commercial Building, New York",
];

export const AiPromptExtractor: React.FC<AiPromptExtractorProps> = ({ onProfileExtracted }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleExtract = async (customPrompt?: string) => {
    const promptToUse = customPrompt !== undefined ? customPrompt : prompt;
    if (!promptToUse.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt: promptToUse }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate profile');
      }

      onProfileExtracted(data.profile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error processing prompt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              AI Profile Extractor
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                System &amp; User Roles
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Extracts position, industry, and city into structured JSON format from natural language.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <textarea
            id="ai-user-prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g. "field engineer, mid-level, US"'
            rows={2}
            className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition font-medium text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* PRESET PROMPTS */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <span className="text-[11px] font-medium text-slate-400">Quick examples:</span>
          {PRESET_EXAMPLES.map((ex, idx) => (
            <button
              key={idx}
              type="button"
              id={`preset-prompt-btn-${idx}`}
              onClick={() => {
                setPrompt(ex);
                handleExtract(ex);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 rounded-lg text-xs font-medium border border-slate-200/80 hover:border-amber-200 transition cursor-pointer"
            >
              "{ex}"
            </button>
          ))}
        </div>

        {error && (
          <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Cpu className="w-3.5 h-3.5 text-amber-500" />
            <span>Role-based structured extraction active</span>
          </div>

          <button
            type="button"
            id="extract-ai-profile-btn"
            disabled={loading || !prompt.trim()}
            onClick={() => handleExtract()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : success ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Extracted &amp; Populated!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Extract Profile</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
