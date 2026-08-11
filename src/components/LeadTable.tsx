import React, { useState } from 'react';
import { EnrichedLeadRow } from '../types';
import {
  FileSpreadsheet,
  Search,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Mail,
  Phone,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Filter,
  UserCheck,
  Database,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { downloadCSV, leadsToCSV } from '../utils/csv';

interface LeadTableProps {
  leads: EnrichedLeadRow[];
  querySummary?: string;
}

export const LeadTable: React.FC<LeadTableProps> = ({ leads, querySummary }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [completenessFilter, setCompletenessFilter] = useState<'all' | 'full' | 'partial'>('all');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Supabase save states
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSavingAll, setIsSavingAll] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !searchTerm ||
      lead.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.job_company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.headline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.work_email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      completenessFilter === 'all' || lead.enrichment_completeness === completenessFilter;

    return matchesSearch && matchesFilter;
  });

  const handleDownloadThisTableCSV = () => {
    const csvData = leadsToCSV(filteredLeads);
    downloadCSV(csvData, `enriched_leads_${Date.now()}.csv`);
  };

  const handleSaveAllLeads = async () => {
    if (filteredLeads.length === 0) return;

    setIsSavingAll(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/save-supabase-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: filteredLeads }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save leads to Supabase.');
      }

      setIsSaved(true);
      setStatusMsg({
        type: 'success',
        text: `Successfully added all ${filteredLeads.length} leads to the enriched_leads table in Supabase!`,
      });
    } catch (err: any) {
      console.error('Error saving all rows:', err);
      setStatusMsg({
        type: 'error',
        text: err?.message || 'Failed to save leads to Supabase.',
      });
    } finally {
      setIsSavingAll(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-slate-900">Enriched Leads Output</h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {filteredLeads.length} {filteredLeads.length === 1 ? 'Record' : 'Records'}
            </span>
          </div>
          {querySummary && (
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Query: <span className="text-slate-800 font-medium">{querySummary}</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Completeness Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
            <button
              onClick={() => setCompletenessFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                completenessFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setCompletenessFilter('full')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                completenessFilter === 'full' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Verified Email
            </button>
            <button
              onClick={() => setCompletenessFilter('partial')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                completenessFilter === 'partial' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Partial
            </button>
          </div>

          {/* Single Push All to Supabase Button */}
          <button
            onClick={handleSaveAllLeads}
            disabled={isSavingAll || filteredLeads.length === 0}
            id="push-all-supabase-btn"
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white shadow-xs transition cursor-pointer disabled:cursor-not-allowed"
          >
            {isSavingAll ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            <span>{isSavingAll ? 'Pushing All...' : 'Push All to Database'}</span>
          </button>

          {/* CSV Download Button */}
          <button
            onClick={handleDownloadThisTableCSV}
            id="download-lead-table-csv-btn"
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Download CSV
          </button>
        </div>
      </div>

      {/* STATUS NOTIFICATION */}
      {statusMsg && (
        <div
          className={`flex items-center justify-between gap-3 p-3 text-xs font-medium rounded-xl border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button
            onClick={() => setStatusMsg(null)}
            className="text-xs font-bold underline text-slate-500 hover:text-slate-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter leads by name, company, email, or headline..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
      </div>

      {/* TABLE */}
      {filteredLeads.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-xs text-slate-500 font-medium">No enriched leads match your current filter.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-200 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                <th className="px-4 py-3 font-mono text-amber-400">full_name</th>
                <th className="px-3 py-3 font-mono text-emerald-400">sex</th>
                <th className="px-4 py-3 font-mono text-cyan-400">linkedin_url</th>
                <th className="px-5 py-3 font-mono text-slate-300">headline</th>
                <th className="px-4 py-3 font-mono text-indigo-300">job_company_name</th>
                <th className="px-4 py-3 font-mono text-emerald-300">work_email</th>
                <th className="px-4 py-3 font-mono text-rose-300">phone_numbers</th>
                <th className="px-4 py-3 font-mono text-amber-300">company_website</th>
                <th className="px-3 py-3 font-mono text-blue-400">company_facebook</th>
                <th className="px-3 py-3 font-mono text-sky-400">company_twitter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLeads.map((lead, idx) => {
                return (
                  <tr key={idx} className="hover:bg-slate-50/90 transition-colors">
                    {/* full_name */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{lead.full_name}</span>
                        {lead.enrichment_completeness === 'full' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Full Contact Enriched" />
                        )}
                      </div>
                    </td>

                    {/* sex */}
                    <td className="px-3 py-3.5 whitespace-nowrap capitalize text-slate-500">
                      {lead.sex || '-'}
                    </td>

                    {/* linkedin_url */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {lead.linkedin_url ? (
                        <a
                          href={lead.linkedin_url.startsWith('http') ? lead.linkedin_url : `https://${lead.linkedin_url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 font-medium hover:underline"
                        >
                          <Linkedin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span className="max-w-[140px] truncate">{lead.linkedin_url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-300 italic">-</span>
                      )}
                    </td>

                    {/* headline */}
                    <td className="px-5 py-3.5 text-slate-700 min-w-[200px] max-w-xs truncate" title={lead.headline}>
                      {lead.headline || '-'}
                    </td>

                    {/* job_company_name */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{lead.job_company_name || '-'}</span>
                      </div>
                    </td>

                    {/* work_email */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {lead.work_email ? (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-mono text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                            {lead.work_email}
                          </span>
                          <button
                            onClick={() => handleCopy(lead.work_email, `email-${idx}`)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition"
                            title="Copy email"
                          >
                            {copiedField === `email-${idx}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200/60">
                          partial
                        </span>
                      )}
                    </td>

                    {/* phone_numbers */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-slate-700">
                      {lead.phone_numbers ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{lead.phone_numbers}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic">-</span>
                      )}
                    </td>

                    {/* company_website */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {lead.company_website ? (
                        <a
                          href={lead.company_website.startsWith('http') ? lead.company_website : `https://${lead.company_website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-medium"
                        >
                          <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{lead.company_website}</span>
                        </a>
                      ) : (
                        <span className="text-slate-300 italic">-</span>
                      )}
                    </td>

                    {/* company_facebook */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {lead.company_facebook ? (
                        <a
                          href={lead.company_facebook.startsWith('http') ? lead.company_facebook : `https://${lead.company_facebook}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Facebook className="w-3.5 h-3.5 shrink-0" />
                          <span className="max-w-[100px] truncate">{lead.company_facebook}</span>
                        </a>
                      ) : (
                        <span className="text-slate-300 italic">-</span>
                      )}
                    </td>

                    {/* company_twitter */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {lead.company_twitter ? (
                        <a
                          href={lead.company_twitter.startsWith('http') ? lead.company_twitter : `https://${lead.company_twitter}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-500 hover:underline flex items-center gap-1"
                        >
                          <Twitter className="w-3.5 h-3.5 shrink-0" />
                          <span className="max-w-[100px] truncate">{lead.company_twitter}</span>
                        </a>
                      ) : (
                        <span className="text-slate-300 italic">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
