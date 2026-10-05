import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ScanPage } from './pages/ScanPage';
import { ScanResultsPage } from './pages/ScanResultsPage';
import { ScanHistoryPage } from './pages/ScanHistoryPage';
import { ReportPage } from './pages/ReportPage';
import { ProjectDocsPage } from './pages/ProjectDocsPage';
import { api, getStoredToken } from './services/api';
import { User, IScan } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [currentScan, setCurrentScan] = useState<IScan | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [dbType, setDbType] = useState<'mongodb' | 'embedded_storage'>('embedded_storage');

  useEffect(() => {
    const initAuthAndSystem = async () => {
      // Check system DB info
      try {
        const sys = await api.getSystemInfo();
        if (sys?.db?.type) {
          setDbType(sys.db.type);
        }
      } catch {
        // Fallback quiet
      }

      // Check user session
      const token = getStoredToken();
      if (token) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          setCurrentPage('dashboard');
        } catch {
          api.logout();
          setUser(null);
          setCurrentPage('login');
        }
      } else {
        setCurrentPage('login');
      }
      setLoadingInitial(false);
    };

    initAuthAndSystem();
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setCurrentScan(null);
    setCurrentPage('login');
  };

  const handleScanCompleted = (scan: IScan) => {
    setCurrentScan(scan);
    setCurrentPage('results');
  };

  const handleViewScanResult = (scan: IScan) => {
    setCurrentScan(scan);
    setCurrentPage('results');
  };

  const handleViewReport = (scan: IScan) => {
    setCurrentScan(scan);
    setCurrentPage('report');
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-mono">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs tracking-wider text-slate-400">INITIALIZING WEBSHIELD PLATFORM...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Cybersecurity Top Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        user={user}
        onLogout={handleLogout}
        dbType={dbType}
      />

      {/* Main Page Router */}
      <main className="flex-1 pb-16">
        {!user ? (
          <>
            {currentPage === 'register' && (
              <RegisterPage
                onSuccess={handleLoginSuccess}
                onNavigateLogin={() => setCurrentPage('login')}
              />
            )}
            {currentPage === 'docs' && <ProjectDocsPage />}
            {(currentPage === 'login' || (currentPage !== 'register' && currentPage !== 'docs')) && (
              <LoginPage
                onSuccess={handleLoginSuccess}
                onNavigateRegister={() => setCurrentPage('register')}
              />
            )}
          </>
        ) : (
          <>
            {currentPage === 'dashboard' && (
              <DashboardPage
                onNavigateScan={() => setCurrentPage('scan')}
                onNavigateHistory={() => setCurrentPage('history')}
                onViewScanResult={handleViewScanResult}
                onViewReport={handleViewReport}
              />
            )}

            {currentPage === 'scan' && (
              <ScanPage onScanCompleted={handleScanCompleted} />
            )}

            {currentPage === 'results' && currentScan && (
              <ScanResultsPage
                scan={currentScan}
                onNavigateScan={() => setCurrentPage('scan')}
                onViewReport={handleViewReport}
              />
            )}

            {currentPage === 'results' && !currentScan && (
              <div className="max-w-md mx-auto py-16 text-center">
                <p className="text-slate-400 text-sm mb-4">No active scan selected.</p>
                <button
                  onClick={() => setCurrentPage('scan')}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Start New Scan
                </button>
              </div>
            )}

            {currentPage === 'history' && (
              <ScanHistoryPage
                onViewScanResult={handleViewScanResult}
                onViewReport={handleViewReport}
                onNavigateScan={() => setCurrentPage('scan')}
              />
            )}

            {currentPage === 'report' && currentScan && (
              <ReportPage
                scan={currentScan}
                onBack={() => setCurrentPage('results')}
              />
            )}

            {currentPage === 'report' && !currentScan && (
              <div className="max-w-md mx-auto py-16 text-center">
                <p className="text-slate-400 text-sm mb-4">No report selected.</p>
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Return to Dashboard
                </button>
              </div>
            )}

            {currentPage === 'docs' && <ProjectDocsPage />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>WebShield – Web Security Testing Platform • B.Tech Final-Year Capstone Project</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage('docs')}
              className="text-slate-400 hover:text-emerald-400 transition-colors"
            >
              Project Architecture & Guide
            </button>
            <span>•</span>
            <span className="text-emerald-500/80">MERN Security Suite</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
