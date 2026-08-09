import React from 'react';
import { ProfileFormData } from '../types';
import { 
  Briefcase, 
  Building2, 
  MapPin,
  Send,
  Loader2
} from 'lucide-react';

interface FormFieldsProps {
  formData: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
}

export const FormFields: React.FC<FormFieldsProps> = ({
  formData,
  onChange,
  onSubmit,
  isSubmitting = false,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6" id="construction-profile-form">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Profile Form</h2>
            <p className="text-xs text-slate-500">Position, Industry, and City fields</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Position */}
          <div>
            <label htmlFor="position" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Position
            </label>
            <div className="relative">
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={(e) => onChange('position', e.target.value)}
                placeholder="e.g. Field Engineer"
                required
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition font-medium text-slate-800"
              />
              <Briefcase className="w-4 h-4 text-amber-500 absolute left-3 top-3" />
            </div>
          </div>

          {/* 2. Industry */}
          <div>
            <label htmlFor="industry" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Industry
            </label>
            <div className="relative">
              <input
                type="text"
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={(e) => onChange('industry', e.target.value)}
                placeholder="e.g. Construction"
                required
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition font-medium text-slate-800"
              />
              <Building2 className="w-4 h-4 text-emerald-500 absolute left-3 top-3" />
            </div>
          </div>

          {/* 3. City */}
          <div>
            <label htmlFor="city" className="block text-xs font-semibold text-slate-700 mb-1.5">
              City
            </label>
            <div className="relative">
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={(e) => onChange('city', e.target.value)}
                placeholder="e.g. Austin, TX"
                required
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition font-medium text-slate-800"
              />
              <MapPin className="w-4 h-4 text-rose-500 absolute left-3 top-3" />
            </div>
          </div>
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          id="submit-profile-btn"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending to n8n...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit to Webhook</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

