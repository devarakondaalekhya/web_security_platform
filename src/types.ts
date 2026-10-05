export type CheckStatus = 'PASS' | 'WARNING' | 'ISSUE';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ISecurityFinding {
  area: string;
  status: CheckStatus;
  problem: string;
  riskLevel: 'None' | 'Low' | 'Medium' | 'High';
  explanation: string;
  recommendedSolution: string;
  technicalDetails?: Record<string, any>;
}

export interface IScan {
  _id?: string;
  id?: string;
  userId: string;
  userEmail: string;
  targetUrl: string;
  scanDate: string;
  score: number;
  overallRisk: RiskLevel;
  findings: ISecurityFinding[];
  weakAreas: string[];
  summaryText: string;
  metadata?: {
    durationMs?: number;
    ipAddress?: string;
    statusCode?: number;
    contentType?: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DashboardStats {
  totalScans: number;
  avgScore: number;
  totalChecks: number;
  passedChecks: number;
  warnings: number;
  issues: number;
  topWeakAreas: { area: string; count: number }[];
  recentScans: IScan[];
  dbStatus?: {
    connected: boolean;
    type: 'mongodb' | 'embedded_storage';
    uri?: string;
    message: string;
  };
}
