import { useState } from 'react';
import { Dna, Copy, Check, Filter, Search, RefreshCw, Server, ArrowDownToLine } from 'lucide-react';
import { DnsRecord } from '../types';

interface DnsSectionProps {
  records: DnsRecord[];
  isLoading: boolean;
  domain: string;
  onRefreshDns: () => void;
  onCopy: (text: string, label: string) => void;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  AAAA: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  MX: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  NS: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  TXT: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  SOA: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  CNAME: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
  CAA: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' },
};

export default function DnsSection({
  records,
  isLoading,
  domain,
  onRefreshDns,
  onCopy,
}: DnsSectionProps) {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const availableTypes = Array.from(new Set(records.map((r) => r.typeName))).filter(Boolean);

  const filteredRecords = records.filter((rec) => {
    const matchesType = selectedType === 'ALL' || rec.typeName === selectedType;
    const matchesSearch =
      searchTerm.trim() === '' ||
      rec.data.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.typeName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleCopyRecord = (data: string, id: string) => {
    onCopy(data, 'DNS Record Data');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAllZone = () => {
    const zoneText = records
      .map((r) => `${r.name}\t${r.TTL}\tIN\t${r.typeName}\t${r.data}`)
      .join('\n');
    onCopy(zoneText, 'All DNS Records (Zone Format)');
  };

  return (
    <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.05] border border-white/[0.11] backdrop-blur-2xl shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Dna className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              DNS Information & Records
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {records.length} Found
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Resolved via Google & Cloudflare DNS-over-HTTPS (DoH)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onRefreshDns}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
            title="Re-query DNS records"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleCopyAllZone}
            disabled={records.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs text-cyan-300 hover:text-cyan-200 transition-all disabled:opacity-50 cursor-pointer font-medium"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Copy All Records</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="mt-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedType === 'ALL'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            All ({records.length})
          </button>
          {availableTypes.map((type) => {
            const count = records.filter((r) => r.typeName === type).length;
            const style = TYPE_COLORS[type] || {
              bg: 'bg-slate-800',
              text: 'text-slate-300',
              border: 'border-slate-700',
            };
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedType === type
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {type} ({count})
              </button>
            );
          })}
        </div>

        {/* Search within DNS */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search records or IP..."
            className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-500/50 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* DNS Records List */}
      <div className="mt-4 space-y-2.5" id="dnsList">
        {isLoading ? (
          <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800/60">
            <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-slate-300">Resolving authoritative DNS records for {domain}...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800/60 text-slate-400 text-sm">
            No {selectedType !== 'ALL' ? selectedType : ''} records found or matched your filter.
          </div>
        ) : (
          filteredRecords.map((record, idx) => {
            const id = `${record.typeName}-${record.data}-${idx}`;
            const style = TYPE_COLORS[record.typeName] || {
              bg: 'bg-slate-800/80',
              text: 'text-slate-300',
              border: 'border-slate-700',
            };

            return (
              <div
                key={id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/30 transition-all font-mono text-xs"
              >
                <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0">
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${style.bg} ${style.text} ${style.border} shrink-0`}
                  >
                    {record.typeName}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-200 break-all select-all font-medium text-[13px]">
                      {record.data}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>Host: {record.name}</span>
                      <span>•</span>
                      <span>TTL: {record.TTL}s</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyRecord(record.data, id)}
                  className="self-end sm:self-center p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer shrink-0"
                  title="Copy record data"
                >
                  {copiedId === id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
