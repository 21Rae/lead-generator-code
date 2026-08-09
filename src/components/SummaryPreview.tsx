import React, { useState } from 'react';
import { ProfileFormData } from '../types';
import { 
  Copy, 
  Check, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  UserCheck, 
  Building2, 
  Layers, 
  Users, 
  Calendar,
  FileText,
  CheckCircle2
} from 'lucide-react';

interface SummaryPreviewProps {
  formData: ProfileFormData;
}

export const SummaryPreview: React.FC<SummaryPreviewProps> = ({ formData }) => {
  const [copiedType, setCopiedType] = useState<'json' | 'text' | null>(null);

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
    setCopiedType('json');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyText = () => {
    const text = `
Age group- ${formData.ageGroup}
Job type- ${formData.jobType}
Location- ${formData.location}
Seniority level- ${formData.seniorityLevel}
Salary range- ${formData.salaryRange}
Employment sector- ${formData.employmentSector}
Department- ${formData.department}
Job title- ${formData.jobTitle}
Reports to- ${formData.reportsTo}
Job location- ${formData.jobLocation}
`.trim();

    navigator.clipboard.writeText(text);
    setCopiedType('text');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const fieldsList = [
    { label: 'Age group', val: formData.ageGroup, icon: Calendar, target: '40-60' },
    { label: 'Job type', val: formData.jobType, icon: Briefcase, target: 'Construction' },
    { label: 'Location', val: formData.location, icon: MapPin, target: 'US' },
    { label: 'Seniority level', val: formData.seniorityLevel, icon: UserCheck, target: 'mid/high' },
    { label: 'Salary range', val: formData.salaryRange, icon: DollarSign, target: '$6000-$10000' },
    { label: 'Employment sector', val: formData.employmentSector, icon: Building2, target: 'Construction' },
    { label: 'Department', val: formData.department, icon: Layers, target: 'Operations/Field engineering' },
    { label: 'Job title', val: formData.jobTitle, icon: FileText, target: 'Field engineer/Site operator' },
    { label: 'Reports to', val: formData.reportsTo, icon: Users, target: 'Operations Manager' },
    { label: 'Job location', val: formData.jobLocation, icon: MapPin, target: 'US' },
  ];

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-xl border border-slate-800 sticky top-24">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-semibold text-white">Live Form Values</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            id="copy-summary-text-btn"
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition cursor-pointer"
            title="Copy summary formatted text"
          >
            {copiedType === 'text' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedType === 'text' ? 'Copied' : 'Copy Text'}
          </button>
          <button
            onClick={handleCopyJSON}
            id="copy-summary-json-btn"
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition cursor-pointer"
            title="Copy as raw JSON"
          >
            {copiedType === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedType === 'json' ? 'Copied' : 'Copy JSON'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 text-sm">
        {fieldsList.map((spec, idx) => {
          const Icon = spec.icon;
          const isMatched = spec.val.trim().toLowerCase() === spec.target.trim().toLowerCase();

          return (
            <div 
              key={idx} 
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-md bg-slate-700/50 text-slate-300 shrink-0">
                  <Icon className="w-4 h-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-400 leading-tight">{spec.label}</p>
                  <p className="text-sm font-semibold text-slate-100 truncate mt-0.5">{spec.val}</p>
                </div>
              </div>
              
              <div className="shrink-0 ml-2">
                {isMatched ? (
                  <span className="inline-flex items-center text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                    Exact Match
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800/50">
                    Modified
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
