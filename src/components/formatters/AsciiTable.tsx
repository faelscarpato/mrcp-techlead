import React, { memo } from 'react';

interface AsciiTableProps {
  data: Record<string, unknown>[];
}

const AsciiTableComponent: React.FC<AsciiTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-term-dim">No data available to tabularize.</div>;
  }

  const columns = Object.keys(data[0]);
  
  // Calculate max width for each column
  const colWidths = columns.map(col => {
    const headerWidth = col.length;
    const maxDataWidth = Math.max(...data.map(row => String(row[col] ?? '').length));
    return Math.max(headerWidth, maxDataWidth);
  });

  const renderSeparator = () => {
    const parts = colWidths.map(w => '-'.repeat(w + 2));
    return `+${parts.join('+')}+`;
  };

  const renderRow = (row: Record<string, unknown> | string[]) => {
    const values = Array.isArray(row) 
      ? row 
      : columns.map(col => String(row[col as keyof typeof row] ?? ''));
      
    const parts = values.map((val, i) => ` ${val.padEnd(colWidths[i])} `);
    return `|${parts.join('|')}|`;
  };

  const headerStr = renderRow(columns);
  const sepStr = renderSeparator();

  return (
    <pre className="font-mono text-term-text whitespace-pre overflow-x-auto text-sm leading-tight">
      <span className="text-term-accent">{sepStr}</span>
      {'\n'}
      <span className="text-term-accent font-bold">{headerStr}</span>
      {'\n'}
      <span className="text-term-accent">{sepStr}</span>
      {'\n'}
      {data.map((row, idx) => (
        <React.Fragment key={idx}>
          {renderRow(row)}
          {'\n'}
        </React.Fragment>
      ))}
      <span className="text-term-accent">{sepStr}</span>
    </pre>
  );
};

export const AsciiTable = memo(AsciiTableComponent);
