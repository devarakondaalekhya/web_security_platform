import React, { useState } from 'react';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  FileText,
  RotateCcw,
  Clock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { IScan, ISecurityFinding } from '../types';
import { FindingModal } from '../components/FindingModal';

interface ScanResultsPageProps {
  scan: IScan;
  onNavigateScan: () => void;
  onViewReport: (scan: IScan) => void;
}

export const ScanResultsPage: React.FC<ScanResultsPageProps> = ({
  scan,
  onNavigateScan,
  onViewReport,
}) => {
  const [selectedFinding, setSelectedFinding] = useState<ISecurityFinding | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            PASS
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            WARNING
          </span>
        );
      case 'ISSUE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            ISSUE
          </span>
        );
      default:
        return null;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'MEDIUM':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'HIGH':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'CRITICAL':
        return 'text-purple-400 bg-purple-500/20 border-purple-500/40';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Audited on {new Date(scan.scanDate).toLocaleDateString()} at{' '}
                {new Date(scan.scanDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono flex items-center gap-2">
              <span>Audit Results:</span>
              <a
                href={scan.targetUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1.5"
              >
                <span className="truncate max-w-sm sm:max-w-md">{scan.targetUrl}</span>
                <ExternalLink className="w-4 h-4 shrink-0 text-slate-500" />
              </a>
            </h1>
            <div className="flex items-center gap-3 pt-1">
              <span className={`px-3 py-1 rounded-md text-xs font-mono font-bold uppercase border ${getRiskColor(scan.overallRisk)}`}>
                Overall Risk: {scan.overallRisk}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {scan.findings.filter((f) => f.status === 'PASS').length} of 5 Checks Passed
              </span>
            </div>
          </div>

          {/* Large Security Score Dial / Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-center min-w-[180px] flex flex-col items-center justify-center">
            <span className="text-xs font-mono uppercase text-slate-400">Security Score</span>
            <div className="my-1 flex items-baseline justify-center gap-1">
              <span
                className={`text-5xl font-black font-mono tracking-tight ${
                  scan.score >= 80
                    ? 'text-emerald-400'
                    : scan.score >= 60
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {scan.score}
              </span>
              <span className="text-slate-500 font-mono text-base">/100</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  scan.score >= 80 ? 'bg-emerald-500' : scan.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.max(5, scan.score)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <button
            id="view-report-from-results-btn"
            onClick={() => onViewReport(scan)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Official Security Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            id="scan-another-website-btn"
            onClick={onNavigateScan}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Scan Another Website</span>
          </button>
        </div>
      </div>

      {/* Weak Security Areas Highlight Box */}
      {scan.weakAreas && scan.weakAreas.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-5">
          <h3 className="text-sm font-bold text-amber-400 font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Weak Areas Requiring Remediation:</span>
          </h3>
          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
            {scan.weakAreas.map((area, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>• {area}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 5 Security Checks Grid / List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
            Evaluated Security Checks
          </h2>
          <span className="text-xs text-slate-400 font-mono">Click any row to inspect findings & solutions</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {scan.findings.map((finding, idx) => {
            const isClickable = true;
            return (
              <div
                key={idx}
                onClick={() => setSelectedFinding(finding)}
                className="group bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-5 rounded-xl cursor-pointer transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-white font-mono">{finding.area}</span>
                    {getStatusBadge(finding.status)}
                    {finding.riskLevel !== 'None' && (
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        Risk: {finding.riskLevel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-1">{finding.problem}</p>
                </div>

                <div className="flex items-center gap-3 text-xs text-emerald-400 group-hover:text-emerald-300 font-medium shrink-0">
                  <span className="hidden sm:inline">View Details</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Finding Details Modal */}
      <FindingModal finding={selectedFinding} onClose={() => setSelectedFinding(null)} />
    </div>
  );
};
