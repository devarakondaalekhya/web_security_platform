import mongoose, { Schema, Document } from 'mongoose';

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

export interface IScan extends Document {
  userId: string;
  userEmail: string;
  targetUrl: string;
  scanDate: Date;
  score: number;
  overallRisk: RiskLevel;
  findings: ISecurityFinding[];
  weakAreas: string[];
  summaryText: string;
  metadata?: {
    durationMs: number;
    ipAddress?: string;
    statusCode?: number;
    contentType?: string;
  };
}

export const SecurityFindingSchema = new Schema<ISecurityFinding>({
  area: { type: String, required: true },
  status: { type: String, enum: ['PASS', 'WARNING', 'ISSUE'], required: true },
  problem: { type: String, required: true },
  riskLevel: { type: String, enum: ['None', 'Low', 'Medium', 'High'], required: true },
  explanation: { type: String, required: true },
  recommendedSolution: { type: String, required: true },
  technicalDetails: { type: Schema.Types.Mixed },
});

export const ScanSchema = new Schema<IScan>({
  userId: { type: String, required: true, index: true },
  userEmail: { type: String, required: true },
  targetUrl: { type: String, required: true },
  scanDate: { type: Date, default: Date.now, index: true },
  score: { type: Number, required: true },
  overallRisk: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
  findings: [SecurityFindingSchema],
  weakAreas: [{ type: String }],
  summaryText: { type: String, required: true },
  metadata: {
    durationMs: { type: Number },
    ipAddress: { type: String },
    statusCode: { type: Number },
    contentType: { type: String },
  },
});

export const ScanModel = mongoose.models.Scan || mongoose.model<IScan>('Scan', ScanSchema);
