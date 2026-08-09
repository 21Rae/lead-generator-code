export function cleanColumnName(name: string): string {
  if (!name) return '';
  let cleaned = name.trim();
  // Strip quotes if wrapped
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  // Strip leading 'data.' or 'data[' or 'data' prefix
  if (cleaned.startsWith('data.')) {
    cleaned = cleaned.substring(5);
  } else if (cleaned.startsWith('data[')) {
    cleaned = cleaned.replace(/^data\[\d+\]\.?/, '');
    if (!cleaned) cleaned = name;
  }
  return cleaned;
}

export function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};
  if (!obj || typeof obj !== 'object') return result;

  for (const rawKey of Object.keys(obj)) {
    // Clean key if prefix is empty or append
    const cleanKey = cleanColumnName(rawKey);
    const propName = prefix ? `${prefix}.${cleanKey}` : cleanKey;
    const val = obj[rawKey];

    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, flattenObject(val, propName));
    } else if (Array.isArray(val)) {
      if (val.length === 0) {
        result[propName] = '';
      } else if (val.every((item) => typeof item !== 'object' || item === null)) {
        result[propName] = val.join('; ');
      } else {
        val.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            Object.assign(result, flattenObject(item, `${propName}[${index}]`));
          } else {
            result[`${propName}[${index}]`] = String(item);
          }
        });
      }
    } else {
      result[propName] = val ?? '';
    }
  }
  return result;
}

export function parseTextToKeyValue(text: string): Record<string, string> {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const result: Record<string, string> = {};
  if (lines.length === 0) return result;

  // Helper to test if string looks like a field key rather than a value
  const isKey = (str: string): boolean => {
    if (!str) return false;
    if (str.endsWith(':') || str.endsWith('=')) return true;
    
    // Values that are definitely NOT field names:
    if (str.includes(' ') || str.includes('@') || str.includes('http://') || str.includes('https://')) {
      return false;
    }
    if (/\.(com|org|net|io|co|edu|gov|me|ai|app|info)($|\/)/i.test(str)) {
      return false;
    }
    // Specific values
    if (['male', 'female', 'other', 'yes', 'no', 'true', 'false'].includes(str.toLowerCase())) {
      return false;
    }

    // Standard field keys pattern (e.g. full_name, sex, linkedin_url, experience[0])
    if (/^[a-zA-Z_][a-zA-Z0-9_\-\.\[\]]*$/.test(str)) {
      return true;
    }
    return false;
  };

  let i = 0;
  while (i < lines.length) {
    const current = lines[i];
    const next = lines[i + 1];

    if (current.includes(':')) {
      const parts = current.split(':');
      const rawK = parts[0].trim();
      const val = parts.slice(1).join(':').trim();
      result[cleanColumnName(rawK)] = val;
      i++;
      continue;
    }

    const currentKeyName = cleanColumnName(current);

    if (next !== undefined) {
      if (isKey(current) && isKey(next)) {
        // Current is a key with an empty value
        result[currentKeyName] = '';
        i++;
      } else if (isKey(current)) {
        // Current is key, next is value
        result[currentKeyName] = next;
        i += 2;
      } else {
        result[`field_${i + 1}`] = current;
        i++;
      }
    } else {
      if (isKey(current)) {
        result[currentKeyName] = '';
      } else {
        result[`field_${i + 1}`] = current;
      }
      i++;
    }
  }

  return result;
}

export function convertToCSV(
  webhookResponse: any,
  fallbackData?: { id: string; submittedAt: string; position: string; industry: string; city: string }
): string {
  // Case 1: webhookResponse is a string
  if (typeof webhookResponse === 'string') {
    const trimmed = webhookResponse.trim();
    if (!trimmed) return formatFallbackCSV(fallbackData);

    // Try parsing as JSON first
    try {
      const parsed = JSON.parse(trimmed);
      return convertToCSV(parsed, fallbackData);
    } catch {
      // Check if it's already a valid CSV string (contains headers with commas and newlines)
      const lines = trimmed.split(/\r?\n/).filter(Boolean);
      if (lines.length > 1 && lines[0].includes(',') && lines[1].includes(',')) {
        // Clean any headers starting with data.
        const headerParts = lines[0].split(',').map((h) => cleanColumnName(h));
        const cleanHeaderLine = headerParts.map((h) => `"${h.replace(/"/g, '""')}"`).join(',');
        return [cleanHeaderLine, ...lines.slice(1)].join('\n');
      }

      // Parse as plain text key-value list
      const parsedKv = parseTextToKeyValue(trimmed);
      if (Object.keys(parsedKv).length > 0) {
        return objectToCSV(parsedKv);
      }
      return trimmed;
    }
  }

  // Case 2: Array of objects or values
  if (Array.isArray(webhookResponse) && webhookResponse.length > 0) {
    const flattenedArray = webhookResponse.map((item) =>
      typeof item === 'object' && item !== null ? flattenObject(item) : { value: String(item) }
    );
    const rawKeys = Array.from(new Set(flattenedArray.flatMap((item) => Object.keys(item))));
    const cleanKeys = rawKeys.map((rk) => cleanColumnName(rk));

    if (rawKeys.length > 0) {
      const header = cleanKeys.map((k) => `"${k.replace(/"/g, '""')}"`).join(',');
      const rows = flattenedArray.map((item) =>
        rawKeys
          .map((rk) => {
            const val = item[rk];
            const str = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '');
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(',')
      );
      return [header, ...rows].join('\n');
    }
  }

  // Case 3: Object (including n8n response objects)
  if (webhookResponse && typeof webhookResponse === 'object') {
    let dataToProcess = webhookResponse;
    if (Array.isArray(webhookResponse.data)) {
      dataToProcess = webhookResponse.data;
      return convertToCSV(dataToProcess, fallbackData);
    } else if (webhookResponse.data && typeof webhookResponse.data === 'object') {
      dataToProcess = webhookResponse.data;
    } else if (Array.isArray(webhookResponse.items)) {
      dataToProcess = webhookResponse.items;
      return convertToCSV(dataToProcess, fallbackData);
    }

    const flattened = flattenObject(dataToProcess);
    if (Object.keys(flattened).length > 0) {
      return objectToCSV(flattened);
    }
  }

  // Case 4: Fallback payload
  return formatFallbackCSV(fallbackData);
}

function objectToCSV(obj: Record<string, any>): string {
  const rawKeys = Object.keys(obj);
  if (rawKeys.length === 0) return '';
  const cleanKeys = rawKeys.map((k) => cleanColumnName(k));
  const headers = cleanKeys.map((k) => `"${String(k).replace(/"/g, '""')}"`).join(',');
  const values = rawKeys
    .map((k) => {
      const v = obj[k];
      const str = typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? '');
      return `"${str.replace(/"/g, '""')}"`;
    })
    .join(',');
  return `${headers}\n${values}`;
}

function formatFallbackCSV(fallbackData?: { id: string; submittedAt: string; position: string; industry: string; city: string }): string {
  if (fallbackData) {
    const headers = '"ID","SubmittedAt","Position","Industry","City"';
    const values = `"${fallbackData.id}","${fallbackData.submittedAt}","${(
      fallbackData.position || ''
    ).replace(/"/g, '""')}","${(fallbackData.industry || '').replace(
      /"/g,
      '""'
    )}","${(fallbackData.city || '').replace(/"/g, '""')}"`;
    return `${headers}\n${values}`;
  }
  return '"Response"\n"No data returned from webhook"';
}

export interface TableData {
  headers: string[];
  rows: Record<string, string>[];
}

export function parseCSVToTable(csvContent: string): TableData {
  if (!csvContent || !csvContent.trim()) {
    return { headers: [], rows: [] };
  }

  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    return values;
  };

  const rawHeaders = parseCSVLine(lines[0]);
  const headers = rawHeaders.map((h) => cleanColumnName(h));

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const rowObj: Record<string, string> = {};
    headers.forEach((h, index) => {
      rowObj[h] = values[index] ?? '';
    });
    rows.push(rowObj);
  }

  if (rows.length === 0 && headers.length > 0) {
    const dummyRow: Record<string, string> = {};
    headers.forEach((h) => (dummyRow[h] = ''));
    rows.push(dummyRow);
  }

  return { headers, rows };
}

export function leadsToCSV(leads: any[]): string {
  if (!leads || leads.length === 0) {
    return `"full_name","sex","linkedin_url","headline","job_company_name","work_email","phone_numbers","company_website","company_facebook","company_twitter"\n`;
  }

  const columns = [
    'full_name',
    'sex',
    'linkedin_url',
    'headline',
    'job_company_name',
    'work_email',
    'phone_numbers',
    'company_website',
    'company_facebook',
    'company_twitter',
    'source_query',
    'date_enriched',
  ];

  const headerRow = columns.map((col) => `"${col}"`).join(',');
  const dataRows = leads.map((lead) =>
    columns
      .map((col) => {
        const val = lead[col] ?? '';
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

export function downloadCSV(csvContent: string, filename: string = 'webhook_response.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
