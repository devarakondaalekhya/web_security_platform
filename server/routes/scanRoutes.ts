import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { performSecurityScan, normalizeUrl } from '../services/securityScanner.js';
import { createScan, getScansByUser, getScanById, deleteScanById, getDatabaseStatus } from '../db.js';

export const scanRouter = Router();

// Perform a new security audit
scanRouter.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { url, authorizedConfirmed } = req.body;

    if (!url || typeof url !== 'string' || url.trim() === '') {
      res.status(400).json({ success: false, error: 'Website URL is required.' });
      return;
    }

    if (!authorizedConfirmed) {
      res.status(400).json({
        success: false,
        error: 'You must confirm that you own or are authorized to test this target website.',
      });
      return;
    }

    let normalized: string;
    try {
      normalized = normalizeUrl(url);
      const parsed = new URL(normalized);
      if (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost') {
        res.status(400).json({ success: false, error: 'Invalid hostname format. Please enter a valid domain (e.g., example.com).' });
        return;
      }
    } catch {
      res.status(400).json({ success: false, error: 'Invalid website URL format.' });
      return;
    }

    // Execute safe, non-destructive audit
    const scanResult = await performSecurityScan(normalized);

    // Save scan to database
    const newScanRecord = await createScan({
      userId: req.user!.id,
      userEmail: req.user!.email,
      targetUrl: normalized,
      scanDate: new Date(),
      score: scanResult.score,
      overallRisk: scanResult.overallRisk,
      findings: scanResult.findings,
      weakAreas: scanResult.weakAreas,
      summaryText: scanResult.summaryText,
      metadata: scanResult.metadata,
    });

    res.status(201).json({
      success: true,
      message: 'Security scan completed successfully.',
      scan: newScanRecord,
    });
  } catch (error: any) {
    console.error('Scan execution error:', error);
    res.status(500).json({ success: false, error: 'Security scanner failed: ' + error.message });
  }
});

// Get user scan history
scanRouter.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const scans = await getScansByUser(req.user!.id);
    res.json({
      success: true,
      count: scans.length,
      scans,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get aggregated dashboard statistics
scanRouter.get('/stats/summary', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const scans = await getScansByUser(req.user!.id);

    let totalChecks = 0;
    let passedChecks = 0;
    let warnings = 0;
    let issues = 0;
    const weakAreaFrequency: Record<string, number> = {};

    for (const scan of scans) {
      if (Array.isArray(scan.findings)) {
        for (const finding of scan.findings) {
          totalChecks++;
          if (finding.status === 'PASS') passedChecks++;
          else if (finding.status === 'WARNING') warnings++;
          else if (finding.status === 'ISSUE') issues++;
        }
      }
      if (Array.isArray(scan.weakAreas)) {
        for (const area of scan.weakAreas) {
          weakAreaFrequency[area] = (weakAreaFrequency[area] || 0) + 1;
        }
      }
    }

    const avgScore = scans.length > 0
      ? Math.round(scans.reduce((acc: number, s: any) => acc + (s.score || 0), 0) / scans.length)
      : 0;

    const topWeakAreas = Object.entries(weakAreaFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(([area, count]) => ({ area, count }));

    res.json({
      success: true,
      stats: {
        totalScans: scans.length,
        avgScore,
        totalChecks,
        passedChecks,
        warnings,
        issues,
        topWeakAreas,
        recentScans: scans.slice(0, 5),
        dbStatus: getDatabaseStatus(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single scan by ID
scanRouter.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const scan = await getScanById(req.params.id);
    if (!scan) {
      res.status(404).json({ success: false, error: 'Scan record not found.' });
      return;
    }

    // Ensure user owns this scan or has admin role
    if (scan.userId !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Unauthorized to view this scan record.' });
      return;
    }

    res.json({ success: true, scan });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a scan by ID
scanRouter.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deleted = await deleteScanById(req.params.id, req.user!.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Scan not found or already deleted.' });
      return;
    }
    res.json({ success: true, message: 'Scan record removed successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// System database status check
scanRouter.get('/system/info', async (_req, res: Response): Promise<void> => {
  res.json({
    success: true,
    platform: 'WebShield – Web Security Testing Platform',
    version: '1.0.0 (B.Tech Final-Year Edition)',
    db: getDatabaseStatus(),
    timestamp: new Date().toISOString(),
  });
});
