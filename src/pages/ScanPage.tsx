import React, { useState } from 'react';
import {
  Shield,
  Search,
  CheckCircle2,
  AlertCircle,
  Lock,
  FileCheck,
  Cookie,
  UserCheck,
  FormInput,
  ArrowRight,
  Info,
  Globe,
} from 'lucide-react';
import { api } from '../services/api';
import { IScan } from '../types';

interface ScanPageProps {
  onScanCompleted: (scan: IScan) => void;
}

export const ScanPage: React.FC<ScanPageProps> = ({ onScanCompleted }) => {
  const [url, setUrl] = useState('');
  const [authorized, setAuthorized] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const scanSteps = [
    { title: 'Establishing TLS Connection & Checking HTTPS', icon: Lock },
    { title: 'Auditing Defensive Security Headers (HSTS, CSP, X-Frame)', icon: FileCheck },
    { title: 'Inspecting Cookie Flags (Secure, HttpOnly, SameSite)', icon: Cookie },
    { title: 'Analyzing Server Banners & Authentication Posture', icon: UserCheck },
    { title: 'Verifying Form Actions & Input Validation Attributes', icon: FormInput },
  ];

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a website URL.');
      return;
    }

    if (!authorized) {
      setError('You must confirm authorization before initiating a security scan.');
      return;
    }

    setError(null);
    setIsScanning(true);
    setScanStep(0);

    // Simulate animated scanning steps progression
    const stepInterval = setInterval(() => {
      setScanStep((prev) => (prev < scanSteps.length - 1 ? prev + 1 : prev));
    }, 650);

    try {
      const scanResult = await api.startScan(url, authorized);
      clearInterval(stepInterval);
      setScanStep(scanSteps.length - 1);
      // Small pause so user sees all steps green
      setTimeout(() => {
        setIsScanning(false);
        onScanCompleted(scanResult);
      }, 400);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsScanning(false);
      setError(err.message || 'Scan failed to complete. Ensure URL is reachable.');
    }
  };

  const handlePresetSelect = (presetUrl: string) => {
    setUrl(presetUrl);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Introduction */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <Shield className="w-3.5 h-3.5" />
          <span>Non-Destructive Defensive Auditor</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
          Website Security Scanner
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Perform safe, passive security checks on authorized websites to detect configuration weaknesses,
          missing headers, cookie vulnerabilities, and input validation gaps.
        </p>
      </div>

      {/* Target Input Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {isScanning ? (
          /* Live Scanning Animation */
          <div className="py-8 space-y-6 text-center">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-cyan-500/20 border-b-cyan-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              <div className="absolute inset-0 flex items-center justify-center text-emerald-400">
                <Shield className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white font-mono">Auditing Target Website</h3>
              <p className="text-xs font-mono text-emerald-400 mt-1">{url}</p>
            </div>

            {/* Checklist progression */}
            <div className="max-w-md mx-auto space-y-2.5 text-left text-xs font-mono">
              {scanSteps.map((step, index) => {
                const Icon = step.icon;
                const isPassed = index < scanStep;
                const isCurrent = index === scanStep;
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                      isPassed
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                        : isCurrent
                        ? 'bg-slate-800 border-cyan-500/50 text-cyan-300 animate-pulse'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1">{step.title}</span>
                    {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0"></span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Scan Setup Form */
          <form onSubmit={handleStartScan} className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2 font-mono uppercase tracking-wider">
                Target Website URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Globe className="w-5 h-5" />
                </div>
                <input
                  id="target-url-input"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-mono transition-all"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 font-mono">Quick test targets for evaluation:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  'https://example.com',
                  'https://owasp.org',
                  'https://httpbin.org',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Authorization Checkbox */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  id="authorized-agreement-checkbox"
                  type="checkbox"
                  checked={authorized}
                  onChange={(e) => setAuthorized(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-400 cursor-pointer"
                />
                <span className="text-xs text-slate-300 leading-relaxed font-sans">
                  <strong>Authorized Testing Agreement:</strong> I confirm that I own or am explicitly authorized to perform non-destructive security testing on this target website in compliance with academic and professional security guidelines.
                </span>
              </label>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1 font-mono">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Zero destructive payloads: Checks strictly inspect public headers, SSL, cookies & forms.</span>
              </div>
            </div>

            <button
              id="start-security-scan-btn"
              type="submit"
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Start Security Scan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Non-destructive Safe Scanner Specifications */}
      <div className="border border-slate-800 rounded-xl p-6 bg-slate-950/50 space-y-4">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
          Standard Safe Security Checks Conducted
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="font-semibold text-emerald-400 font-mono">1. HTTPS Availability</span>
            <p className="text-slate-400">Verifies TLS certificate validity and automatic HTTP to HTTPS redirection.</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="font-semibold text-cyan-400 font-mono">2. Security Headers</span>
            <p className="text-slate-400">Audits HSTS, Content-Security-Policy, X-Frame-Options, and X-Content-Type.</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="font-semibold text-amber-400 font-mono">3. Cookie Security</span>
            <p className="text-slate-400">Examines Secure, HttpOnly, and SameSite protection attributes.</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="font-semibold text-purple-400 font-mono">4. Authentication Config</span>
            <p className="text-slate-400">Detects software banner version disclosures (X-Powered-By, Server leaks).</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1 sm:col-span-2">
            <span className="font-semibold text-rose-400 font-mono">5. Input Validation</span>
            <p className="text-slate-400">Checks for HTML5 input constraints, HTTPS form actions, and anti-CSRF tokens.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
