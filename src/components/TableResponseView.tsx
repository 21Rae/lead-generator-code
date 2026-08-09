import React from 'react';
import { parseCSVToTable, TableData } from '../utils/csv';
import { Table, FileSpreadsheet } from 'lucide-react';

interface TableResponseViewProps {
  csvContent: string;
}

export const TableResponseView: React.FC<TableResponseViewProps> = ({ csvContent }) => {
  const tableData: TableData = parseCSVToTable(csvContent);

  if (!tableData.headers || tableData.headers.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 italic">
        No response tabular data available.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Table className="w-4 h-4 text-amber-500" />
          <span>Webhook Response Table</span>
        </div>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          {tableData.headers.length} Columns • {tableData.rows.length} {tableData.rows.length === 1 ? 'Row' : 'Rows'}
        </span>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-slate-200 shadow-xs bg-white">
        <div className="overflow-x-auto max-h-64 scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800 text-slate-200 uppercase text-[10px] tracking-wider font-semibold sticky top-0 z-10">
                {tableData.headers.map((header, idx) => (
                  <th
                    key={idx}
                    className="px-3.5 py-2.5 border-b border-slate-700 whitespace-nowrap font-mono text-amber-300"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
              {tableData.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                  {tableData.headers.map((header, cIdx) => (
                    <td
                      key={cIdx}
                      className="px-3.5 py-2.5 max-w-xs truncate whitespace-nowrap text-xs text-slate-800"
                      title={row[header] || '-'}
                    >
                      {row[header] ? (
                        <span className="font-medium text-slate-900">{row[header]}</span>
                      ) : (
                        <span className="text-slate-300 font-mono text-[10px] italic">empty</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
