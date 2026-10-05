import React, { useState } from 'react';
import {
  BookOpen,
  FolderTree,
  Terminal,
  FileCode,
  Server,
  Database,
  ShieldCheck,
  Copy,
  Check,
  Code,
  Laptop,
} from 'lucide-react';

export const ProjectDocsPage: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const folderStructureText = `webshield/
├── server.ts                    # Express backend & Vite middleware server entry
├── server/
│   ├── db.ts                    # MongoDB connection & persistent fallback datastore
│   ├── models/
│   │   ├── User.ts              # Mongoose User model (bcrypt password hashing)
│   │   └── Scan.ts              # Mongoose Scan & Finding models
│   ├── middleware/
│   │   └── auth.ts              # JWT token verification middleware
│   ├── routes/
│   │   ├── authRoutes.ts        # Register, Login, Demo-Login, Profile
│   │   └── scanRoutes.ts        # Run scan, History, Dashboard stats, Reports
│   └── services/
│       └── securityScanner.ts   # Safe non-destructive testing engine (5 categories)
├── src/
│   ├── App.tsx                  # Root React routing & state controller
│   ├── main.tsx                 # React DOM mount point
│   ├── index.css                # Tailwind CSS styling
│   ├── types.ts                 # Shared TypeScript interfaces
│   ├── services/
│   │   └── api.ts               # Centralized HTTP client (JWT token management)
│   ├── components/
│   │   ├── Navbar.tsx           # Navigation bar with user badge & DB status
│   │   └── FindingModal.tsx     # Interactive finding inspector dialog
│   └── pages/
│       ├── LoginPage.tsx        # User authentication & 1-click evaluator demo
│       ├── RegisterPage.tsx     # Student & auditor registration
│       ├── DashboardPage.tsx    # Metrics, charts, weak areas, recent scans
│       ├── ScanPage.tsx         # Website URL input & animated scan checklist
│       ├── ScanResultsPage.tsx  # Score dial, 5 check cards, finding drawers
│       ├── ScanHistoryPage.tsx  # Searchable & filterable past scan records
│       ├── ReportPage.tsx       # Printable "WEB SECURITY REPORT" executive view
│       └── ProjectDocsPage.tsx  # B.Tech viva guide & VS Code setup instructions
├── .env.example                 # Environment variables specification
├── package.json                 # Node dependencies & build scripts
├── tsconfig.json                # TypeScript compiler configuration
└── vite.config.ts               # Vite & Tailwind bundler configuration`;

  const envExampleText = `# JWT Secret Key for token signing and verification
JWT_SECRET="webshield_super_secret_jwt_key_2026"

# MongoDB Connection URI (Local instance or MongoDB Atlas Cloud)
MONGODB_URI="mongodb://localhost:27017/webshield"
# Or MongoDB Atlas cloud cluster:
# MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/webshield?retryWrites=true&w=majority"

# Server Port (Runs both Express API and Vite React frontend on port 3000)
PORT=3000`;

  const installCommands = `# 1. Clone or extract project folder
cd webshield

# 2. Install all required dependencies
npm install

# 3. Create .env configuration file
cp .env.example .env

# 4. Start the full-stack development server
npm run dev

# 5. Open in browser:
# http://localhost:3000`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Final-Year B.Tech Capstone Documentation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
          WebShield Project Guide & Architecture
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Complete project blueprint, setup instructions for Visual Studio Code, MongoDB integration guide,
          and security audit methodology for submission and viva evaluation.
        </p>
      </div>

      {/* Quick Specs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-mono block">Frontend</span>
            <span className="text-sm font-bold text-white">React.js & Tailwind</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-mono block">Backend</span>
            <span className="text-sm font-bold text-white">Node.js & Express.js</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-mono block">Database</span>
            <span className="text-sm font-bold text-white">MongoDB & Mongoose</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-mono block">Security</span>
            <span className="text-sm font-bold text-white">bcryptjs & JWT Auth</span>
          </div>
        </div>
      </div>

      {/* Step-by-Step Instructions to Run in VS Code */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white font-mono">
              Instructions to Run the Project in VS Code
            </h2>
          </div>
          <button
            onClick={() => copyToClipboard(installCommands, 'commands')}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
          >
            {copiedSection === 'commands' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'commands' ? 'Copied' : 'Copy Commands'}</span>
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300">
          <div className="space-y-1">
            <h3 className="font-bold text-white font-mono flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">1</span>
              <span>Open Project in Visual Studio Code</span>
            </h3>
            <p className="text-slate-400 pl-7">
              Launch VS Code, click <strong>File &gt; Open Folder...</strong> and select the project directory. Open an integrated terminal with <code className="text-emerald-400">Ctrl + `</code> (or <strong>Terminal &gt; New Terminal</strong>).
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-white font-mono flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">2</span>
              <span>Install Project Dependencies</span>
            </h3>
            <p className="text-slate-400 pl-7">
              Run the standard npm installation command in the terminal to install all packages:
            </p>
            <div className="pl-7 pt-1">
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs">
                npm install
              </pre>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-white font-mono flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">3</span>
              <span>Configure Environment Variables (.env)</span>
            </h3>
            <p className="text-slate-400 pl-7">
              Create a <code className="text-emerald-400">.env</code> file in the root folder with your MongoDB connection string and JWT secret:
            </p>
            <div className="pl-7 pt-1">
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto">
                {envExampleText}
              </pre>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-white font-mono flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">4</span>
              <span>MongoDB Connection Note</span>
            </h3>
            <p className="text-slate-400 pl-7">
              WebShield natively supports local MongoDB (<code className="text-emerald-400">mongodb://localhost:27017/webshield</code>) or a free cloud cluster from <strong>MongoDB Atlas</strong>. If MongoDB is not running locally, WebShield automatically engages an <strong>embedded persistent datastore</strong> with zero configuration, allowing instant review!
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-white font-mono flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">5</span>
              <span>Start Development Server</span>
            </h3>
            <div className="pl-7 pt-1">
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs">
                npm run dev
              </pre>
            </div>
            <p className="text-slate-400 pl-7">
              Open your browser at <strong className="text-white">http://localhost:3000</strong>. Use the <strong>1-Click Demo Login</strong> button or register a new user to start scanning websites.
            </p>
          </div>
        </div>
      </div>

      {/* Complete Folder Structure */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <FolderTree className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white font-mono">
              Complete Project Folder Structure
            </h2>
          </div>
          <button
            onClick={() => copyToClipboard(folderStructureText, 'tree')}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
          >
            {copiedSection === 'tree' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'tree' ? 'Copied' : 'Copy Tree'}</span>
          </button>
        </div>

        <pre className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono leading-relaxed text-slate-300 overflow-x-auto shadow-inner">
          {folderStructureText}
        </pre>
      </div>

      {/* Security Engine Technical Explanation (Viva Prep) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white font-mono">
            Security Scanner Audit Methodology (Viva Q&A Preparation)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="font-mono font-bold text-emerald-400">1. HTTPS Availability (25 Pts)</h3>
            <p className="text-slate-300 leading-relaxed">
              Audits TLS protocol presence and checks whether plaintext HTTP requests on port 80 are automatically upgraded via permanent 301/308 redirects to HTTPS.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="font-mono font-bold text-cyan-400">2. Defensive Security Headers (25 Pts)</h3>
            <p className="text-slate-300 leading-relaxed">
              Examines Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), X-Frame-Options (Clickjacking defense), and X-Content-Type-Options (MIME-sniffing defense).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="font-mono font-bold text-amber-400">3. Cookie Security Attributes (20 Pts)</h3>
            <p className="text-slate-300 leading-relaxed">
              Parses Set-Cookie response directives to verify the presence of Secure (HTTPS-only transit), HttpOnly (mitigates document.cookie XSS theft), and SameSite (CSRF defense).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="font-mono font-bold text-purple-400">4. Authentication & Server Config (15 Pts)</h3>
            <p className="text-slate-300 leading-relaxed">
              Detects server software version disclosure through Server and X-Powered-By banners, which provides attack surface reconnaissance for automated vulnerability scanning.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 md:col-span-2">
            <h3 className="font-mono font-bold text-rose-400">5. Input Validation & Form Attributes (15 Pts)</h3>
            <p className="text-slate-300 leading-relaxed">
              Safely inspects HTML form payloads to confirm forms post over HTTPS rather than cleartext HTTP, inspects sensitive password field transmission methods, and verifies client-side validation constraints and anti-CSRF token parameters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
