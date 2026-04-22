export const TRACKS = [
  {
    id: 'frontend',
    title: 'Frontend Developer',
    subtitle: 'UI engineering · React · web performance',
    domain: 'tech',
    keywords: ['react', 'javascript', 'typescript', 'html', 'css', 'tailwind', 'next.js', 'vite', 'ui', 'frontend'],
    jobs: ['Frontend Developer', 'React Developer', 'UI Engineer', 'Web Developer'],
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    subtitle: 'APIs · Databases · Services',
    domain: 'tech',
    keywords: ['python', 'java', 'node', 'express', 'fastapi', 'django', 'flask', 'sql', 'postgres', 'mysql', 'mongodb', 'redis', 'rest', 'api', 'docker'],
    jobs: ['Backend Developer', 'API Engineer', 'Python Developer', 'Platform Engineer (Junior)'],
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    subtitle: 'SQL · dashboards · business insights',
    domain: 'tech',
    keywords: ['sql', 'excel', 'tableau', 'power bi', 'pandas', 'analytics', 'dashboard', 'kpi', 'metrics', 'reporting'],
    jobs: ['Data Analyst', 'BI Analyst', 'Reporting Analyst', 'Product Analyst (Junior)'],
  },
  {
    id: 'data-science',
    title: 'Data Scientist',
    subtitle: 'ML · modeling · experimentation',
    domain: 'tech',
    keywords: ['machine learning', 'ml', 'python', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'statistics', 'nlp'],
    jobs: ['Data Scientist (Junior)', 'ML Engineer (Intern/Junior)', 'Applied Scientist (Junior)'],
  },
  {
    id: 'cyber',
    title: 'Cybersecurity (Blue Team)',
    subtitle: 'Defense · monitoring · incident response',
    domain: 'tech',
    keywords: ['security', 'siem', 'splunk', 'soc', 'incident response', 'networking', 'linux', 'tcp', 'dns', 'logs'],
    jobs: ['SOC Analyst', 'Security Analyst', 'Blue Team Analyst', 'Incident Response Analyst (Junior)'],
  },
  {
    id: 'finance-analyst',
    title: 'Finance Analyst',
    subtitle: 'FP&A · budgeting · business finance',
    domain: 'finance',
    keywords: ['finance', 'fp&a', 'forecasting', 'budgeting', 'variance analysis', 'financial modeling', 'excel', 'powerpoint', 'kpi', 'reporting', 'p&l'],
    jobs: ['Finance Analyst', 'FP&A Analyst', 'Business Finance Analyst', 'Corporate Finance Analyst (Junior)'],
  },
  {
    id: 'investment-analyst',
    title: 'Investment Analyst',
    subtitle: 'Valuation · research · markets',
    domain: 'finance',
    keywords: ['valuation', 'dcf', 'comps', 'financial statements', 'equity research', 'markets', 'portfolio', 'risk', 'returns', 'powerpoint', 'excel'],
    jobs: ['Investment Analyst', 'Equity Research Analyst (Junior)', 'Valuation Analyst', 'Capital Markets Analyst (Junior)'],
  },
  {
    id: 'accounting',
    title: 'Accounting / Audit',
    subtitle: 'Financial statements · compliance · reporting',
    domain: 'finance',
    keywords: ['accounting', 'audit', 'tax', 'reconciliation', 'bookkeeping', 'balance sheet', 'income statement', 'cash flow', 'gaap', 'ifrs', 'tally', 'quickbooks'],
    jobs: ['Accountant (Junior)', 'Audit Associate', 'Tax Associate (Junior)', 'Accounts Executive'],
  },
  {
    id: 'risk-analyst',
    title: 'Risk Analyst',
    subtitle: 'Risk · controls · analytics',
    domain: 'finance',
    keywords: ['risk', 'controls', 'compliance', 'fraud', 'kyc', 'aml', 'policy', 'governance', 'sql', 'excel', 'analytics'],
    jobs: ['Risk Analyst', 'Compliance Analyst (Junior)', 'Fraud Analyst', 'KYC/AML Analyst'],
  },
  {
    id: 'core-mechanical',
    title: 'Mechanical Engineer',
    subtitle: 'Design · CAD · manufacturing basics',
    domain: 'core',
    keywords: ['mechanical', 'cad', 'solidworks', 'autocad', 'catia', 'ansys', 'gd&t', 'manufacturing', 'thermodynamics', 'materials', 'machine design'],
    jobs: ['Mechanical Engineer (Junior)', 'Design Engineer (Junior)', 'CAD Engineer', 'Production Engineer (Junior)'],
  },
  {
    id: 'core-civil',
    title: 'Civil Engineer',
    subtitle: 'Structures · planning · site execution',
    domain: 'core',
    keywords: ['civil', 'autocad', 'staad pro', 'etabs', 'surveying', 'estimation', 'b.o.q', 'construction', 'structural', 'concrete', 'steel'],
    jobs: ['Civil Engineer (Junior)', 'Site Engineer', 'Structural Engineer (Junior)', 'Planning Engineer (Junior)'],
  },
  {
    id: 'core-electrical',
    title: 'Electrical Engineer',
    subtitle: 'Power · circuits · instrumentation',
    domain: 'core',
    keywords: ['electrical', 'circuits', 'power systems', 'transformer', 'plc', 'scada', 'control systems', 'instrumentation', 'matlab', 'simulink'],
    jobs: ['Electrical Engineer (Junior)', 'Instrumentation Engineer (Junior)', 'PLC Engineer (Junior)', 'Maintenance Engineer (Electrical)'],
  },
  {
    id: 'core-chemical',
    title: 'Chemical / Process Engineer',
    subtitle: 'Process · operations · safety basics',
    domain: 'core',
    keywords: ['chemical', 'process', 'unit operations', 'process design', 'pfd', 'pid', 'hse', 'safety', 'quality', 'six sigma', 'lean'],
    jobs: ['Process Engineer (Junior)', 'Production Engineer (Chemical)', 'Quality Engineer (Junior)', 'HSE Engineer (Junior)'],
  },
]

export function normalizeSkill(s) {
  return String(s || '').trim().toLowerCase()
}

export function uniqueNormalized(skills) {
  const out = []
  const seen = new Set()
  for (const skill of Array.isArray(skills) ? skills : []) {
    const normalized = normalizeSkill(skill)
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    out.push(normalized)
  }
  return out
}

export function scoreTrack(track, normalizedSkills) {
  const skillText = ` ${normalizedSkills.join(' | ')} `
  const matched = track.keywords.filter(k => {
    const nk = normalizeSkill(k)
    return skillText.includes(` ${nk} `) || skillText.includes(nk)
  })
  const score = track.keywords.length ? Math.round((matched.length / track.keywords.length) * 100) : 0
  return { matched, score }
}
