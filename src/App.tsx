/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import NetworkBackground from './components/NetworkBackground';
import SearchSection from './components/SearchSection';
import ResultCards from './components/ResultCards';
import DnsSection from './components/DnsSection';
import WhoisSection from './components/WhoisSection';
import GeoMapWidget from './components/GeoMapWidget';
import ToastContainer, { ToastMessage } from './components/Toast';
import {
  cleanDomain,
  fetchIpIntelligence,
  fetchDnsRecords,
  measureLatency,
} from './services/networkService';
import { AnalysisState, SearchHistoryItem } from './types';

const STORAGE_HISTORY_KEY = 'netscope_search_history_v1';

export default function App() {
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoadingMyIp, setIsLoadingMyIp] = useState<boolean>(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Save history helper
  const saveToHistory = (domain: string, ip: string, country?: string, countryCode?: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.domain.toLowerCase() !== domain.toLowerCase());
      const updated: SearchHistoryItem[] = [
        {
          id: `${domain}-${Date.now()}`,
          domain,
          ip,
          country,
          countryCode,
          timestamp: Date.now(),
        },
        ...filtered,
      ].slice(0, 6);

      try {
        localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_HISTORY_KEY);
    } catch {
      // Ignore
    }
    showToast({
      id: `${Date.now()}`,
      type: 'info',
      title: 'History Cleared',
      description: 'Search history has been reset.',
    });
  };

  const showToast = (toast: ToastMessage) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 3500);
  };

  const handleCopy = (text: string, label: string) => {
    if (!text || text === '-' || text === 'Unavailable') return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast({
          id: `${Date.now()}-${Math.random()}`,
          type: 'copy',
          title: `Copied ${label}`,
          description: text.length > 50 ? `${text.slice(0, 50)}...` : text,
        });
      })
      .catch(() => {
        showToast({
          id: `${Date.now()}`,
          type: 'info',
          title: 'Copy Failed',
          description: 'Please copy manually.',
        });
      });
  };

  // Perform full search for domain or IP
  const handleSearch = async (target: string) => {
    setError(null);
    let hostname: string;

    try {
      hostname = cleanDomain(target);
    } catch (err: any) {
      setError(err.message || 'Please enter a valid website URL or domain name.');
      return;
    }

    setIsLoading(true);
    setLoadingStep('1. Resolving hostname & IP geolocation...');

    try {
      // Fetch IP Intelligence
      const ipData = await fetchIpIntelligence(hostname);

      setLoadingStep('2. Querying authoritative DNS records (A, AAAA, MX, NS, TXT, SOA)...');
      
      // Concurrently fetch DNS and measure latency
      const [dnsRecords, latency] = await Promise.all([
        fetchDnsRecords(hostname),
        measureLatency(hostname),
      ]);

      setAnalysis({
        domain: hostname,
        ipData,
        dnsRecords,
        dnsLoading: false,
        latencyMs: latency,
        timestamp: Date.now(),
      });

      if (ipData.ip) {
        saveToHistory(hostname, ipData.ip, ipData.country, ipData.country_code);
      }

      // Smoothly scroll down to results
      setTimeout(() => {
        const resultsEl = document.getElementById('results');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Unable to analyze this website. Please verify the URL.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Quick lookup for user's own IP
  const handleCheckMyIp = async () => {
    if (isLoading || isLoadingMyIp) return;
    setIsLoadingMyIp(true);
    setError(null);
    try {
      const res = await fetch('https://ipwho.is/');
      const data = await res.json();
      if (data.ip) {
        await handleSearch(data.ip);
        showToast({
          id: `${Date.now()}`,
          type: 'success',
          title: 'Current IP Detected',
          description: `Loaded telemetry for ${data.ip}`,
        });
      } else {
        throw new Error('Could not identify current public IP.');
      }
    } catch (err: any) {
      showToast({
        id: `${Date.now()}`,
        type: 'info',
        title: 'IP Detection Failed',
        description: err.message || 'Please type your domain manually.',
      });
    } finally {
      setIsLoadingMyIp(false);
    }
  };

  // Re-fetch DNS records
  const handleRefreshDns = async () => {
    if (!analysis) return;
    setAnalysis((prev) => (prev ? { ...prev, dnsLoading: true } : null));
    try {
      const dnsRecords = await fetchDnsRecords(analysis.domain);
      setAnalysis((prev) => (prev ? { ...prev, dnsRecords, dnsLoading: false } : null));
      showToast({
        id: `${Date.now()}`,
        type: 'success',
        title: 'DNS Records Refreshed',
        description: `Retrieved ${dnsRecords.length} records.`,
      });
    } catch {
      setAnalysis((prev) => (prev ? { ...prev, dnsLoading: false } : null));
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Dynamic Animated Particle Canvas */}
      <NetworkBackground />

      {/* Navigation Bar */}
      <Navbar
        onCheckMyIp={handleCheckMyIp}
        isLoadingMyIp={isLoadingMyIp}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20">
        {/* Search Hero */}
        <SearchSection
          onSearch={handleSearch}
          isLoading={isLoading}
          loadingStep={loadingStep}
          error={error}
          history={history}
          onSelectHistory={handleSearch}
          onClearHistory={handleClearHistory}
        />

        {/* Results Dashboard */}
        <AnimatePresence mode="wait">
          {analysis && analysis.ipData && !isLoading && (
            <motion.section
              id="results"
              key={analysis.domain}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-full max-w-6xl mx-auto mt-12 px-4 sm:px-6 space-y-8"
            >
              {/* Telemetry Cards Grid */}
              <ResultCards
                data={analysis.ipData}
                domain={analysis.domain}
                latencyMs={analysis.latencyMs}
                onCopy={handleCopy}
                onOpenWhois={() => {}}
              />

              {/* Geographic Map Widget */}
              <GeoMapWidget
                latitude={analysis.ipData.latitude}
                longitude={analysis.ipData.longitude}
                city={analysis.ipData.city}
                country={analysis.ipData.country}
                ip={analysis.ipData.ip}
              />

              {/* DNS Information Section */}
              <DnsSection
                records={analysis.dnsRecords}
                isLoading={analysis.dnsLoading}
                domain={analysis.domain}
                onRefreshDns={handleRefreshDns}
                onCopy={handleCopy}
              />

              {/* WHOIS & Registry Tools */}
              <WhoisSection
                domain={analysis.domain}
                ip={analysis.ipData.ip || ''}
                onCopy={handleCopy}
              />
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-white/[0.08] bg-[#050816]/80 backdrop-blur-xl text-center text-xs text-slate-400 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">Net<span className="text-cyan-400">Scope</span></span>
            <span>• Website Network Intelligence & IP Discovery Tool</span>
          </div>
          <div className="text-slate-500">
            Powered by DNS-over-HTTPS & Global Geo-IP Telemetry
          </div>
        </div>
      </footer>

      {/* Toast Notification Container */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
