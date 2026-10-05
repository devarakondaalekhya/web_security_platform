import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { initDatabase, createScan, findUserByEmail, createUser } from './server/db.js';
import { authRouter } from './server/routes/authRoutes.js';
import { scanRouter } from './server/routes/scanRoutes.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable CORS and body parsing
app.use(cors());
app.use(express.json());

// API Routes FIRST
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/scans', scanRouter);

// Pre-seed initial demonstration data if empty for viva / instant evaluation
async function seedInitialData() {
  try {
    const demoEmail = 'student.auditor@webshield.edu';
    let user = await findUserByEmail(demoEmail);
    if (!user) {
      const passwordHash = await bcrypt.hash('AuditorDemo2026!', 10);
      user = await createUser({
        name: 'Alex Rivera (B.Tech Scholar)',
        email: demoEmail,
        passwordHash,
        role: 'security_lead',
      });
      console.log('🌱 Seeded demo security researcher account');

      const userId = user._id || user.id;

      // Seed a sample scan reflecting the exact prompt's example:
      // HTTPS PASS, Security Headers WARNING, Cookie Security PASS, Authentication WARNING, Input Validation ISSUE => Score 75/100, MEDIUM Risk
      await createScan({
        userId,
        userEmail: demoEmail,
        targetUrl: 'https://test-banking-portal.internal.demo',
        scanDate: new Date(Date.now() - 3600000 * 2), // 2 hours ago
        score: 75,
        overallRisk: 'MEDIUM',
        findings: [
          {
            area: 'HTTPS',
            status: 'PASS',
            problem: 'HTTPS encryption is active and TLS certificate is valid.',
            riskLevel: 'None',
            explanation: 'The website encrypts traffic in transit using TLS 1.3, ensuring confidentiality and integrity.',
            recommendedSolution: 'Ensure automated SSL certificate renewal is in place.',
            technicalDetails: { isHttps: true, httpRedirectsToHttps: true, statusCode: 200 },
          },
          {
            area: 'Security Headers',
            status: 'WARNING',
            problem: 'A recommended security header is missing: Content-Security-Policy, Permissions-Policy.',
            riskLevel: 'Medium',
            explanation: 'Without Content-Security-Policy (CSP), malicious scripts injected via Cross-Site Scripting (XSS) can execute unrestrained.',
            recommendedSolution: 'Configure Content-Security-Policy and Strict-Transport-Security in web server headers.',
            technicalDetails: {
              presentHeaders: ['Strict-Transport-Security', 'X-Frame-Options', 'X-Content-Type-Options'],
              missingHeaders: ['Content-Security-Policy', 'Permissions-Policy'],
            },
          },
          {
            area: 'Cookie Security',
            status: 'PASS',
            problem: 'Session cookies implement Secure, HttpOnly, and SameSite=Lax flags.',
            riskLevel: 'None',
            explanation: 'Cookies cannot be accessed via JavaScript document.cookie and are prevented from CSRF submission.',
            recommendedSolution: 'Maintain strict cookie policy across all subdomains.',
            technicalDetails: { cookiesFound: 2 },
          },
          {
            area: 'Authentication',
            status: 'WARNING',
            problem: 'Server discloses framework runtime via X-Powered-By: "Express".',
            riskLevel: 'Medium',
            explanation: 'Technology banner disclosures give reconnaissance advantages to attackers scanning for framework-specific zero-days.',
            recommendedSolution: 'Configure app.disable("x-powered-by") in Express to suppress tech fingerprinting.',
            technicalDetails: { poweredBy: 'Express', serverBanner: 'nginx/1.18.0' },
          },
          {
            area: 'Input Validation',
            status: 'ISSUE',
            problem: 'Login forms detected with unconstrained input fields and absent anti-CSRF token.',
            riskLevel: 'High',
            explanation: 'Input fields do not declare HTML5 validation constraints, and the form submission does not include a synchronized anti-CSRF token.',
            recommendedSolution: 'Add input length/pattern validation and implement cryptographically random anti-CSRF tokens.',
            technicalDetails: { formsAnalyzed: 1, unconstrainedFormFound: true, missingCsrfIndicator: true },
          },
        ],
        weakAreas: ['Security Headers', 'Authentication', 'Input Validation'],
        summaryText: `WEB SECURITY REPORT

Security Score: 75/100
Overall Risk: MEDIUM

HTTPS              ✅ PASS
Security Headers   ⚠️ WARNING
Cookie Security    ✅ PASS
Authentication     ⚠️ WARNING
Input Validation   ❌ ISSUE

Weak Areas:
• Security Headers
• Authentication
• Input Validation`,
        metadata: {
          durationMs: 432,
          statusCode: 200,
          contentType: 'text/html',
        },
      });

      console.log('🌱 Seeded sample baseline security audit');
    }
  } catch (err) {
    console.warn('Seeding initial data note:', err);
  }
}

async function startServer() {
  // Initialize Database
  await initDatabase();
  await seedInitialData();

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️ WebShield server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
