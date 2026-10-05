import React, { useEffect, useState } from 'react';
import {
  History,
  Search,
  Filter,
  ExternalLink,
  Trash2,
  FileText,
  AlertCircle,
  Clock,
  Shield,
  Plus,
} from 'lucide-react';
import { api } from '../services/api';
import { IScan } from '../types';

interface ScanHistoryPageProps {
  onViewScanResult: (scan: IScan) => void;
  onViewReport: (scan: IScan) => void;
  onNavigateScan: () => void;
}

export const ScanHistoryPage: React.FC<ScanHistoryPageProps> = ({
  onViewScanResult,
  onViewReport,
  onNavigateScan,
}) => {
  const [scans, setScans] = useState<IScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [error, setError] = useState<string | null>(null);

  const fetchScans = async () => {
    try {
      setLoading(true);
      const data = await api.getScans();
      setScans(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch scan history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  const handleDelete = async (id: string, url: string) => {
    if (!confirm(`Are you sure you want to delete the scan record for ${url}?`)) return;
    try {
      await api.deleteScan(id);
      setScans((prev) => prev.filter((s) => (s._id || s.id) !== id));
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const filteredScans = scans.filter((scan) => {
    const matchesQuery = scan.targetUrl.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || scan.overallRisk === riskFilter;
    return matchesQuery && matchesRisk;
  });

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            LOW
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
            MEDIUM
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
            HIGH
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
            CRITICAL
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
              Audit & Scan History
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Historical security audit logs saved persistently in database
          </p>
        </div>

        <button
          id="history-new-scan-btn"
          onClick={onNavigateScan}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Launch New Scan</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="history-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by target URL..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 font-mono">Risk Level:</span>
          <select
            id="history-risk-filter"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-mono cursor-pointer"
          >
            <option value="ALL">All Risks</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 font-mono mt-3">Loading scan records...</p>
          </div>
        ) : filteredScans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Target Website</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Risk Level</th>
                  <th className="py-3.5 px-4">Weak Areas</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredScans.map((scan) => (
                  <tr
                    key={scan._id || scan.id}
                    onClick={() => onViewScanResult(scan)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-white font-mono flex items-center gap-2">
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate max-w-xs">{scan.targetUrl}</span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold">
                      <span
                        className={
                          scan.score >= 80
                            ? 'text-emerald-400'
                            : scan.score >= 60
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }
                      >
                        {scan.score}/100
                      </span>
                    </td>
                    <td className="py-4 px-4">{getRiskBadge(scan.overallRisk)}</td>
                    <td className="py-4 px-4">
                      {scan.weakAreas && scan.weakAreas.length > 0 ? (
                        <span className="text-amber-300 font-mono text-[11px]">
                          {scan.weakAreas.join(', ')}
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-mono text-[11px]">None (Secure)</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>
                          {new Date(scan.scanDate).toLocaleDateString()}{' '}
                          {new Date(scan.scanDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewReport(scan);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                        title="View Executive Report"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Report</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(scan._id || scan.id || '', scan.targetUrl);
                        }}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors inline-block"
                        title="Delete scan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center p-6">
            <Shield className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white font-mono">No matching audit logs found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery || riskFilter !== 'ALL'
                ? 'Try adjusting your search keywords or filter criteria.'
                : 'No scans have been performed yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
