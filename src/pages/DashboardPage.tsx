import React, { useEffect, useState } from 'react';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Plus,
  Trash2,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats, IScan } from '../types';

interface DashboardPageProps {
  onNavigateScan: () => void;
  onNavigateHistory: () => void;
  onViewScanResult: (scan: IScan) => void;
  onViewReport: (scan: IScan) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateScan,
  onNavigateHistory,
  onViewScanResult,
  onViewReport,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this scan from your history?')) return;
    try {
      await api.deleteScan(id);
      fetchStats();
    } catch (err: any) {
      alert('Failed to delete scan: ' + err.message);
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            LOW RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
            MEDIUM RISK
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
            HIGH RISK
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
            CRITICAL
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-mono text-slate-400 mt-4">Loading security metrics & telemetry...</p>
      </div>
    );
  }

  const latestScan = stats?.recentScans?.[0];
  const displayScore = latestScan ? latestScan.score : (stats?.avgScore || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
              Security Dashboard
            </h1>
            <button
              id="refresh-dashboard-btn"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh telemetry"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time defensive posture analysis, audit history, and vulnerability metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="start-new-scan-top-btn"
            onClick={onNavigateScan}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Launch New Scan</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Security Score Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Security Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4 mb-2 flex items-baseline gap-2">
            <span
              className={`text-4xl font-extrabold font-mono tracking-tight ${
                displayScore >= 80
                  ? 'text-emerald-400'
                  : displayScore >= 60
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {displayScore}
            </span>
            <span className="text-slate-500 font-mono text-sm">/ 100</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                displayScore >= 80 ? 'bg-emerald-500' : displayScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.max(5, displayScore)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            {latestScan ? 'Latest scan score' : 'Average baseline score'}
          </p>
        </div>

        {/* Total Checks */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Total Checks</span>
            <Shield className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-4 mb-2">
            <span className="text-4xl font-extrabold text-white font-mono">{stats?.totalChecks || 0}</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Across {stats?.totalScans || 0} completed audits</p>
        </div>

        {/* Passed Checks */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-mono">
            <span>Passed Checks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4 mb-2">
            <span className="text-4xl font-extrabold text-emerald-400 font-mono">{stats?.passedChecks || 0}</span>
          </div>
          <p className="text-[11px] text-emerald-500/80 font-mono">Verified compliant ✅</p>
        </div>

        {/* Warnings */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-amber-400 font-mono">
            <span>Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-4 mb-2">
            <span className="text-4xl font-extrabold text-amber-400 font-mono">{stats?.warnings || 0}</span>
          </div>
          <p className="text-[11px] text-amber-500/80 font-mono">Requires hardening ⚠️</p>
        </div>

        {/* Issues */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-rose-400 font-mono">
            <span>Issues</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-4 mb-2">
            <span className="text-4xl font-extrabold text-rose-400 font-mono">{stats?.issues || 0}</span>
          </div>
          <p className="text-[11px] text-rose-500/80 font-mono">Critical weaknesses ❌</p>
        </div>
      </div>

      {/* Weak Security Areas Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Weak Security Areas Identified</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Categories triggering warnings or issues during automated testing
            </p>
          </div>
        </div>

        {stats?.topWeakAreas && stats.topWeakAreas.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {stats.topWeakAreas.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span className="font-semibold">{item.area}</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-200 text-[10px] font-mono">
                  {item.count} occurrences
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-slate-500 font-mono">
            No weak security areas detected across current audits. All evaluated checks are passing!
          </div>
        )}
      </div>

      {/* Recent Scans Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Recent Security Scans</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Audited target websites and compliance scores</p>
          </div>
          {stats?.recentScans && stats.recentScans.length > 0 && (
            <button
              id="view-all-history-btn"
              onClick={onNavigateHistory}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {stats?.recentScans && stats.recentScans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Target Website</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Risk Level</th>
                  <th className="py-3.5 px-4">Audit Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {stats.recentScans.map((scan) => (
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
                    <td className="py-4 px-4 text-slate-400 font-mono">
                      {new Date(scan.scanDate).toLocaleDateString()} {new Date(scan.scanDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewReport(scan);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                        title="View Official Web Security Report"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Report</span>
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, scan._id || scan.id || '')}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors inline-block"
                        title="Delete record"
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
          <div className="py-12 text-center p-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white font-mono">No scans conducted yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Enter an authorized target website URL to run automated security audits and view findings.
            </p>
            <button
              id="empty-state-scan-btn"
              onClick={onNavigateScan}
              className="mt-4 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Start First Security Scan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
