import React from 'react';
import { X, AlertTriangle, AlertCircle, CheckCircle2, ShieldAlert, Lightbulb, Wrench, FileCode2 } from 'lucide-react';
import { ISecurityFinding } from '../types';

interface FindingModalProps {
  finding: ISecurityFinding | null;
  onClose: () => void;
}

export const FindingModal: React.FC<FindingModalProps> = ({ finding, onClose }) => {
  if (!finding) return null;

  const getStatusBadge = () => {
    switch (finding.status) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" />
            PASS
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-4 h-4" />
            WARNING
          </span>
        );
      case 'ISSUE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-4 h-4" />
            ISSUE
          </span>
        );
    }
  };

  const getRiskBadge = () => {
    const risk = finding.riskLevel;
    let colorClass = 'bg-slate-800 text-slate-300 border-slate-700';
    if (risk === 'High') colorClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    else if (risk === 'Medium') colorClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    else if (risk === 'Low') colorClass = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    else if (risk === 'None') colorClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

    return (
      <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase border ${colorClass}`}>
        Risk: {risk}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold tracking-tight text-white">{finding.area}</h3>
              {getStatusBadge()}
              {getRiskBadge()}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">WebShield Security Finding Inspector</p>
          </div>
          <button
            id="close-finding-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Problem Section */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-rose-400 font-semibold mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Problem</span>
            </div>
            <p className="text-slate-200 leading-relaxed font-sans">{finding.problem}</p>
          </div>

          {/* Simple Explanation Section */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-2">
              <Lightbulb className="w-4 h-4" />
              <span>Simple Explanation</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans">{finding.explanation}</p>
          </div>

          {/* Recommended Solution Section */}
          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
              <Wrench className="w-4 h-4" />
              <span>Recommended Solution</span>
            </div>
            <p className="text-emerald-100/90 leading-relaxed font-sans">{finding.recommendedSolution}</p>
          </div>

          {/* Technical Details Inspection (if available) */}
          {finding.technicalDetails && Object.keys(finding.technicalDetails).length > 0 && (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-semibold mb-2">
                <FileCode2 className="w-4 h-4 text-slate-400" />
                <span>Diagnostic Telemetry</span>
              </div>
              <pre className="text-slate-300 overflow-x-auto p-2 bg-slate-900/80 rounded border border-slate-800/80 text-[11px] leading-snug">
                {JSON.stringify(finding.technicalDetails, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-500">Safe, non-destructive educational testing indicator</span>
          <button
            id="dismiss-finding-modal-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
