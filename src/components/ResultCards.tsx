import { useState, useEffect } from 'react';
import {
  Globe,
  Radio,
  MapPin,
  Building2,
  Cpu,
  Compass,
  Clock,
  Copy,
  ExternalLink,
  Shield,
  Check,
  Server,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { IpLookupResult } from '../types';

interface ResultCardsProps {
  data: IpLookupResult;
  domain: string;
  latencyMs: number | null;
  onCopy: (text: string, label: string) => void;
  onOpenWhois: () => void;
}

export default function ResultCards({
  data,
  domain,
  latencyMs,
  onCopy,
  onOpenWhois,
}: ResultCardsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [localTime, setLocalTime] = useState<string>('');

  const handleCopyField = (text: string, label: string, fieldKey: string) => {
    onCopy(text, label);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Calculate live server local time if timezone or offset is provided
  useEffect(() => {
    const updateTime = () => {
      try {
        if (data.timezone?.id) {
          const formatted = new Intl.DateTimeFormat('en-US', {
            timeZone: data.timezone.id,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }).format(new Date());
          setLocalTime(formatted);
        } else if (data.timezone?.current_time) {
          setLocalTime(data.timezone.current_time);
        } else {
          setLocalTime('UTC');
        }
      } catch {
        setLocalTime(data.timezone?.utc || 'N/A');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [data.timezone]);

  const coordinatesStr =
    data.latitude !== undefined && data.longitude !== undefined
      ? `${data.latitude}, ${data.longitude}`
      : 'Unavailable';

  const mapsUrl =
    data.latitude !== undefined && data.longitude !== undefined
      ? `https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`
      : null;

  return (
    <div className="space-y-6">
      {/* Top Banner Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white/[0.06] border border-white/[0.12] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{domain}</span>
              {data.type && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                  {data.type}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Analysis Completed • Resolved Hostname
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {latencyMs !== null && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-700/70 text-xs text-slate-300">
              <span className="text-emerald-400 font-mono font-bold">{latencyMs} ms</span>
              <span className="text-slate-500">Latency</span>
            </div>
          )}

          <button
            onClick={() =>
              handleCopyField(
                `Domain: ${domain}\nIP: ${data.ip}\nLocation: ${data.city || ''}, ${data.country || ''}\nISP: ${data.connection?.isp || data.connection?.org || ''}\nASN: ${data.connection?.asn ? 'AS' + data.connection.asn : ''}\nCoordinates: ${coordinatesStr}`,
                'Full Summary',
                'summary'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-slate-200 hover:text-white transition-all cursor-pointer"
          >
            {copiedField === 'summary' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied Summary</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid of Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* 1. Website */}
        <div className="group p-5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.09] hover:border-cyan-500/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-950/20">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <a
              href={`https://${domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-300 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              title="Visit website"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
            Target Hostname
          </h3>
          <div className="text-lg font-bold text-white font-mono break-all group-hover:text-cyan-300 transition-colors" id="website">
            {domain}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Standard HTTPS Endpoint</span>
          </div>
        </div>

        {/* 2. IP Address */}
        <div className="group p-5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.09] hover:border-cyan-500/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-950/20">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Radio className="w-5 h-5" />
            </div>
            <button
              onClick={() => handleCopyField(data.ip || '', 'IP Address', 'ip')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-cyan-500/30 transition-all cursor-pointer"
            >
              {copiedField === 'ip' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy IP</span>
                </>
              )}
            </button>
          </div>
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
            IP Address
          </h3>
          <div className="text-xl font-bold text-white font-mono break-all text-cyan-300" id="ip">
            {data.ip || 'Unavailable'}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="text-indigo-400 font-mono">{data.type || 'IPv4'}</span>
            <span>• Public Gateway</span>
          </div>
        </div>

        {/* 3. Hosting Country */}
        <div className="group p-5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.09] hover:border-cyan-500/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-950/20">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <MapPin className="w-5 h-5" />
            </div>
            {data.country_flag?.emoji ? (
              <span className="text-2xl" role="img" aria-label={data.country || 'Flag'}>
                {data.country_flag.emoji}
              </span>
            ) : data.country_code ? (
              <span className="text-xs px-2 py-0.5 rounded bg-white/10 font-mono text-slate-300 font-bold">
                {data.country_code}
              </span>
            ) : null}
          </div>
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
            Hosting Country
          </h3>
          <div className="text-lg font-bold text-white break-words" id="country">
            {data.country || 'Unavailable'}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <span>{data.continent || 'Continent'}</span>
            {data.capital && <span>• Capital: {data.capital}</span>}
          </div>
        </div>

        {/* 4. City & Region */}
        <div className="group p-5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.09] hover:border-cyan-500/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-950/20">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <MapPin className="w-5 h-5" />
            </div>
            {data.postal && (
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                ZIP {data.postal}
              </span>
            )}
          </div>
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
            City & Region
          </h3>
          <div className="text-lg font-bold text-white break-words" id="city">
            {data.city ? `${data.city}${data.region ? `, ${data.region}` : ''}` : 'Unavailable'}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {data.region_code ? `Region Code: ${data.region_code}` : 'Metro Area'}
          </div>
        </div>

        {/* 5. ISP / Organization */}
        <div className="group p-5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.09] hover:border-cyan-500/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-950/20">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <Server className="w-4 h-4 text-slate-500" />
          </div>
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
            ISP / Organization
          </h3>
          <div className="text-lg font-bold text-white break-words" id="isp">
            {data.connection?.isp || data.connection?.org || 'Unavailable'}
          </div>
          <div className="mt-2 text-xs text-slate-400 truncate">
            Org: {data.connection?.org || data.connection?.isp || 'Standard Carrier'}
          </div>
        </div>

        {/* 6. ASN */}
        <div className="group p-5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.09] hover:border-cyan-500/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-950/20">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            {data.connection?.asn && (
              <a
                href={`https://bgp.he.net/AS${data.connection.asn}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30"
              >
                <span>BGP Info</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            )}
          </div>
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
            Autonomous System
          </h3>
          <div className="text-lg font-bold text-white font-mono break-words" id="asn">
            {data.connection?.asn ? `AS${data.connection.asn}` : 'Unavailable'}
          </div>
          <div className="mt-2 text-xs text-slate-400 truncate">
            {data.connection?.domain || 'Autonomous System Network'}
          </div>
        </div>

        {/* 7. Coordinates & Map Link */}
        <div className="group p-5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.09] hover:border-cyan-500/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-950/20">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Compass className="w-5 h-5" />
            </div>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-teal-300 hover:text-teal-200 flex items-center gap-1 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30"
              >
                <span>View Map</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
            Geographic Coordinates
          </h3>
          <div className="text-base font-bold text-white font-mono break-words" id="coordinates">
            {coordinatesStr}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Lat / Long Geolocation Coordinates
          </div>
        </div>

        {/* 8. Timezone & Live Server Time */}
        <div className="group p-5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.09] hover:border-cyan-500/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-950/20">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-semibold">
              {data.timezone?.abbr || data.timezone?.utc || 'UTC'}
            </span>
          </div>
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
            Timezone & Local Time
          </h3>
          <div className="text-base font-bold text-white font-mono break-words" id="timezone">
            {data.timezone?.id || 'Unavailable'}
          </div>
          <div className="mt-2 text-xs text-amber-400/90 font-mono">
            🕒 {localTime || 'Calculating...'}
          </div>
        </div>

        {/* 9. Security & Infrastructure Badges */}
        <div className="group p-5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.09] hover:border-cyan-500/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-950/20">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-xs text-emerald-400 font-medium">Telemetry</span>
          </div>
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
            Network Classification
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
              {data.security?.proxy ? 'Proxy Active' : 'No Proxy Detected'}
            </span>
            <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
              {data.security?.vpn ? 'VPN Active' : 'Direct Host'}
            </span>
            <span className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-[11px] text-cyan-300">
              {data.is_eu ? 'EU Jurisdiction' : 'Global Jurisdiction'}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Routing Gateway Node
          </div>
        </div>
      </div>
    </div>
  );
}
