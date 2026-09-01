import { Activity, Globe, Radio, ShieldCheck, Sparkles } from 'lucide-react';

interface NavbarProps {
  onCheckMyIp: () => void;
  isLoadingMyIp: boolean;
  onOpenWhoisModal?: () => void;
}

export default function Navbar({ onCheckMyIp, isLoadingMyIp, onOpenWhoisModal }: NavbarProps) {
  return (
    <nav className="w-full px-6 lg:px-12 py-4 flex items-center justify-between border-b border-white/10 bg-[#050816]/75 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
          <Radio className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-1.5">
            <span className="text-white">Net</span>
            <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(0,217,255,0.5)]">Scope</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 ml-1.5">
              IP Intel v2.5
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">Website & Network Intelligence Engine</p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* My IP Quick Button */}
        <button
          onClick={onCheckMyIp}
          disabled={isLoadingMyIp}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white transition-all shadow-sm hover:border-cyan-500/40 disabled:opacity-50 cursor-pointer"
          title="Lookup your own current IP address"
        >
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>{isLoadingMyIp ? 'Detecting...' : 'My IP'}</span>
        </button>

        {/* Live Network Status Pill */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden sm:inline">Network Online</span>
          <span className="sm:hidden">Online</span>
        </div>
      </div>
    </nav>
  );
}
