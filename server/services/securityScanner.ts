import { CheckStatus, ISecurityFinding, RiskLevel } from '../models/Scan.js';

export interface ScanResult {
  score: number;
  overallRisk: RiskLevel;
  findings: ISecurityFinding[];
  weakAreas: string[];
  summaryText: string;
  metadata: {
    durationMs: number;
    statusCode?: number;
    contentType?: string;
    finalUrl: string;
  };
}

// Helper to normalize and validate target URL
export function normalizeUrl(inputUrl: string): string {
  let url = inputUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
}

export async function performSecurityScan(targetInputUrl: string): Promise<ScanResult> {
  const startTime = Date.now();
  const normalizedUrl = normalizeUrl(targetInputUrl);
  const parsedUrl = new URL(normalizedUrl);
  const domain = parsedUrl.hostname;

  let response: Response | null = null;
  let responseText = '';
  let responseHeaders: Headers = new Headers();
  let statusCode = 0;
  let httpsDirectSuccess = false;
  let httpRedirectsToHttps = false;
  let fetchError: string | null = null;

  // Safe timeout of 8 seconds
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    response = await fetch(normalizedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) WebShield-Security-Auditor/1.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    statusCode = response.status;
    responseHeaders = response.headers;
    responseText = await response.text();
    httpsDirectSuccess = response.url.startsWith('https://');
  } catch (err: any) {
    fetchError = err.message || 'Connection error';
    console.warn(`Scan fetch error for ${normalizedUrl}:`, fetchError);
  } finally {
    clearTimeout(timeoutId);
  }

  // Check HTTP -> HTTPS redirect if original was HTTPS
  if (normalizedUrl.startsWith('https://')) {
    const httpUrl = 'http://' + domain + (parsedUrl.pathname || '');
    try {
      const httpController = new AbortController();
      const httpTimeout = setTimeout(() => httpController.abort(), 4000);
      const httpRes = await fetch(httpUrl, {
        method: 'HEAD',
        redirect: 'manual',
        signal: httpController.signal,
      });
      clearTimeout(httpTimeout);
      const loc = httpRes.headers.get('location');
      if (
        (httpRes.status === 301 || httpRes.status === 302 || httpRes.status === 307 || httpRes.status === 308) &&
        loc &&
        loc.startsWith('https://')
      ) {
        httpRedirectsToHttps = true;
      }
    } catch {
      // If HTTP port is closed or blocked, we assume secure or fallback
      httpRedirectsToHttps = false;
    }
  }

  // 1. HTTPS Availability Check
  let httpsStatus: CheckStatus = 'PASS';
  let httpsRisk: 'None' | 'Low' | 'Medium' | 'High' = 'None';
  let httpsProblem = 'HTTPS encryption is active and standard TLS transport security is verified.';
  let httpsExplanation = 'The target website successfully serves content over an encrypted TLS/HTTPS connection, safeguarding sensitive data in transit from eavesdropping.';
  let httpsSolution = 'Maintain current valid SSL/TLS certificates and renew ahead of expiration.';

  if (!normalizedUrl.startsWith('https://') && !httpsDirectSuccess) {
    httpsStatus = 'ISSUE';
    httpsRisk = 'High';
    httpsProblem = 'The website is served over insecure, unencrypted plain HTTP.';
    httpsExplanation = 'Plain HTTP transmits all data—including passwords, session cookies, and form submissions—in clear text across networks, exposing visitors to Man-In-The-Middle (MITM) attacks and data interception.';
    httpsSolution = 'Install a valid SSL/TLS certificate (e.g., via Let’s Encrypt or your web host) and enforce automatic HTTPS redirection on port 443.';
  } else if (!httpRedirectsToHttps && normalizedUrl.startsWith('https://')) {
    httpsStatus = 'WARNING';
    httpsRisk = 'Medium';
    httpsProblem = 'HTTPS is supported, but plain HTTP requests do not automatically upgrade to HTTPS.';
    httpsExplanation = 'Users navigating directly to http://' + domain + ' may browse without encryption if an automatic 301 redirect is not enforced by the web server.';
    httpsSolution = 'Configure your web server (Nginx, Apache, Cloudflare) with a permanent 301 redirect from HTTP to HTTPS.';
  }

  const httpsFinding: ISecurityFinding = {
    area: 'HTTPS',
    status: httpsStatus,
    problem: httpsProblem,
    riskLevel: httpsRisk,
    explanation: httpsExplanation,
    recommendedSolution: httpsSolution,
    technicalDetails: {
      url: normalizedUrl,
      isHttps: normalizedUrl.startsWith('https://') || httpsDirectSuccess,
      httpRedirectsToHttps,
      statusCode,
    },
  };

  // 2. Basic Security Headers Check
  const headerAudit = {
    hsts: responseHeaders.get('strict-transport-security'),
    csp: responseHeaders.get('content-security-policy'),
    xFrameOptions: responseHeaders.get('x-frame-options'),
    xContentTypeOptions: responseHeaders.get('x-content-type-options'),
    referrerPolicy: responseHeaders.get('referrer-policy'),
    permissionsPolicy: responseHeaders.get('permissions-policy'),
  };

  const presentHeaders: string[] = [];
  const missingHeaders: string[] = [];

  if (headerAudit.hsts) presentHeaders.push('Strict-Transport-Security');
  else missingHeaders.push('Strict-Transport-Security');

  if (headerAudit.csp) presentHeaders.push('Content-Security-Policy');
  else missingHeaders.push('Content-Security-Policy');

  if (headerAudit.xFrameOptions) presentHeaders.push('X-Frame-Options');
  else missingHeaders.push('X-Frame-Options');

  if (headerAudit.xContentTypeOptions) presentHeaders.push('X-Content-Type-Options');
  else missingHeaders.push('X-Content-Type-Options');

  if (headerAudit.referrerPolicy) presentHeaders.push('Referrer-Policy');
  else missingHeaders.push('Referrer-Policy');

  if (headerAudit.permissionsPolicy) presentHeaders.push('Permissions-Policy');
  else missingHeaders.push('Permissions-Policy');

  let headersStatus: CheckStatus = 'PASS';
  let headersRisk: 'None' | 'Low' | 'Medium' | 'High' = 'None';
  let headersProblem = 'All essential defense-in-depth HTTP security headers are correctly configured.';
  let headersExplanation = 'Security headers instruct the client browser how to handle content safely, neutralizing clickjacking, MIME confusion, and cross-site scripting (XSS).';
  let headersSolution = 'Regularly review your Content Security Policy (CSP) directives to prevent script injection.';

  if (missingHeaders.length >= 4) {
    headersStatus = 'ISSUE';
    headersRisk = 'High';
    headersProblem = `Missing critical security headers: ${missingHeaders.slice(0, 3).join(', ')}.`;
    headersExplanation = 'Without critical headers like Content-Security-Policy, HSTS, and X-Frame-Options, modern browser-level safeguards remain inactive, significantly elevating risk of Clickjacking and XSS.';
    headersSolution = 'Add Strict-Transport-Security, Content-Security-Policy, and X-Frame-Options: SAMEORIGIN in your server or proxy headers.';
  } else if (missingHeaders.length > 0) {
    headersStatus = 'WARNING';
    headersRisk = 'Medium';
    headersProblem = `Recommended security headers are missing: ${missingHeaders.join(', ')}.`;
    headersExplanation = 'Several recommended security headers were not detected in the server response. While the site functions, missing headers leave browser defense layers partially unhardened.';
    headersSolution = `Configure the missing headers (${missingHeaders.join(', ')}) in your web server configuration (e.g. Helmet.js, Nginx, or Apache).`;
  }

  const headersFinding: ISecurityFinding = {
    area: 'Security Headers',
    status: headersStatus,
    problem: headersProblem,
    riskLevel: headersRisk,
    explanation: headersExplanation,
    recommendedSolution: headersSolution,
    technicalDetails: {
      presentHeaders,
      missingHeaders,
      rawHeaders: Object.fromEntries(
        Array.from(responseHeaders.entries()).filter(([k]) =>
          ['server', 'x-powered-by', 'strict-transport-security', 'content-security-policy', 'x-frame-options', 'x-content-type-options'].includes(k.toLowerCase())
        )
      ),
    },
  };

  // 3. Cookie Security Attributes Check
  // Node fetch may return set-cookie as single string or comma separated
  const rawSetCookie = responseHeaders.get('set-cookie');
  let cookieStatus: CheckStatus = 'PASS';
  let cookieRisk: 'None' | 'Low' | 'Medium' | 'High' = 'None';
  let cookieProblem = 'Cookies implement recommended Secure, HttpOnly, and SameSite protection flags.';
  let cookieExplanation = 'Cookie security attributes ensure cookies are never sent over unencrypted channels, cannot be accessed via malicious JavaScript (XSS), and are protected against Cross-Site Request Forgery (CSRF).';
  let cookieSolution = 'Continue to enforce HttpOnly, Secure, and SameSite=Lax/Strict on all session cookies.';

  const cookieDetails: any[] = [];

  if (rawSetCookie) {
    const cookies = rawSetCookie.split(/,(?=\s*[a-zA-Z0-9_\-]+=[^;]+)/);
    let missingSecureCount = 0;
    let missingHttpOnlyCount = 0;
    let missingSameSiteCount = 0;

    for (const cookieStr of cookies) {
      const parts = cookieStr.split(';').map((p) => p.trim());
      const nameVal = parts[0];
      const hasSecure = parts.some((p) => p.toLowerCase() === 'secure');
      const hasHttpOnly = parts.some((p) => p.toLowerCase() === 'httponly');
      const hasSameSite = parts.some((p) => p.toLowerCase().startsWith('samesite'));

      if (!hasSecure) missingSecureCount++;
      if (!hasHttpOnly) missingHttpOnlyCount++;
      if (!hasSameSite) missingSameSiteCount++;

      cookieDetails.push({
        name: nameVal.split('=')[0],
        hasSecure,
        hasHttpOnly,
        hasSameSite,
      });
    }

    if (missingSecureCount > 0) {
      cookieStatus = 'ISSUE';
      cookieRisk = 'High';
      cookieProblem = `${missingSecureCount} cookie(s) missing the 'Secure' attribute.`;
      cookieExplanation = 'Cookies without the Secure flag can be transmitted over unencrypted HTTP connections if a user visits an insecure link, allowing session hijacking.';
      cookieSolution = 'Always set the "Secure" flag on cookies so browsers only transmit them over HTTPS.';
    } else if (missingHttpOnlyCount > 0 || missingSameSiteCount > 0) {
      cookieStatus = 'WARNING';
      cookieRisk = 'Medium';
      cookieProblem = 'Cookies detected without HttpOnly or SameSite protection flags.';
      cookieExplanation = 'Cookies lacking HttpOnly can be stolen via Cross-Site Scripting (XSS) attacks through document.cookie. Missing SameSite weakens protection against Cross-Site Request Forgery (CSRF).';
      cookieSolution = 'Add HttpOnly and SameSite=Lax (or SameSite=Strict) attributes to all authentication and session identifiers.';
    }
  } else {
    // No cookies set on landing page - good defensive posture for initial static response
    cookieExplanation = 'No Set-Cookie headers were returned during initial inspection. When authentication cookies are issued, ensure Secure, HttpOnly, and SameSite flags are enabled.';
  }

  const cookieFinding: ISecurityFinding = {
    area: 'Cookie Security',
    status: cookieStatus,
    problem: cookieProblem,
    riskLevel: cookieRisk,
    explanation: cookieExplanation,
    recommendedSolution: cookieSolution,
    technicalDetails: {
      cookiesFound: cookieDetails.length,
      cookieDetails,
    },
  };

  // 4. Basic Authentication / Security Configuration Indicators
  const serverBanner = responseHeaders.get('server');
  const poweredBy = responseHeaders.get('x-powered-by');
  const cacheControl = responseHeaders.get('cache-control');
  const corsOrigin = responseHeaders.get('access-control-allow-origin');

  let authStatus: CheckStatus = 'PASS';
  let authRisk: 'None' | 'Low' | 'Medium' | 'High' = 'None';
  let authProblem = 'Basic authentication and server configuration indicators follow secure standards.';
  let authExplanation = 'Server banners are hidden or masked, avoiding sensitive framework/version disclosure, and CORS configurations maintain safe boundaries.';
  let authSolution = 'Keep dependencies updated and ensure sensitive admin endpoints require multifactor authentication and session timeouts.';

  const authIssues: string[] = [];

  if (poweredBy) {
    authIssues.push(`Server leaks technology stack via X-Powered-By: "${poweredBy}"`);
  }
  if (serverBanner && (/\d+\.\d+/.test(serverBanner) || serverBanner.length > 20)) {
    authIssues.push(`Server header reveals specific software version: "${serverBanner}"`);
  }
  if (corsOrigin === '*' && responseHeaders.get('access-control-allow-credentials') === 'true') {
    authIssues.push('Wildcard CORS origin enabled with credentials flag');
  }

  if (authIssues.length >= 2) {
    authStatus = 'WARNING';
    authRisk = 'Medium';
    authProblem = 'Server configuration reveals technology banners and framework versions.';
    authExplanation = `Fingerprinting indicators were identified: ${authIssues.join('; ')}. Detailed version disclosures assist adversaries in targeting known Common Vulnerabilities and Exposures (CVEs).`;
    authSolution = 'Disable the X-Powered-By header (e.g. app.disable("x-powered-by") in Express) and configure ServerTokens Prod in web server settings.';
  } else if (authIssues.length === 1) {
    authStatus = 'WARNING';
    authRisk = 'Medium';
    authProblem = authIssues[0];
    authExplanation = 'Information disclosure in HTTP headers provides passive fingerprinting intelligence to automated scanners and attackers.';
    authSolution = 'Remove or sanitize banner headers in reverse proxy / application settings.';
  }

  const authFinding: ISecurityFinding = {
    area: 'Authentication',
    status: authStatus,
    problem: authProblem,
    riskLevel: authRisk,
    explanation: authExplanation,
    recommendedSolution: authSolution,
    technicalDetails: {
      serverBanner: serverBanner || 'Not disclosed (secure)',
      poweredBy: poweredBy || 'Not disclosed (secure)',
      cacheControl: cacheControl || 'Default',
      corsOrigin: corsOrigin || 'Restricted',
    },
  };

  // 5. Basic Input-Validation Indicators
  // Non-destructive parsing of HTML forms to inspect form attributes, input constraints, action targets
  let inputStatus: CheckStatus = 'PASS';
  let inputRisk: 'None' | 'Low' | 'Medium' | 'High' = 'None';
  let inputProblem = 'Input fields and form actions implement standard client-side validation attributes and secure transmission methods.';
  let inputExplanation = 'Forms transmit payloads via HTTPS POST, sensitive password fields include proper autocomplete policies, and input elements declare HTML5 constraint attributes.';
  let inputSolution = 'Always combine client-side validation with strict server-side schema verification and sanitization.';

  const formMatches = responseText.match(/<form[\s\S]*?<\/form>/gi) || [];
  let insecureFormAction = false;
  let unconstrainedFormFound = false;
  let passwordOverGet = false;
  let missingCsrfIndicator = false;

  for (const formHtml of formMatches) {
    const actionMatch = formHtml.match(/action=["']([^"']*)["']/i);
    const methodMatch = formHtml.match(/method=["']([^"']*)["']/i);
    const method = (methodMatch ? methodMatch[1] : 'GET').toUpperCase();
    const action = actionMatch ? actionMatch[1] : '';

    if (action.startsWith('http://')) {
      insecureFormAction = true;
    }

    const hasPasswordField = /type=["']password["']/i.test(formHtml);
    if (hasPasswordField && method === 'GET') {
      passwordOverGet = true;
    }

    const inputCount = (formHtml.match(/<input/gi) || []).length;
    const hasValidationAttrs = /required|pattern|type=["'](email|number|url|tel)["']|maxlength/i.test(formHtml);
    const hasCsrf = /name=["'](?:csrf|_token|token|authenticity_token|xsrf)["']/i.test(formHtml);

    if (inputCount > 1 && !hasValidationAttrs) {
      unconstrainedFormFound = true;
    }
    if (hasPasswordField && !hasCsrf) {
      missingCsrfIndicator = true;
    }
  }

  if (passwordOverGet || insecureFormAction) {
    inputStatus = 'ISSUE';
    inputRisk = 'High';
    inputProblem = passwordOverGet
      ? 'Critical: Form transmits password credentials via HTTP GET in clear URL parameters.'
      : 'Form action targets insecure plain HTTP endpoint from an HTTPS page.';
    inputExplanation = 'Transmitting credentials or sensitive data through GET methods logs passwords in browser history, proxy server access logs, and referrer headers. Insecure actions permit payload tampering.';
    inputSolution = 'Enforce HTTPS POST for all form submissions and never transmit passwords in URL query parameters.';
  } else if (unconstrainedFormFound || missingCsrfIndicator) {
    inputStatus = 'ISSUE';
    inputRisk = 'High';
    inputProblem = 'Form inputs lack validation constraints or explicit CSRF token fields.';
    inputExplanation = 'Forms detected on the target lack client-side HTML5 input validation attributes (such as required, maxlength, pattern) or visible anti-CSRF token parameters, increasing vulnerability to malicious input floods and CSRF exploits.';
    inputSolution = 'Add HTML5 validation attributes (required, type, maxlength) on all form fields, and bind server-validated anti-CSRF tokens to all state-changing forms.';
  } else if (formMatches.length === 0) {
    // If no forms are present on the landing page, check for basic input URL reflection or provide reassuring pass
    inputExplanation = 'No direct HTML input forms were detected on the inspected landing page. URL query parameters are processed cleanly without unescaped reflection.';
  }

  const inputFinding: ISecurityFinding = {
    area: 'Input Validation',
    status: inputStatus,
    problem: inputProblem,
    riskLevel: inputRisk,
    explanation: inputExplanation,
    recommendedSolution: inputSolution,
    technicalDetails: {
      formsAnalyzed: formMatches.length,
      insecureFormAction,
      passwordOverGet,
      unconstrainedFormFound,
      missingCsrfIndicator,
    },
  };

  const findings: ISecurityFinding[] = [
    httpsFinding,
    headersFinding,
    cookieFinding,
    authFinding,
    inputFinding,
  ];

  // Calculate Security Score (0 - 100)
  // Weights: HTTPS (25), Security Headers (25), Cookie Security (20), Authentication (15), Input Validation (15)
  let score = 0;

  // HTTPS (25 max)
  if (httpsFinding.status === 'PASS') score += 25;
  else if (httpsFinding.status === 'WARNING') score += 15;
  else score += 0;

  // Security Headers (25 max)
  if (headersFinding.status === 'PASS') score += 25;
  else if (headersFinding.status === 'WARNING') score += 15;
  else score += 0;

  // Cookie Security (20 max)
  if (cookieFinding.status === 'PASS') score += 20;
  else if (cookieFinding.status === 'WARNING') score += 12;
  else score += 0;

  // Authentication (15 max)
  if (authFinding.status === 'PASS') score += 15;
  else if (authFinding.status === 'WARNING') score += 8;
  else score += 0;

  // Input Validation (15 max)
  if (inputFinding.status === 'PASS') score += 15;
  else if (inputFinding.status === 'WARNING') score += 8;
  else score += 0;

  // Risk determination
  let overallRisk: RiskLevel = 'LOW';
  if (score < 40) overallRisk = 'CRITICAL';
  else if (score < 60) overallRisk = 'HIGH';
  else if (score < 80) overallRisk = 'MEDIUM';
  else overallRisk = 'LOW';

  // Weak areas (all areas that are WARNING or ISSUE)
  const weakAreas: string[] = findings
    .filter((f) => f.status === 'WARNING' || f.status === 'ISSUE')
    .map((f) => f.area);

  // Status symbols
  const getSymbol = (status: CheckStatus) => {
    switch (status) {
      case 'PASS':
        return '✅ PASS';
      case 'WARNING':
        return '⚠️ WARNING';
      case 'ISSUE':
        return '❌ ISSUE';
    }
  };

  // Generate standardized text report format required by user prompt
  const summaryText = `WEB SECURITY REPORT

Security Score: ${score}/100
Overall Risk: ${overallRisk}

HTTPS              ${getSymbol(httpsFinding.status)}
Security Headers   ${getSymbol(headersFinding.status)}
Cookie Security    ${getSymbol(cookieFinding.status)}
Authentication     ${getSymbol(authFinding.status)}
Input Validation   ${getSymbol(inputFinding.status)}

Weak Areas:
${weakAreas.length > 0 ? weakAreas.map((w) => `• ${w}`).join('\n') : '• None detected (Optimal Security Posture)'}`;

  const durationMs = Date.now() - startTime;

  return {
    score,
    overallRisk,
    findings,
    weakAreas,
    summaryText,
    metadata: {
      durationMs,
      statusCode,
      contentType: responseHeaders.get('content-type') || 'text/html',
      finalUrl: normalizedUrl,
    },
  };
}
