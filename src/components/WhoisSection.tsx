import { useState, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  ShieldAlert,
  Calendar,
  UserCheck,
  Server,
  Copy,
  Check,
  Activity,
  Layers,
  ArrowUpRight,
  Globe,
} from 'lucide-react';
import { fetchRdapInfo } from '../services/networkService';

interface WhoisSectionProps {
  domain: string;
  ip: string;
  onCopy: (text: string, label: string) => void;
}

export default function WhoisSection({ domain, ip, onCopy }: WhoisSectionProps) {
  const [rdapData, setRdapData] = useState<any | null>(null);
  const [loadingRdap, setLoadingRdap] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!domain) return;
    setLoadingRdap(true);
    fetchRdapInfo(domain)
      .then((data) => setRdapData(data))
      .catch(() => setRdapData(null))
      .finally(() => setLoadingRdap(false));
  }, [domain]);

  const openExternalWhois = (provider: 'whois' | 'icann' | 'viewdns' | 'bgp') => {
    let url = '';
    switch (provider) {
      case 'whois':
        url = `https://www.whois.com/whois/${encodeURIComponent(domain)}`;
        break;
      case 'icann':
        url = `https://lookup.icann.org/en/lookup?q=${encodeURIComponent(domain)}`;
        break;
      case 'viewdns':
        url = `https://viewdns.info/whois/?domain=${encodeURIComponent(domain)}`;
        break;
      case 'bgp':
        url = `https://bgp.he.net/ip/${encodeURIComponent(ip)}`;
        break;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyIp = () => {
    onCopy(ip, 'IP Address');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.05] border border-white/[0.11] backdrop-blur-2xl shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              WHOIS & Domain Registration
            </h3>
            <p className="text-xs text-slate-400">
              Registrar details, creation history, nameservers & authoritative registry lookups
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => openExternalWhois('whois')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 border border-cyan-500/40 text-xs font-bold text-cyan-300 hover:text-cyan-200 transition-all cursor-pointer shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Open WHOIS.com</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
          </button>

          <button
            onClick={handleCopyIp}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 hover:text-white transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>Copy IP</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* RDAP Preview & Deep Details */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Registration Info */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span>Domain Status</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div>
              <span className="text-slate-500">Domain:</span>{' '}
              <span className="font-mono text-cyan-300 font-semibold">{domain}</span>
            </div>
            <div>
              <span className="text-slate-500">Registry Handle:</span>{' '}
              <span className="font-mono text-slate-300">{rdapData?.handle || 'Active In Registry'}</span>
            </div>
            <div>
              <span className="text-slate-500">Status:</span>{' '}
              <span className="text-emerald-400">
                {rdapData?.status?.[0]?.replace(/_/g, ' ') || 'clientTransferProhibited / ok'}
              </span>
            </div>
          </div>
        </div>

        {/* Nameservers */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            <Server className="w-4 h-4 text-indigo-400" />
            <span>Authoritative Nameservers</span>
          </div>
          <div className="space-y-1 text-xs text-slate-300 font-mono">
            {rdapData?.nameservers && rdapData.nameservers.length > 0 ? (
              rdapData.nameservers.slice(0, 3).map((ns: any, idx: number) => (
                <div key={idx} className="truncate text-indigo-200">
                  • {ns.ldhName || ns}
                </div>
              ))
            ) : (
              <div className="text-slate-500">Standard root nameservers allocated</div>
            )}
          </div>
        </div>

        {/* Quick Tools */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>External Lookups</span>
          </div>
          <div className="flex flex-col gap-1.5 text-xs">
            <button
              onClick={() => openExternalWhois('icann')}
              className="text-left text-slate-300 hover:text-cyan-300 flex items-center justify-between p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
            >
              <span>ICANN Registration Data</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button
              onClick={() => openExternalWhois('viewdns')}
              className="text-left text-slate-300 hover:text-cyan-300 flex items-center justify-between p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
            >
              <span>ViewDNS Reverse IP & Port Scan</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button
              onClick={() => openExternalWhois('bgp')}
              className="text-left text-slate-300 hover:text-cyan-300 flex items-center justify-between p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
            >
              <span>BGP Hurricane Electric Routing</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
