import { useMemo } from 'react'
import { motion } from 'framer-motion'

export const CAREER_DETAILS = {
  frontend: {
    title: 'Frontend Developer',
    subtitle: 'Build fast, accessible, beautiful user interfaces.',
    overview:
      'Frontend developers turn product ideas into interactive web experiences. You focus on UI behavior, state, performance, and accessibility — making sure the app feels great for users.',
    dayToDay: [
      'Build pages and components (React/Vue/Angular) and wire them to APIs',
      'Implement responsive layouts, forms, and UI states (loading/errors/empty)',
      'Improve performance (bundle size, rendering, caching) and accessibility (ARIA)',
      'Collaborate with design and backend teams to ship features',
    ],
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Accessibility', 'Performance basics'],
    tools: ['Vite / Next.js', 'Tailwind / CSS', 'React DevTools', 'Testing Library / Cypress'],
  },
  backend: {
    title: 'Backend Developer',
    subtitle: 'Build reliable APIs, services, and data systems.',
    overview:
      'Backend developers design and implement the logic behind applications: APIs, databases, authentication, integrations, and scalable services that power the UI.',
    dayToDay: [
      'Design REST endpoints and data models; validate and secure inputs',
      'Work with SQL databases, indexing, and query performance',
      'Implement auth, permissions, and security best practices',
      'Monitor and debug production issues using logs/metrics',
    ],
    skills: ['HTTP/REST', 'SQL', 'API design', 'Auth basics', 'Caching basics', 'Testing'],
    tools: ['FastAPI / Django / Express', 'Postgres / MySQL', 'Docker', 'Observability tooling'],
  },
  'data-analyst': {
    title: 'Data Analyst',
    subtitle: 'Turn data into insights and dashboards for decisions.',
    overview:
      'Data analysts answer business questions using data. You clean data, write SQL, build dashboards, and explain what the numbers mean to stakeholders.',
    dayToDay: [
      'Write SQL queries to build datasets and answer questions',
      'Build dashboards and reports (Tableau/Power BI) with clear storytelling',
      'Define metrics (funnels, retention, cohorts) and track performance',
      'Communicate findings and recommendations to teams',
    ],
    skills: ['SQL', 'Excel/Sheets', 'Visualization', 'Statistics basics', 'Business metrics'],
    tools: ['Tableau / Power BI', 'SQL editor', 'Python (pandas) optional'],
  },
  'data-science': {
    title: 'Data Scientist',
    subtitle: 'Build models and experiments that improve outcomes.',
    overview:
      'Data scientists build predictive models, run experiments, and develop ML workflows. The focus is on framing problems, evaluating models, and improving results responsibly.',
    dayToDay: [
      'Explore datasets, engineer features, and train/evaluate models',
      'Run A/B tests and analyze results with statistical rigor',
      'Collaborate with engineering to deploy and monitor models',
      'Perform error analysis and iterate on model performance',
    ],
    skills: ['Python', 'Statistics', 'Machine learning', 'Model evaluation', 'Data wrangling'],
    tools: ['pandas / numpy', 'scikit-learn', 'PyTorch/TensorFlow (optional)', 'Notebooks'],
  },
  cyber: {
    title: 'Cybersecurity (Blue Team)',
    subtitle: 'Defend systems through monitoring and response.',
    overview:
      'Blue team roles focus on detection, monitoring, incident response, and hardening systems. You learn how attacks work, then build defenses and processes to reduce risk.',
    dayToDay: [
      'Monitor alerts and investigate suspicious activity',
      'Hunt through logs to detect patterns and anomalies',
      'Respond to incidents (triage → contain → remediate → postmortem)',
      'Improve security posture with hardening and patching',
    ],
    skills: ['Networking basics', 'Linux basics', 'Security fundamentals', 'Logging/monitoring', 'Incident response'],
    tools: ['SIEM (Splunk/Elastic)', 'EDR tools', 'Wireshark', 'Linux CLI'],
  },
  'finance-analyst': {
    title: 'Finance Analyst (FP&A)',
    subtitle: 'Budgeting, forecasting, and business finance decisions.',
    overview:
      'Finance analysts support decision-making by building budgets and forecasts, analyzing variance, and translating financial performance into clear recommendations for stakeholders.',
    dayToDay: [
      'Build and update budgets/forecasts; track variance vs actuals',
      'Prepare management reports and KPIs (weekly/monthly) for leaders',
      'Work with business teams to understand drivers (revenue, cost, margin)',
      'Create presentations that summarize insights and next actions',
    ],
    skills: ['Excel', 'Financial statements basics', 'Forecasting', 'Business metrics', 'Communication'],
    tools: ['Excel / Sheets', 'PowerPoint', 'Power BI / Tableau (optional)', 'SQL (optional)'],
  },
  'investment-analyst': {
    title: 'Investment Analyst',
    subtitle: 'Valuation and research for markets and investments.',
    overview:
      'Investment analysts research companies, industries, and macro trends to support investment decisions. The role is a mix of analysis, modeling, and clear writing/presenting.',
    dayToDay: [
      'Read financial statements and build simple valuation models (DCF, comps)',
      'Track news, earnings, and sector trends; summarize key takeaways',
      'Create investment notes and pitch decks with risk/return thinking',
      'Support portfolio decisions with scenario analysis',
    ],
    skills: ['Accounting basics', 'Valuation basics', 'Research', 'Excel modeling', 'Presentation'],
    tools: ['Excel', 'PowerPoint', 'Company filings (10-K/annual reports)', 'Data terminals (optional)'],
  },
  accounting: {
    title: 'Accounting / Audit',
    subtitle: 'Maintain accurate books and ensure compliant reporting.',
    overview:
      'Accounting and audit roles focus on accurate financial records, reconciliations, and compliance. You make sure transactions are recorded correctly and reporting is reliable.',
    dayToDay: [
      'Record transactions, reconcile accounts, and support month-end close',
      'Prepare basic financial reports and documentation for audits',
      'Work with invoices, payments, and expense tracking',
      'Follow compliance requirements and maintain clean records',
    ],
    skills: ['Accounting fundamentals', 'Attention to detail', 'Reconciliation', 'Tax basics (optional)', 'Documentation'],
    tools: ['Tally / QuickBooks', 'Excel', 'ERP tools (optional)'],
  },
  'risk-analyst': {
    title: 'Risk Analyst',
    subtitle: 'Risk controls, compliance, and analytical investigation.',
    overview:
      'Risk analysts help organizations reduce operational and financial risk by improving controls, monitoring signals, and investigating anomalies (fraud, compliance issues, process risk).',
    dayToDay: [
      'Monitor risk indicators and investigate anomalies or exceptions',
      'Write and improve policies/controls with stakeholders',
      'Build simple analysis in Excel/SQL to quantify risk and trends',
      'Prepare compliance documentation and reporting',
    ],
    skills: ['Analytical thinking', 'Excel', 'Controls mindset', 'Communication', 'Basic SQL (optional)'],
    tools: ['Excel', 'SQL (optional)', 'Ticketing / case tools (varies)', 'Dashboards (optional)'],
  },
  'core-mechanical': {
    title: 'Mechanical Engineer',
    subtitle: 'Design parts/systems and support manufacturing execution.',
    overview:
      'Mechanical engineers work on design, analysis, and manufacturing support for products and systems. The focus varies: CAD design, production, quality, or testing.',
    dayToDay: [
      'Create and revise CAD models/drawings; maintain BOMs',
      'Work with manufacturing to improve assembly and reduce defects',
      'Run basic calculations/analysis for strength, fit, and performance',
      'Document designs and support testing/validation',
    ],
    skills: ['CAD basics', 'GD&T basics', 'Materials basics', 'Manufacturing basics', 'Problem solving'],
    tools: ['SolidWorks / CATIA', 'AutoCAD', 'ANSYS (optional)', 'Excel'],
  },
  'core-civil': {
    title: 'Civil Engineer',
    subtitle: 'Plan, design, and execute civil and structural projects.',
    overview:
      'Civil engineers support infrastructure and building projects across design and site execution. You coordinate drawings, quantities, schedules, and ensure work matches specifications.',
    dayToDay: [
      'Prepare/interpret drawings; coordinate with architects and contractors',
      'Site supervision: quality checks, measurements, and progress tracking',
      'Estimate quantities (BOQ) and support scheduling/planning',
      'Ensure compliance with safety and basic standards',
    ],
    skills: ['AutoCAD basics', 'Quantities/estimation', 'Structural basics', 'Site coordination', 'Documentation'],
    tools: ['AutoCAD', 'STAAD Pro / ETABS (optional)', 'Excel', 'Project tracking tools (optional)'],
  },
  'core-electrical': {
    title: 'Electrical Engineer',
    subtitle: 'Circuits, power, controls, and instrumentation work.',
    overview:
      'Electrical engineers work across power distribution, controls, and instrumentation. Entry roles often focus on maintenance, testing, panel design, or PLC-based automation.',
    dayToDay: [
      'Read wiring diagrams and troubleshoot electrical issues',
      'Support installation/maintenance of equipment and power systems',
      'Assist with controls/instrumentation checks and calibration',
      'Document changes and follow safety procedures',
    ],
    skills: ['Circuit basics', 'Power systems basics', 'Instrumentation basics', 'Safety practices', 'Troubleshooting'],
    tools: ['Multimeter', 'MATLAB (optional)', 'PLC/SCADA (optional)', 'AutoCAD Electrical (optional)'],
  },
  'core-chemical': {
    title: 'Chemical / Process Engineer',
    subtitle: 'Operations, process improvement, and safety-focused execution.',
    overview:
      'Process engineers improve plant operations by optimizing unit operations, improving quality, reducing waste, and keeping safety at the center of every change.',
    dayToDay: [
      'Monitor process parameters and support day-to-day operations',
      'Identify bottlenecks and run small process improvement experiments',
      'Document SOPs and support safety/quality compliance',
      'Collaborate with maintenance and production teams',
    ],
    skills: ['Unit operations basics', 'Mass/energy balance basics', 'Quality mindset', 'Safety mindset', 'Root-cause analysis'],
    tools: ['Excel', 'PFD/P&ID reading', 'Lean/Six Sigma (optional)', 'Reporting tools (varies)'],
  },
}

function getTrackFromUrl() {
  const params = new URLSearchParams(window.location.search)
  return params.get('track') || ''
}

export default function CareerDetailsPage({ trackId }) {
  const resolvedTrack = trackId || getTrackFromUrl()

  const info = useMemo(() => {
    return CAREER_DETAILS[resolvedTrack] || null
  }, [resolvedTrack])

  return (
    <div className="flex-1 px-6 py-10 md:px-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto"
      >
        {!info ? (
          <div className="glass rounded-2xl p-6">
            <h1 className="text-2xl font-extrabold text-white mb-2">Career Details</h1>
            <p className="text-sm text-slate-100/70">No career selected. Open this page from the Dashboard → Career Options.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">{info.title}</h1>
              <p className="text-slate-100/80 text-sm">{info.subtitle}</p>
            </div>

            <div className="glass rounded-2xl p-6 mb-4">
              <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--a2)' }}>
                Overview
              </div>
              <p className="text-sm text-slate-100/80 leading-relaxed">{info.overview}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-6">
                <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--a3)' }}>
                  Day To Day
                </div>
                <div className="space-y-2">
                  {info.dayToDay.map((x, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl px-4 py-3"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div
                        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(6,182,212,0.25))', color: '#fff' }}
                      >
                        {i + 1}
                      </div>
                      <div className="text-sm" style={{ color: 'rgba(248,250,252,0.90)' }}>
                        {x}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="glass rounded-2xl p-6">
                  <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--a2)' }}>
                    Core Skills
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {info.skills.map(s => (
                      <span
                        key={s}
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(6,182,212,0.10)', border: '1px solid rgba(6,182,212,0.22)', color: '#67e8f9' }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-2xl p-6">
                  <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--a3)' }}>
                    Common Tools
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {info.tools.map(s => (
                      <span
                        key={s}
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.22)', color: '#a5b4fc' }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
