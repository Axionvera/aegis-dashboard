import React from 'react';

interface StatusCardProps {
  title: string;
  value: string;
  status: 'ok' | 'warning' | 'error' | 'unknown';
}

export default function StatusCard({ title, value, status }: StatusCardProps) {
  const statusColors = {
    ok: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    unknown: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  return (
    <div className={`p-4 rounded-md border ${statusColors[status]}`}>
      <h3 className="font-semibold text-sm mb-1 opacity-80">{title}</h3>
      <p className="font-mono text-sm break-all">{value}</p>
    </div>
  );
}
