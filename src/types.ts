export interface SearchQueryParams {
  jobTitle: string;
  industry: string;
  location: string;
  customQuery?: string;
  maxPages?: number;
  minLikelihoodScore?: number;
}

export interface ExtractedLead {
  full_name: string;
  linkedin_url: string;
  raw_title?: string;
}

export interface EnrichedLeadRow {
  full_name: string;
  sex: string;
  linkedin_url: string;
  headline: string;
  job_company_name: string;
  work_email: string;
  phone_numbers: string;
  company_website: string;
  company_facebook: string;
  company_twitter: string;
  source_query?: string;
  date_enriched?: string;
  enrichment_completeness?: 'full' | 'partial';
  likelihood_score?: number;
  [key: string]: any;
}

export interface PipelineExecutionLog {
  query: string;
  leads_found: number;
  leads_deduped: number;
  leads_enriched: number;
  leads_written: number;
  serpApiUsed: boolean;
  pdlUsed: boolean;
  timestamp: string;
}

export interface PipelineResponse {
  success: boolean;
  logs: PipelineExecutionLog;
  leads: EnrichedLeadRow[];
  csvContent: string;
  error?: string;
  webhookSent?: boolean;
  webhookStatusMessage?: string;
}

export interface SavedPipelineRun {
  id: string;
  timestamp: string;
  querySummary: string;
  logs: PipelineExecutionLog;
  leads: EnrichedLeadRow[];
  csvContent: string;
}

export interface ProfileFormData {
  position: string;
  industry: string;
  city: string;
}

export interface SubmittedRecord {
  id: string;
  submittedAt: string;
  data: ProfileFormData;
  webhookConfigured?: boolean;
  webhookStatusMessage?: string;
  webhookResponse?: any;
  csvContent?: string;
}
