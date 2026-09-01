import { useState, FormEvent } from 'react';
import { Search, Globe2, Loader2, ArrowRight, History, Trash2, X, Sparkles } from 'lucide-react';
import { SearchHistoryItem } from '../types';

interface SearchSectionProps {
  onSearch: (target: string) => void;
  isLoading: boolean;
  loadingStep: string;
  error: string | null;
  history: SearchHistoryItem[];
  onSelectHistory: (domain: string) => void;
  onClearHistory: () => void;
}

const SAMPLE_DOMAINS = [
  'google.com',
  'github.com',
  'cloudflare.com',
  'wikipedia.org',
  'netflix.com',
  'openai.com',
  '1.1.1.1',
];

export default function SearchSection({
  onSearch,
  isLoading,
  loadingStep,
  error,
  history,
  onSelectHistory,
  onClearHistory,
}: SearchSectionProps) {
  const [inputVal, setInputVal] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isLoading) return;
    onSearch(inputVal);
  };

  const handleChipClick = (domain: string) => {
    setInputVal(domain);
    onSearch(domain);
  };

  return (
    <section className="w-full max-w-4xl mx-auto mt-10 sm:mt-16 px-4 text-center">
      {/* Title */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-6">
        <Sparkles className="w-3.5 h-3.5" /> High-Accuracy Network Lookup
      </div>

      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-5 leading-tight">
        Website <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 drop-shadow-[0_0_35px_rgba(0,217,255,0.4)]">IP Finder</span>
      </h1>

      <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
        Analyze any website or IP address to instantly uncover its IPv4/IPv6 address, DNS records, geographical coordinates, ISP, ASN, and WHOIS registration intelligence.
      </p>

      {/* Main Search Input Form */}
      <form
        onSubmit={handleSubmit}
        className="relative max-w-3xl mx-auto p-2 rounded-2xl bg-white/[0.07] border border-white/[0.15] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] hover:border-cyan-500/40 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-500/20 transition-all flex flex-col sm:flex-row items-center gap-2"
      >
        <div className="flex items-center flex-1 w-full px-3 py-1.5">
          <Globe2 className="w-6 h-6 text-cyan-400 shrink-0 mr-3" />
          <input
            id="urlInput"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Enter website URL or IP (e.g. github.com, 8.8.8.8)"
            className="w-full bg-transparent border-none text-white text-base sm:text-lg placeholder:text-slate-500 focus:outline-none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {inputVal && (
            <button
              type="button"
              onClick={() => setInputVal('')}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          id="searchBtn"
          type="submit"
          disabled={isLoading || !inputVal.trim()}
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Analyze</span>
            </>
          )}
        </button>
      </form>

      {/* Suggested Quick Chips */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
        <span className="text-slate-500 font-medium">Try searching:</span>
        {SAMPLE_DOMAINS.map((domain) => (
          <button
            key={domain}
            type="button"
            onClick={() => handleChipClick(domain)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-300 transition-all font-mono cursor-pointer"
          >
            {domain}
          </button>
        ))}
      </div>

      {/* Search History */}
      {history.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 mr-1">
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span>Recent:</span>
          </div>
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setInputVal(item.domain);
                onSelectHistory(item.domain);
              }}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200 transition-all cursor-pointer font-mono"
            >
              <span>{item.domain}</span>
              <span className="text-[10px] text-cyan-400/80 bg-cyan-950/60 px-1 rounded">{item.ip}</span>
            </button>
          ))}
          <button
            onClick={onClearHistory}
            className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
            title="Clear search history"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Loading Radar Animation */}
      {isLoading && (
        <div className="mt-8 p-6 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 backdrop-blur-xl max-w-md mx-auto animate-in fade-in zoom-in-95 duration-300">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping"></div>
            <div className="absolute inset-2 rounded-full border-2 border-indigo-500/30 animate-pulse"></div>
            <div className="w-full h-full rounded-full border-2 border-cyan-400 border-t-transparent animate-spin flex items-center justify-center">
              <Globe2 className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <p className="text-cyan-300 font-semibold text-sm">{loadingStep || 'Querying global DNS & IP telemetry...'}</p>
          <p className="text-slate-400 text-xs mt-1">Extracting geolocation, ASN, name servers, and records</p>
        </div>
      )}

      {/* Error Display */}
      {error && !isLoading && (
        <div
          id="error"
          className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 max-w-xl mx-auto text-sm text-left flex items-start gap-3 shadow-lg"
        >
          <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0 animate-pulse" />
          <div className="flex-1">
            <p className="font-semibold text-rose-200">Lookup Failed</p>
            <p className="text-rose-300/90 text-xs mt-0.5">{error}</p>
            <p className="text-slate-400 text-xs mt-2">
              Tip: Verify domain spelling, remove extra symbols, or try a standard domain like <code className="text-cyan-300">google.com</code>.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
