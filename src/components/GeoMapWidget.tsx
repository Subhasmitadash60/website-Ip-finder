import { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Maximize2 } from 'lucide-react';

interface GeoMapWidgetProps {
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  ip?: string;
}

export default function GeoMapWidget({
  latitude,
  longitude,
  city,
  country,
  ip,
}: GeoMapWidgetProps) {
  const [useIframe, setUseIframe] = useState<boolean>(true);

  if (latitude === undefined || longitude === undefined) {
    return null;
  }

  // OpenStreetMap embed URL with bounding box around lat, lon
  const delta = 0.08;
  const bbox = `${longitude - delta},${latitude - delta},${longitude + delta},${latitude + delta}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
  const fullMapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.05] border border-white/[0.11] backdrop-blur-2xl shadow-xl overflow-hidden">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Geographic Server Location
            </h3>
            <p className="text-xs text-slate-400">
              Pinpointed at {city ? `${city}, ` : ''}{country || 'World Location'} ({latitude.toFixed(4)}, {longitude.toFixed(4)})
            </p>
          </div>
        </div>

        <a
          href={fullMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-xs font-semibold text-teal-300 hover:text-teal-200 transition-all cursor-pointer"
        >
          <span>Open Full Map</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-white/10 bg-slate-950">
        {useIframe ? (
          <iframe
            title="Server Location Map"
            src={osmEmbedUrl}
            className="w-full h-full border-0 filter contrast-[1.1] brightness-[0.85] invert-[0.92] hue-rotate-[180deg]"
            loading="lazy"
            onError={() => setUseIframe(false)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900/80">
            <Navigation className="w-12 h-12 text-cyan-400 mb-3 animate-bounce" />
            <p className="text-sm font-semibold text-white">
              {city ? `${city}, ` : ''}{country || 'Target Location'}
            </p>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Coordinates: {latitude}, {longitude}
            </p>
            <a
              href={fullMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors inline-flex items-center gap-1.5"
            >
              <span>View On Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Overlay Pin Tag */}
        <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-2 rounded-lg border border-cyan-500/30 text-xs text-white flex items-center gap-2 pointer-events-none shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono text-cyan-300">{ip || 'Server Node'}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-200">{city || country || 'Hosting Center'}</span>
        </div>
      </div>
    </div>
  );
}
