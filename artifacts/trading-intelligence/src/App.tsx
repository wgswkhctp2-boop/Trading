import { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  useGetTradingDashboard, getGetTradingDashboardQueryKey,
  useGetTradingAgents, getGetTradingAgentsQueryKey,
  useGetTradingSignals, getGetTradingSignalsQueryKey,
  useGetMarketSnapshot, getGetMarketSnapshotQueryKey,
  useGetTradingStrategies, getGetTradingStrategiesQueryKey,
  useRunTradingBacktest,
  useGetAgentCollaboration, getGetAgentCollaborationQueryKey,
  useGetTradingHistory, getGetTradingHistoryQueryKey,
  useGetRiskSettings, getGetRiskSettingsQueryKey,
  useUpdateRiskSettings,
  useGetTradingSystemStatus, getGetTradingSystemStatusQueryKey,
} from '@workspace/api-client-react';
import type { BacktestResult, RiskSettingsInput } from '@workspace/api-client-react';
import {
  Activity, ArrowRight, BarChart3, Bell, Bot, BrainCircuit, CircleHelp, Clock3, Database, Layers3,
  LineChart, Menu, MessageSquareText, MoreHorizontal, RefreshCw, Settings2, Shield,
  SlidersHorizontal, Sparkles,
} from 'lucide-react';
import { Link, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import type { ReactNode } from 'react';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });
const routes = [
  { path: '/', label: 'Overview', icon: Layers3 },
  { path: '/agents', label: 'Agent desk', icon: Bot },
  { path: '/market', label: 'Market lab', icon: LineChart },
  { path: '/strategies', label: 'Strategies', icon: BrainCircuit },
  { path: '/collaboration', label: 'Debate room', icon: MessageSquareText },
  { path: '/risk', label: 'Risk controls', icon: Shield },
  { path: '/trades', label: 'Trade journal', icon: BarChart3 },
  { path: '/settings', label: 'Configuration', icon: Settings2 },
];

const money = (n?: number, currency = 'USD') => n == null ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n);
const pct = (n?: number) => n == null ? '—' : `${n > 0 ? '+' : ''}${n.toFixed(2)}%`;
const dateTime = (d?: string) => d ? new Date(d).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const dateOnly = (d?: string) => d ? new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—';
const titleCase = (s: string) => s.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (x) => x.toUpperCase());

function Frame({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileNav, setMobileNav] = useState(false);
  const active = routes.find((r) => r.path === location);
  return <div className="min-h-[100dvh] bg-background text-foreground">
    {mobileNav && <button aria-label="Close navigation" onClick={() => setMobileNav(false)} className="fixed inset-0 z-40 bg-black/60 md:hidden" data-testid="button-close-nav" />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-[236px] flex-col border-r border-sidebar-border bg-sidebar transition-transform md:translate-x-0 ${mobileNav ? 'translate-x-0' : '-translate-x-full'}`}>
      <Link href="/" onClick={() => setMobileNav(false)} className="flex h-[76px] items-center gap-3 border-b border-sidebar-border px-5" data-testid="link-brand">
        <div className="grid h-9 w-9 place-items-center rounded-md border border-emerald-300/25 bg-emerald-300/10 text-emerald-300"><Activity size={19} /></div>
        <div><div className="display text-[17px] font-bold tracking-tight text-slate-100">Meridian</div><div className="mono mt-0.5 text-[9px] uppercase tracking-[.18em] text-slate-500">Research terminal</div></div>
      </Link>
      <div className="px-4 pt-6">
        <div className="mono mb-2 px-2 text-[9px] uppercase tracking-[.18em] text-slate-600">Workspace</div>
        <nav className="space-y-1" aria-label="Primary navigation">
          {routes.map(({ path, label, icon: Icon }) => <Link key={path} href={path} onClick={() => setMobileNav(false)} data-testid={`nav-${path === '/' ? 'overview' : path.slice(1)}`} className={`group flex h-10 items-center gap-3 rounded-md px-3 text-[12px] transition-colors ${location === path ? 'bg-[#202a2c] text-emerald-300' : 'text-slate-400 hover:bg-white/[.035] hover:text-slate-200'}`}>
            <Icon size={15} strokeWidth={1.8} /><span>{label}</span>{location === path && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-300" />}
          </Link>)}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <div className="rounded-md border border-[#29342f] bg-[#171e1c] p-3">
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-wide text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> SIMULATION MODE</div>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-500">Research only. No live orders or execution connections.</p>
          <Link href="/settings" className="mt-3 flex items-center justify-between border-t border-white/[.06] pt-2.5 text-[10px] text-slate-400 hover:text-slate-200" data-testid="link-demo-configuration">Demo configuration <ArrowRight size={12} /></Link>
        </div>
        <div className="mt-4 flex items-center gap-2 px-1 text-[10px] text-slate-600"><CircleHelp size={13} /> All values are simulated</div>
      </div>
    </aside>
    <div className="min-h-[100dvh] md:pl-[236px]">
      <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-border bg-[#101319]/95 px-4 backdrop-blur md:px-8">
        <div className="flex items-center gap-3"><button onClick={() => setMobileNav(true)} className="md:hidden text-slate-400" aria-label="Open navigation" data-testid="button-open-nav"><Menu size={19} /></button><span className="text-[11px] text-slate-500">Research desk</span><span className="text-slate-700">/</span><span className="text-[11px] text-slate-200">{active?.label ?? 'Overview'}</span></div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded border border-[#304138] bg-[#17211d] px-2.5 py-1.5 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /><span className="mono text-[9px] tracking-[.1em] text-emerald-200">DEMO · SIMULATED</span></div>
          <Link href="/collaboration" className="grid h-8 w-8 place-items-center rounded border border-border text-slate-500 hover:text-slate-200" aria-label="Open research activity" data-testid="link-research-activity"><Bell size={15} /></Link>
          <div className="grid h-7 w-7 place-items-center rounded-full border border-[#39423f] bg-[#222a29] text-[9px] font-semibold text-emerald-200">QR</div>
        </div>
      </header>
      <main className="mx-auto min-w-0 max-w-[1480px] px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  </div>;
}

function PageHead({ eyebrow, title, detail, right }: { eyebrow: string; title: string; detail?: string; right?: ReactNode }) {
  return <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div><div className="mono mb-2 text-[9px] uppercase tracking-[.2em] text-emerald-300/80">{eyebrow}</div><h1 className="display text-[28px] font-bold leading-tight text-slate-100 md:text-[34px]">{title}</h1>{detail && <p className="mt-1.5 text-[12px] text-slate-500">{detail}</p>}</div>
    {right}
  </div>;
}
function Tag({ children, tone = 'muted' }: { children: ReactNode; tone?: 'muted' | 'green' | 'amber' | 'red' | 'blue' }) {
  const tones = { muted: 'border-slate-700/80 bg-slate-700/20 text-slate-400', green: 'border-emerald-800/60 bg-emerald-900/20 text-emerald-300', amber: 'border-amber-800/60 bg-amber-900/20 text-amber-300', red: 'border-rose-900/60 bg-rose-950/20 text-rose-300', blue: 'border-sky-900/60 bg-sky-950/20 text-sky-300' };
  return <span className={`inline-flex items-center rounded border px-1.5 py-0.5 mono text-[9px] uppercase tracking-[.08em] ${tones[tone]}`}>{children}</span>;
}
function Panel({ title, meta, children, className = '' }: { title?: string; meta?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}>{(title || meta) && <div className="flex min-h-[44px] items-center justify-between border-b border-border px-4"><h2 className="text-[11px] font-semibold text-slate-300">{title}</h2>{meta}</div>}<div className="p-4">{children}</div></section>;
}
function State({ loading, error, empty, children }: { loading?: boolean; error?: boolean; empty?: boolean; children?: ReactNode }) {
  if (loading) return <div className="space-y-3 p-1" aria-label="Loading"><div className="h-3 w-1/3 animate-pulse rounded bg-slate-800" /><div className="h-24 animate-pulse rounded bg-slate-800/70" /><div className="h-3 w-2/3 animate-pulse rounded bg-slate-800/70" /></div>;
  if (error) return <div className="rounded border border-rose-900/50 bg-rose-950/20 p-5 text-center" data-testid="state-error"><div className="text-[12px] text-rose-200">Unable to load this research data</div><p className="mt-1 text-[10px] text-slate-500">Check the demo API connection, then retry.</p><button onClick={() => window.location.reload()} className="mt-3 inline-flex items-center gap-2 text-[10px] text-rose-300 hover:text-rose-100" data-testid="button-retry"><RefreshCw size={12} /> Retry</button></div>;
  if (empty) return <div className="rounded border border-dashed border-border px-4 py-9 text-center"><Database size={17} className="mx-auto text-slate-600" /><div className="mt-2 text-[11px] text-slate-400">No records returned</div><p className="mt-1 text-[10px] text-slate-600">This view displays API data only.</p></div>;
  return <>{children}</>;
}
function SimStamp({ label = 'SIMULATED' }: { label?: string }) { return <Tag tone="green">{label}</Tag>; }

function LineGraph({ points, compact = false, color = '#68c9a2' }: { points: { timestamp: string; value: number }[]; compact?: boolean; color?: string }) {
  const dims = compact ? { w: 520, h: 92, pad: 7 } : { w: 900, h: 250, pad: 18 };
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals), max = Math.max(...vals), span = max - min || 1;
  const coords = points.map((p, i) => `${dims.pad + (i / Math.max(1, points.length - 1)) * (dims.w - dims.pad * 2)},${dims.h - dims.pad - ((p.value - min) / span) * (dims.h - dims.pad * 2)}`).join(' ');
  const first = coords.split(' ')[0] ?? '', last = coords.split(' ').at(-1) ?? '';
  return <div className="w-full overflow-hidden"><svg viewBox={`0 0 ${dims.w} ${dims.h}`} preserveAspectRatio="none" className={compact ? 'h-[92px] w-full' : 'h-[230px] w-full'}>
    {[.25,.5,.75].map((v) => <line key={v} x1="0" x2={dims.w} y1={dims.h*v} y2={dims.h*v} stroke="#303741" strokeDasharray="3 5" />)}
    <polygon points={`${first} ${coords} ${last.split(',')[0]},${dims.h}`} fill={color} opacity=".08" />
    <polyline points={coords} fill="none" stroke={color} strokeWidth={compact ? 2 : 2.2} vectorEffect="non-scaling-stroke" />
    {!compact && points.map((p, i) => <circle key={`${p.timestamp}-${i}`} cx={dims.pad + (i / Math.max(1, points.length - 1)) * (dims.w-dims.pad*2)} cy={dims.h-dims.pad-((p.value-min)/span)*(dims.h-dims.pad*2)} r="2" fill={color} />)}
  </svg>
    {!compact && <div className="flex justify-between px-1 pt-2 mono text-[9px] text-slate-600"><span>{dateOnly(points[0]?.timestamp)}</span><span>{dateOnly(points[Math.floor(points.length/2)]?.timestamp)}</span><span>{dateOnly(points.at(-1)?.timestamp)}</span></div>}
  </div>;
}
function Metric({ label, value, delta, note }: { label: string; value: string; delta?: string; note?: string }) {
  return <div className="panel px-4 py-3.5"><div className="flex items-center justify-between text-[10px] text-slate-500"><span>{label}</span><MoreHorizontal size={14} /></div><div className="mt-2 flex items-end justify-between gap-2"><span className="mono text-[20px] tracking-tight text-slate-100">{value}</span>{delta && <span className={`mono mb-0.5 text-[10px] ${delta.startsWith('-') ? 'text-rose-300' : 'text-emerald-300'}`}>{delta}</span>}</div>{note && <div className="mt-1 text-[9px] text-slate-600">{note}</div>}</div>;
}
function DataTable({ headers, children, testId }: { headers: string[]; children: ReactNode; testId: string }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left" data-testid={testId}><thead><tr className="border-b border-border">{headers.map((h) => <th key={h} className="px-3 pb-2.5 text-[9px] font-medium uppercase tracking-[.12em] text-slate-600">{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}
function Overview() {
  const dash = useGetTradingDashboard({ query: { queryKey: getGetTradingDashboardQueryKey() } });
  const system = useGetTradingSystemStatus({ query: { queryKey: getGetTradingSystemStatusQueryKey() } });
  const d = dash.data;
  return <State loading={dash.isLoading} error={dash.isError}><div className="fade-in">
    <PageHead eyebrow="Portfolio monitor / 01" title="Overview" detail="A measured view of the simulated account and research activity." right={<div className="flex items-center gap-2"><Tag tone="amber">PAPER ENVIRONMENT</Tag><span className="mono text-[9px] text-slate-600">UPDATED {dateTime(d?.updatedAt)}</span></div>} />
    <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
      <Metric label="Account equity" value={money(d?.account.equity, d?.account.currency)} note={`Balance ${money(d?.account.balance, d?.account.currency)}`} />
      <Metric label="Day P&L" value={money(d?.account.dayPnl, d?.account.currency)} delta={pct(d?.account.dayPnlPercent)} />
      <Metric label="Open positions" value={d ? String(d.account.openPositions).padStart(2, '0') : '—'} note="Simulated exposure" />
      <Metric label="Risk utilization" value={d ? `${d.account.riskUsedPercent.toFixed(1)}%` : '—'} note="Of demo guardrail" />
    </div>
    <div className="grid gap-4 xl:grid-cols-[1.65fr_1fr]">
      <Panel title="Equity history" meta={<span className="flex items-center gap-2"><SimStamp label={d?.dataLabel ?? 'SIMULATED'} /><span className="mono text-[9px] text-slate-600">ACCOUNT VALUE</span></span>}>
        <State loading={dash.isLoading} error={dash.isError} empty={!d?.equityCurve?.length}><div className="mb-2 flex items-baseline gap-3"><span className="display text-[26px] font-semibold text-slate-100">{money(d?.account.equity, d?.account.currency)}</span><span className={`mono text-[10px] ${(d?.account.dayPnl ?? 0) < 0 ? 'text-rose-300' : 'text-emerald-300'}`}>{pct(d?.account.dayPnlPercent)} day</span></div><LineGraph points={d?.equityCurve ?? []} /></State>
      </Panel>
      <Panel title="System pulse" meta={<Tag tone={system.data?.tradingEnabled ? 'red' : 'green'}>{system.data?.tradingEnabled ? 'EXECUTION ENABLED' : 'EXECUTION OFF'}</Tag>}>
        <State loading={system.isLoading} error={system.isError}>{system.data ? <><div className="mb-4 flex items-center gap-3 rounded border border-[#304138] bg-[#17211d] p-3"><div className="grid h-8 w-8 place-items-center rounded bg-emerald-300/10 text-emerald-300"><Activity size={16} /></div><div><div className="text-[11px] text-slate-200">{system.data.mode} environment</div><div className="mt-1 mono text-[9px] text-slate-500">{system.data.dataLabel} · connected research services</div></div></div>
          <div className="space-y-3">{system.data.integrations.map((it) => <div key={it.name} className="flex items-center justify-between gap-2"><div><div className="text-[10px] text-slate-300">{it.name}</div><div className="mt-0.5 text-[9px] text-slate-600">{it.note}</div></div><Tag tone={it.status === 'READY' ? 'green' : it.status === 'PLANNED' ? 'amber' : 'muted'}>{titleCase(it.status)}</Tag></div>)}</div>
          <div className="mt-4 border-t border-border pt-3 text-[9px] leading-relaxed text-slate-600">System data and all analytics in this workspace are simulated. No live execution is available.</div></> : null}</State>
      </Panel>
      <Panel title="Simulated positions" meta={<Link href="/trades" className="text-[10px] text-emerald-300 hover:text-emerald-200" data-testid="link-all-trades">Trade journal <ArrowRight size={12} className="ml-1 inline" /></Link>} className="xl:col-span-2">
        <State loading={dash.isLoading} error={dash.isError} empty={!d?.positions?.length}><DataTable testId="table-positions" headers={['Instrument','Side','Quantity','Entry','Mark','Unrealized P&L','Opened']}>{d?.positions.map((p) => <tr key={p.id} className="border-b border-border/70 last:border-0" data-testid={`row-position-${p.id}`}><td className="px-3 py-3"><div className="mono text-[11px] text-slate-200">{p.symbol}</div></td><td className="px-3 py-3"><Tag tone={p.side === 'LONG' ? 'green' : 'red'}>{p.side}</Tag></td><td className="mono px-3 py-3 text-[10px] text-slate-400">{p.quantity}</td><td className="mono px-3 py-3 text-[10px] text-slate-400">{money(p.entryPrice)}</td><td className="mono px-3 py-3 text-[10px] text-slate-300">{money(p.markPrice)}</td><td className={`mono px-3 py-3 text-[10px] ${p.pnl < 0 ? 'text-rose-300' : 'text-emerald-300'}`}>{money(p.pnl)}</td><td className="px-3 py-3 text-[10px] text-slate-500">{dateTime(p.openedAt)}</td></tr>)}</DataTable></State>
      </Panel>
    </div>
    <SignalsStrip />
  </div></State>;
}
function SignalsStrip() {
  const q = useGetTradingSignals({ query: { queryKey: getGetTradingSignalsQueryKey() } });
  return <div className="mt-4"><Panel title="Latest research signals" meta={<Link href="/market" className="text-[10px] text-emerald-300" data-testid="link-market-lab">Open market lab <ArrowRight size={12} className="ml-1 inline" /></Link>}><State loading={q.isLoading} error={q.isError} empty={!q.data?.length}><div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">{q.data?.slice(0,3).map((s) => <div key={s.id} className="rounded border border-border bg-[#12161c] p-3" data-testid={`signal-card-${s.id}`}><div className="flex items-center justify-between"><span className="mono text-[11px] text-slate-200">{s.symbol}</span><Tag tone={s.direction === 'LONG_BIAS' ? 'green' : s.direction === 'SHORT_BIAS' ? 'red' : 'muted'}>{titleCase(s.direction)}</Tag></div><p className="mt-2 line-clamp-2 text-[10px] leading-relaxed text-slate-400">{s.rationale}</p><div className="mt-3 flex justify-between mono text-[9px] text-slate-600"><span>{s.timeframe} · {s.confidence}% confidence</span><span>{dateTime(s.createdAt)}</span></div><div className="mt-2"><SimStamp label={s.dataLabel} /></div></div>)}</div></State></Panel></div>;
}
function Agents() {
  const q = useGetTradingAgents({ query: { queryKey: getGetTradingAgentsQueryKey() } });
  return <State loading={q.isLoading} error={q.isError}><PageHead eyebrow="Research collective / 02" title="Agent desk" detail="Eight focused research perspectives. Every read is an analysis, never an instruction." right={<Tag tone="green">SIMULATED ANALYSIS</Tag>} />
    <div className="mb-4 flex flex-wrap gap-2"><div className="panel flex items-center gap-2 px-3 py-2 text-[10px] text-slate-400"><Bot size={14} className="text-emerald-300" /> {q.data?.length ?? '—'} research agents</div><div className="panel flex items-center gap-2 px-3 py-2 text-[10px] text-slate-400"><Clock3 size={14} className="text-amber-300" /> Latest runs shown from API</div></div>
    <State loading={q.isLoading} error={q.isError} empty={!q.data?.length}><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{q.data?.map((a, i) => <article key={a.id} className="panel fade-in p-4" style={{ animationDelay: `${i * 40}ms` }} data-testid={`agent-card-${a.id}`}><div className="flex items-start justify-between"><div className="flex gap-3"><div className="grid h-9 w-9 place-items-center rounded border border-[#304138] bg-[#17211d] text-emerald-300"><Bot size={17} /></div><div><h2 className="text-[12px] font-semibold text-slate-200">{a.name}</h2><div className="mt-1 text-[10px] text-slate-500">{a.specialty}</div></div></div><Tag tone={a.status === 'ANALYZING' ? 'green' : a.status === 'PAUSED' ? 'amber' : 'muted'}>{titleCase(a.status)}</Tag></div><p className="mt-4 min-h-[46px] text-[11px] leading-relaxed text-slate-400">{a.summary}</p><div className="mt-4 flex items-center justify-between border-t border-border pt-3"><div className="flex items-center gap-2"><span className="mono text-[9px] text-slate-600">CONFIDENCE</span><span className="mono text-[10px] text-slate-300">{a.confidence}%</span><div className="h-1 w-14 overflow-hidden rounded bg-slate-800"><div className="h-full rounded bg-emerald-300/70" style={{ width: `${a.confidence}%` }} /></div></div><span className="mono text-[9px] text-slate-600">{dateTime(a.lastRun)}</span></div></article>)}</div></State>
  </State>;
}
function Market() {
  const [symbol, setSymbol] = useState('SPY');
  const [interval, setInterval] = useState<'1D'|'1W'|'1M'>('1D');
  const params = useMemo(() => ({ symbol, interval }), [symbol, interval]);
  const q = useGetMarketSnapshot(params, { query: { queryKey: getGetMarketSnapshotQueryKey(params) } });
  const signals = useGetTradingSignals({ query: { queryKey: getGetTradingSignalsQueryKey() } });
  const snap = q.data;
  return <State loading={q.isLoading} error={q.isError}><PageHead eyebrow="Instrument observatory / 03" title="Market lab" detail="Simulated price series with model-derived indicators and traceable research signals." right={<Tag tone="amber">NO LIVE QUOTES</Tag>} />
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 panel p-3"><div className="flex flex-wrap items-center gap-2"><label htmlFor="market-symbol" className="mono text-[9px] uppercase tracking-wider text-slate-600">Instrument</label><select id="market-symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} className="h-8 rounded border border-border bg-[#101319] px-2 text-[11px] text-slate-200" data-testid="select-market-symbol">{['SPY','QQQ','AAPL','NVDA','BTC-USD','ETH-USD'].map((s) => <option key={s}>{s}</option>)}</select><span className="text-slate-700">/</span><span className="text-[11px] text-slate-300">{snap?.name ?? 'Instrument snapshot'}</span></div><div className="flex gap-1">{(['1D','1W','1M'] as const).map((x) => <button key={x} onClick={() => setInterval(x)} className={`rounded px-3 py-1.5 mono text-[9px] ${interval === x ? 'bg-[#29443a] text-emerald-200' : 'text-slate-500 hover:bg-white/5'}`} data-testid={`button-interval-${x}`}>{x}</button>)}</div></div>
    <div className="grid gap-4 xl:grid-cols-[1.65fr_1fr]"><Panel title="Price action" meta={<SimStamp label={snap?.dataLabel ?? 'SIMULATED'} />} className="xl:row-span-2"><State loading={q.isLoading} error={q.isError} empty={!snap?.candles?.length}>{snap && <><div className="flex items-end justify-between"><div><div className="mono text-[22px] text-slate-100">{snap.symbol}</div><div className="mt-1 text-[10px] text-slate-500">{snap.name} · {snap.interval} interval</div></div><div className="text-right"><div className="mono text-[19px] text-slate-200">{money(snap.candles.at(-1)?.close)}</div><div className="mono mt-1 text-[9px] text-slate-600">{dateTime(snap.candles.at(-1)?.timestamp)}</div></div></div><CandleChart candles={snap.candles} /><div className="mt-3 flex items-center gap-4 mono text-[9px] text-slate-600"><span className="flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Simulated close</span><span>Source: demo market endpoint</span></div></>}</State></Panel>
      <Panel title="Indicator readings" meta={<SlidersHorizontal size={14} className="text-slate-600" />}><State loading={q.isLoading} error={q.isError} empty={!snap?.indicators?.length}><div className="space-y-1">{snap?.indicators.map((ind) => <div key={ind.name} className="flex items-center justify-between border-b border-border/70 py-3 last:border-0" data-testid={`indicator-${ind.name}`}><span className="text-[10px] text-slate-400">{ind.name}</span><span className="mono text-[11px] text-slate-200">{ind.value} <span className="text-slate-600">{ind.unit}</span></span></div>)}</div></State></Panel>
      <Panel title="Research signals" meta={<Sparkles size={14} className="text-amber-300" />}><State loading={signals.isLoading} error={signals.isError} empty={!signals.data?.filter((s) => s.symbol === symbol).length}><div className="space-y-3">{signals.data?.filter((s) => s.symbol === symbol).map((s) => <div key={s.id} className="border-l border-emerald-400/60 pl-3" data-testid={`market-signal-${s.id}`}><div className="flex items-center justify-between"><Tag tone={s.direction === 'LONG_BIAS' ? 'green' : s.direction === 'SHORT_BIAS' ? 'red' : 'muted'}>{titleCase(s.direction)}</Tag><span className="mono text-[9px] text-slate-600">{s.confidence}%</span></div><p className="mt-2 text-[10px] leading-relaxed text-slate-400">{s.rationale}</p><div className="mt-2 flex justify-between text-[9px] text-slate-600"><span>{s.timeframe}</span><span>{dateTime(s.createdAt)}</span></div></div>)}</div></State></Panel>
    </div>
  </State>;
}
function CandleChart({ candles }: { candles: {timestamp:string;open:number;high:number;low:number;close:number}[] }) {
  const width = 760, height = 260, pad = 12;
  const min = Math.min(...candles.map(c => c.low)), max = Math.max(...candles.map(c => c.high)), range = max-min || 1;
  const y = (v:number) => height-pad-((v-min)/range)*(height-pad*2);
  const slot = (width-pad*2)/Math.max(candles.length, 1);
  return <div className="mt-5 overflow-hidden rounded border border-border/70 bg-[#11151a]"><svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full" preserveAspectRatio="none">{[.25,.5,.75].map(v=><line key={v} x1="0" x2={width} y1={height*v} y2={height*v} stroke="#29313b" strokeDasharray="3 5" />)}{candles.map((c,i)=>{const cx=pad+i*slot+slot/2, up=c.close>=c.open, col=up?'#66c49c':'#d27676', body=Math.max(2,Math.abs(y(c.open)-y(c.close)));return <g key={`${c.timestamp}-${i}`}><line x1={cx} x2={cx} y1={y(c.high)} y2={y(c.low)} stroke={col} strokeWidth="1" /><rect x={cx-slot*.24} y={Math.min(y(c.open),y(c.close))} width={Math.max(1,slot*.48)} height={body} fill={col} opacity=".85" /></g>})}</svg><div className="flex justify-between px-3 py-2 mono text-[8px] text-slate-600"><span>{dateTime(candles[0]?.timestamp)}</span><span>{dateTime(candles.at(-1)?.timestamp)}</span></div></div>;
}
function Strategies() {
  const q = useGetTradingStrategies({ query: { queryKey: getGetTradingStrategiesQueryKey() } });
  const backtest = useRunTradingBacktest();
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [selected, setSelected] = useState('');
  const [symbol, setSymbol] = useState('SPY');
  const [capital, setCapital] = useState('');
  const run = () => { const amount = Number(capital); if (!selected || !Number.isFinite(amount) || amount <= 0) return; backtest.mutate({ data: { strategyId: selected, symbol, interval: '1M', startingCapital: amount } }, { onSuccess: setResult }); };
  return <State loading={q.isLoading} error={q.isError}><PageHead eyebrow="Model evaluation / 04" title="Strategies" detail="Review research candidates and run isolated, simulated historical backtests." right={<Tag tone="green">PAPER RESEARCH ONLY</Tag>} />
    <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]"><Panel title="Strategy catalogue" meta={<span className="mono text-[9px] text-slate-600">{q.data?.length ?? '—'} MODELS</span>}><State loading={q.isLoading} error={q.isError} empty={!q.data?.length}><div className="space-y-2">{q.data?.map((s) => <button key={s.id} onClick={() => setSelected(s.id)} className={`w-full rounded border p-3 text-left transition-colors ${selected === s.id ? 'border-emerald-500/50 bg-[#19251f]' : 'border-border bg-[#12161c] hover:border-slate-600'}`} data-testid={`strategy-select-${s.id}`}><div className="flex flex-wrap items-center justify-between gap-2"><div><div className="text-[12px] font-semibold text-slate-200">{s.name}</div><p className="mt-1 text-[10px] leading-relaxed text-slate-500">{s.description}</p></div><Tag tone={s.status === 'PAPER' ? 'green' : s.status === 'PAUSED' ? 'amber' : 'muted'}>{titleCase(s.status)}</Tag></div><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-border/70 pt-3 mono text-[9px] text-slate-500"><span>Win rate <b className="ml-1 text-slate-300">{pct(s.winRate)}</b></span><span>Profit factor <b className="ml-1 text-slate-300">{s.profitFactor.toFixed(2)}</b></span><span>Max DD <b className="ml-1 text-rose-300">{pct(s.maxDrawdown)}</b></span><span>Trades <b className="ml-1 text-slate-300">{s.tradesCount}</b></span><span className="ml-auto text-slate-600">{s.symbols.join(' · ')}</span></div></button>)}</div></State></Panel>
      <div className="space-y-4"><Panel title="Run a simulated backtest" meta={<Tag tone="amber">NO EXECUTION</Tag>}><p className="mb-4 text-[10px] leading-relaxed text-slate-500">Configure a research run. Results are historical simulations and are not forecasts.</p><label htmlFor="backtest-symbol" className="mb-1.5 block mono text-[9px] uppercase tracking-wider text-slate-600">Instrument</label><select id="backtest-symbol" value={symbol} onChange={(e)=>setSymbol(e.target.value)} className="mb-3 h-9 w-full rounded border border-border bg-[#101319] px-3 text-[11px]" data-testid="select-backtest-symbol">{['SPY','QQQ','AAPL','NVDA','BTC-USD'].map(x=><option key={x}>{x}</option>)}</select><label htmlFor="backtest-capital" className="mb-1.5 block mono text-[9px] uppercase tracking-wider text-slate-600">Starting capital (demo)</label><input id="backtest-capital" type="number" min="1" step="1000" value={capital} onChange={(e)=>setCapital(e.target.value)} placeholder="Enter amount" className="mono w-full rounded border border-border bg-[#101319] px-3 py-2.5 text-[11px] text-slate-300 placeholder:text-slate-700" data-testid="input-backtest-capital" /><button disabled={!selected || !capital || Number(capital)<=0 || backtest.isPending} onClick={run} className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-emerald-300 px-3 py-2.5 text-[10px] font-semibold text-[#102019] disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-run-backtest">{backtest.isPending ? 'Running simulation…' : 'Run backtest'} <ArrowRight size={13}/></button>{backtest.isError && <p className="mt-2 text-[10px] text-rose-300" role="alert">Backtest request failed. Retry when the demo API is available.</p>}</Panel>
        {result && <Panel title="Backtest result" meta={<SimStamp label={result.dataLabel}/>}><div className="grid grid-cols-2 gap-2"><Metric label="Net return" value={pct(result.netReturnPercent)} /><Metric label="Win rate" value={pct(result.winRate)} /><Metric label="Max drawdown" value={pct(result.maxDrawdownPercent)} /><Metric label="Closed trades" value={String(result.tradesCount)} /></div><div className="mt-3"><LineGraph points={result.equityCurve} compact /></div><p className="mt-2 text-[9px] text-slate-600">{result.symbol} · result returned by simulated backtest endpoint</p></Panel>}
      </div>
    </div>
  </State>;
}
function Collaboration() {
  const q = useGetAgentCollaboration({ query: { queryKey: getGetAgentCollaborationQueryKey() } });
  return <State loading={q.isLoading} error={q.isError}><PageHead eyebrow="Cross-agent review / 05" title="Debate room" detail="A chronological record of simulated agent perspectives, including disagreement and caution." right={<Tag tone="blue">TRACEABLE DISCUSSION</Tag>} />
    <Panel title="Research conversation" meta={<span className="mono text-[9px] text-slate-600">{q.data?.length ?? '—'} ENTRIES</span>}><State loading={q.isLoading} error={q.isError} empty={!q.data?.length}><div className="relative mx-auto max-w-3xl before:absolute before:bottom-4 before:left-[15px] before:top-4 before:w-px before:bg-[#303741]">{q.data?.map((m,i)=><article key={m.id} className="relative pb-6 pl-10 last:pb-1" data-testid={`message-${m.id}`}><div className={`absolute left-[9px] top-1 h-3.5 w-3.5 rounded-full border-2 ${m.sentiment==='SUPPORT'?'border-emerald-300 bg-[#17251f]':m.sentiment==='CAUTION'?'border-amber-300 bg-[#2b2418]':'border-slate-500 bg-[#181d24]'}`} /><div className="rounded border border-border bg-[#12161c] p-3.5"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded border border-border bg-[#1a2027] text-slate-400"><Bot size={12}/></span><span className="text-[11px] font-semibold text-slate-200">{m.agentName}</span><Tag tone={m.sentiment==='SUPPORT'?'green':m.sentiment==='CAUTION'?'amber':'muted'}>{titleCase(m.sentiment)}</Tag></div><span className="mono text-[9px] text-slate-600">{dateTime(m.createdAt)}</span></div><p className="mt-3 text-[11px] leading-relaxed text-slate-400">{m.message}</p><div className="mt-3 mono text-[8px] text-slate-700">AGENT REF · {m.agentId}</div></div>{i===0&&<div className="absolute left-10 top-[-7px] -translate-y-full mono text-[8px] uppercase tracking-widest text-slate-700">Most recent</div>}</article>)}</div></State></Panel>
  </State>;
}
function Risk() {
  const q=useGetRiskSettings({ query: { queryKey: getGetRiskSettingsQueryKey() } });
  const update=useUpdateRiskSettings();
  const qc=useQueryClient();
  const [form,setForm]=useState<RiskSettingsInput|null>(null);
  const value=form ?? (q.data ? {riskPerTradePercent:q.data.riskPerTradePercent,dailyLossLimitPercent:q.data.dailyLossLimitPercent,maxDrawdownPercent:q.data.maxDrawdownPercent,maxOpenPositions:q.data.maxOpenPositions} : null);
  const set=(key:keyof RiskSettingsInput,v:number)=>setForm(old=>{const current=old??(q.data?{riskPerTradePercent:q.data.riskPerTradePercent,dailyLossLimitPercent:q.data.dailyLossLimitPercent,maxDrawdownPercent:q.data.maxDrawdownPercent,maxOpenPositions:q.data.maxOpenPositions}:null);return current?{...current,[key]:v}:null;});
  const save=()=>{if(value)update.mutate({data:value},{onSuccess:()=>{qc.invalidateQueries({queryKey:getGetRiskSettingsQueryKey()});setForm(null);}})};
  return <State loading={q.isLoading} error={q.isError}><PageHead eyebrow="Capital protection / 06" title="Risk controls" detail="Adjust demo guardrails for research scenarios. These settings never authorize orders." right={<Tag tone="green">DEMO-ONLY CONFIGURATION</Tag>} />
    <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]"><Panel title="Guardrail parameters" meta={<Shield size={15} className="text-emerald-300"/>}><State loading={q.isLoading} error={q.isError}>{value&&<div className="space-y-5">{([
      ['riskPerTradePercent','Risk per trade','Maximum simulated risk allocated to an individual research position.',5,'percent'],
      ['dailyLossLimitPercent','Daily loss limit','Stop threshold used in demo analysis scenarios.',20,'percent'],
      ['maxDrawdownPercent','Maximum drawdown','Portfolio drawdown boundary for simulated guardrail checks.',50,'percent'],
      ['maxOpenPositions','Maximum open positions','Concurrent positions considered in demo scenarios.',20,'count'],
    ] as const).map(([key,label,desc,max,unit])=><div key={key} className="border-b border-border/70 pb-4 last:border-0 last:pb-0"><div className="flex items-start justify-between gap-3"><div><label htmlFor={`risk-${key}`} className="text-[11px] font-medium text-slate-200">{label}</label><p className="mt-1 text-[9px] text-slate-600">{desc}</p></div><span className="mono text-[9px] text-slate-600">MAX {max}{unit==='percent'?'%':''}</span></div><div className="mt-3 flex items-center gap-3"><input id={`risk-${key}`} type="range" min={key==='maxOpenPositions'?1:.1} max={max} step={key==='maxOpenPositions'?1:.1} value={value[key]} onChange={e=>set(key,Number(e.target.value))} className="h-1 flex-1 accent-emerald-300" data-testid={`input-${key}`} /><div className="mono w-16 rounded border border-border bg-[#101319] px-2 py-1.5 text-right text-[10px] text-slate-200">{value[key]}{unit==='percent'?'%':''}</div></div></div>)}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"><span className="text-[9px] text-slate-600">Changes are held in memory by the demo service.</span><button onClick={save} disabled={update.isPending} className="rounded bg-emerald-300 px-4 py-2 text-[10px] font-semibold text-[#102019] disabled:opacity-50" data-testid="button-save-risk">{update.isPending?'Saving…':'Save demo guardrails'}</button></div>{update.isError&&<p className="text-[10px] text-rose-300">Could not update settings. Check the demo API and try again.</p>}</div>}</State></Panel>
      <div className="space-y-4"><Panel title="Execution boundary"><div className="flex items-center gap-3 rounded border border-emerald-900/40 bg-emerald-950/15 p-3"><div className="grid h-8 w-8 place-items-center rounded bg-emerald-300/10 text-emerald-300"><Shield size={16}/></div><div><div className="text-[11px] font-medium text-slate-200">Execution disabled</div><div className="mt-1 text-[9px] text-slate-500">No order routing or brokerage connectivity.</div></div><Tag tone="green">LOCKED</Tag></div><div className="mt-4 space-y-3 text-[10px] leading-relaxed text-slate-500"><p>Risk controls here are a research aid. Updating them changes the demo configuration only.</p><p>There is no live trading functionality in this application. Simulated results do not represent real-world performance.</p></div></Panel><Panel title="Current API values" meta={<Tag tone="muted">READ-ONLY STATE</Tag>}><State loading={q.isLoading} error={q.isError}>{q.data&&<div className="space-y-2 mono text-[9px]">{[['Risk per trade',`${q.data.riskPerTradePercent}%`],['Daily loss limit',`${q.data.dailyLossLimitPercent}%`],['Max drawdown',`${q.data.maxDrawdownPercent}%`],['Open positions',String(q.data.maxOpenPositions)],['Execution enabled',String(q.data.executionEnabled)]].map(([a,b])=><div key={a} className="flex justify-between border-b border-border/60 pb-2 text-slate-500 last:border-0"><span>{a}</span><span className="text-slate-300">{b}</span></div>)}</div>}</State></Panel></div>
    </div>
  </State>;
}
function Trades() {
  const q=useGetTradingHistory({ query: { queryKey: getGetTradingHistoryQueryKey() } });
  const records=q.data??[];
  const wins=records.filter(t=>t.result==='WIN').length;
  const pnl=records.reduce((sum,t)=>sum+t.pnl,0);
  const winRate=records.length?wins/records.length*100:undefined;
  return <State loading={q.isLoading} error={q.isError}><PageHead eyebrow="Performance record / 07" title="Trade journal" detail="Closed simulated positions and realized research performance. No live trade data." right={<SimStamp/>} />
    <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4"><Metric label="Closed trades" value={String(records.length)} note="From demo history endpoint" /><Metric label="Win rate" value={winRate==null?'—':pct(winRate)} /><Metric label="Net realized P&L" value={records.length?money(pnl):'—'} delta={records.length?money(pnl):undefined} /><Metric label="Winning / losing" value={records.length?`${wins} / ${records.length-wins}`:'—'} note="Win / non-win" /></div>
    <Panel title="Closed position history" meta={<span className="mono text-[9px] text-slate-600">{records.length} RECORDS</span>}><State loading={q.isLoading} error={q.isError} empty={!records.length}><DataTable testId="table-trade-history" headers={['Instrument','Side','Quantity','Entry','Exit','Realized P&L','Opened','Closed','Outcome']}>{records.map(t=><tr key={t.id} className="border-b border-border/70 last:border-0" data-testid={`row-trade-${t.id}`}><td className="mono px-3 py-3 text-[10px] text-slate-200">{t.symbol}</td><td className="px-3 py-3"><Tag tone={t.side==='LONG'?'green':'red'}>{t.side}</Tag></td><td className="mono px-3 py-3 text-[10px] text-slate-400">{t.quantity}</td><td className="mono px-3 py-3 text-[10px] text-slate-400">{money(t.entryPrice)}</td><td className="mono px-3 py-3 text-[10px] text-slate-400">{money(t.exitPrice)}</td><td className={`mono px-3 py-3 text-[10px] ${t.pnl<0?'text-rose-300':'text-emerald-300'}`}>{money(t.pnl)}</td><td className="px-3 py-3 text-[9px] text-slate-500">{dateTime(t.openedAt)}</td><td className="px-3 py-3 text-[9px] text-slate-500">{dateTime(t.closedAt)}</td><td className="px-3 py-3"><Tag tone={t.result==='WIN'?'green':t.result==='LOSS'?'red':'muted'}>{t.result}</Tag></td></tr>)}</DataTable></State></Panel>
  </State>;
}
function Settings() {
  const q=useGetTradingSystemStatus({ query: { queryKey: getGetTradingSystemStatusQueryKey() } });
  return <State loading={q.isLoading} error={q.isError}><PageHead eyebrow="Workspace / 08" title="Configuration" detail="Demo environment status and integration readiness." right={<Tag tone="green">RESEARCH MODE</Tag>} />
    {q.data&&<div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]"><Panel title="Environment" meta={<Tag tone="amber">{q.data.mode}</Tag>}><div className="grid gap-3 sm:grid-cols-2"><div className="rounded border border-border bg-[#12161c] p-3"><div className="mono text-[9px] uppercase tracking-wider text-slate-600">Data designation</div><div className="mt-2"><SimStamp label={q.data.dataLabel}/></div></div><div className="rounded border border-border bg-[#12161c] p-3"><div className="mono text-[9px] uppercase tracking-wider text-slate-600">Trading capability</div><div className="mt-2 flex items-center gap-2 text-[11px] text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-slate-500"/>{q.data.tradingEnabled?'Enabled':'Disabled'}</div></div></div><div className="mt-4 rounded border border-emerald-900/40 bg-emerald-950/15 p-4"><div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-200"><Shield size={14}/> Live execution is unavailable</div><p className="mt-2 max-w-xl text-[10px] leading-relaxed text-slate-500">This workspace is a multi-agent research demo. Market data, portfolio values, backtests and insights are simulated. No brokerage account or order pathway is connected.</p></div></Panel>
      <Panel title="Integration readiness" meta={<span className="mono text-[9px] text-slate-600">{q.data.integrations.length} SERVICES</span>}><div className="space-y-1">{q.data.integrations.map((i)=><div key={i.name} className="flex items-center justify-between gap-3 border-b border-border/70 py-3 last:border-0" data-testid={`integration-${i.name}`}><div className="flex items-center gap-3"><div className="grid h-8 w-8 place-items-center rounded border border-border bg-[#12161c] text-slate-500"><Database size={14}/></div><div><div className="text-[10px] text-slate-300">{i.name}</div><div className="mt-1 text-[9px] text-slate-600">{i.note}</div></div></div><Tag tone={i.status==='READY'?'green':i.status==='PLANNED'?'amber':'muted'}>{titleCase(i.status)}</Tag></div>)}</div></Panel>
    </div>}
    <Panel title="Demo configuration boundaries" className="mt-4"><div className="grid gap-4 md:grid-cols-3">{[['Market data','Simulated series only. No external live quote feed.'],['Portfolio state','Values are generated for demonstration and research workflows.'],['Agent research','Outputs are analytical summaries, not recommendations or execution instructions.']].map(([title,copy],i)=><div key={title} className="flex gap-3"><div className="mono pt-0.5 text-[10px] text-emerald-300">0{i+1}</div><div><div className="text-[10px] font-semibold text-slate-300">{title}</div><p className="mt-1 text-[9px] leading-relaxed text-slate-600">{copy}</p></div></div>)}</div></Panel>
  </State>;
}
function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}
function Router() {
  return <Frame><RoutedErrorBoundary><Switch>
    <Route path="/" component={Overview}/>
    <Route path="/agents" component={Agents}/>
    <Route path="/market" component={Market}/>
    <Route path="/strategies" component={Strategies}/>
    <Route path="/collaboration" component={Collaboration}/>
    <Route path="/risk" component={Risk}/>
    <Route path="/trades" component={Trades}/>
    <Route path="/settings" component={Settings}/>
    <Route><div className="panel p-10 text-center"><div className="display text-2xl">Route not found</div><Link href="/" className="mt-4 inline-block text-xs text-emerald-300">Return to overview</Link></div></Route>
  </Switch></RoutedErrorBoundary></Frame>;
}
function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/,'')}><Router/></WouterRouter><Toaster/></TooltipProvider></QueryClientProvider>;
}

export default App;
