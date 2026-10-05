import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Printer,
  ArrowLeft,
  Shield,
  Clock,
  ExternalLink,
  AlertTriangle,
  Lightbulb,
  Wrench,
} from 'lucide-react';
import { IScan } from '../types';

interface ReportPageProps {
  scan: IScan;
  onBack: () => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({ scan, onBack }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(scan.summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 print:p-0 print:m-0 print:max-w-none">
      {/* Navigation Controls (hidden in print) */}
      <div className="flex items-center justify-between print:hidden">
        <button
          id="report-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Results</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="copy-report-text-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Text Report'}</span>
          </button>

          <button
            id="print-report-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Main Printable Document Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8 print:border-none print:bg-white print:text-black print:p-4">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 print:border-slate-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 print:text-black print:border-black">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white font-mono print:text-black">
                  WEB SECURITY REPORT
                </h1>
                <p className="text-xs text-slate-400 print:text-slate-600 font-mono">
                  WebShield Web Security Testing Platform • Safe Non-Destructive Audit
                </p>
              </div>
            </div>
            <div className="text-right text-xs font-mono text-slate-400 print:text-slate-600 hidden sm:block">
              <p>Reference: {scan._id || scan.id || 'N/A'}</p>
              <p>{new Date(scan.scanDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Audit Metadata Bar */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 print:bg-slate-100 print:border-slate-300 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Target Website</span>
              <span className="text-emerald-400 font-semibold truncate block print:text-black">{scan.targetUrl}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Auditor Account</span>
              <span className="text-slate-200 truncate block print:text-black">{scan.userEmail}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Security Score</span>
              <span className="text-white font-bold block print:text-black">{scan.score} / 100</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Overall Risk</span>
              <span className="text-amber-400 font-bold block print:text-black">{scan.overallRisk}</span>
            </div>
          </div>
        </div>

        {/* Required Monospace Text Output Block */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 print:text-slate-600">
            <span>Executive Output Format</span>
            <span className="text-[11px] text-slate-500">Exact Project Specification Format</span>
          </div>
          <div className="relative group">
            <pre className="p-6 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm leading-relaxed text-slate-200 overflow-x-auto shadow-inner print:bg-slate-50 print:border-slate-300 print:text-black">
              {scan.summaryText}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors print:hidden opacity-80 group-hover:opacity-100"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Detailed Findings & Actionable Recommendations */}
        <div className="space-y-6 pt-4 border-t border-slate-800 print:border-slate-300">
          <div>
            <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider print:text-black">
              Detailed Findings & Remediation Plan
            </h2>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-0.5">
              Comprehensive analysis of the 5 core defensive security categories
            </p>
          </div>

          <div className="space-y-4">
            {scan.findings.map((f, i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-3 print:bg-white print:border-slate-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white font-mono print:text-black">{f.area}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                        f.status === 'PASS'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : f.status === 'WARNING'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {f.status}
                    </span>
                    {f.riskLevel !== 'None' && (
                      <span className="text-[10px] font-mono text-slate-400 print:text-slate-600 uppercase">
                        Risk: {f.riskLevel}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 print:bg-slate-50 print:border-slate-200">
                    <div className="flex items-center gap-1.5 text-rose-400 font-semibold mb-1 print:text-rose-700">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Observed Weakness / Posture</span>
                    </div>
                    <p className="text-slate-300 print:text-slate-800 leading-relaxed">{f.problem}</p>
                  </div>

                  <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-500/20 print:bg-emerald-50 print:border-emerald-200">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1 print:text-emerald-700">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Recommended Solution</span>
                    </div>
                    <p className="text-emerald-200/90 print:text-emerald-900 leading-relaxed">{f.recommendedSolution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Project Sign-Off Stamp */}
        <div className="pt-6 border-t border-slate-800 print:border-slate-300 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono gap-2">
          <span>Generated by WebShield Security Testing Platform • B.Tech Final-Year Capstone Project</span>
          <span>Verified Non-Destructive Safe Scan Engine</span>
        </div>
      </div>
    </div>
  );
};
