import Link from 'next/link';
import {
  MessageCircle,
  ShoppingBag,
  Eye,
  Search,
  PackageX,
  Star,
  Users,
  TicketPercent,
  Trophy,
  History,
  Building2,
  BellRing,
} from 'lucide-react';
import { getDashboard } from '@/lib/dashboard.server';
import { getServerHealth } from '@/lib/health.server';
import { getVisits } from '@/lib/visits.server';
import { ServerHealthCard } from './ServerHealthCard';
import { VisitsCard } from './VisitsCard';
import { ACTION_LABELS, ENTITY_LABELS } from '@/lib/audit.server';
import { ORDER_STATUS_LABELS } from '@/lib/orders';
import { formatPrice } from '@/lib/money';

export const dynamic = 'force-dynamic';

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
}) {
  const body = (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 transition hover:border-amber-500/40">
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Icon className="h-4 w-4 text-amber-500" />
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-white">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-zinc-500">{hint}</p>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h2 className="mb-3 text-sm font-bold text-amber-400">{title}</h2>
      {children}
    </section>
  );
}

const dateFmt = new Intl.DateTimeFormat('ar-SY', { dateStyle: 'short', timeStyle: 'short' });

export default async function AdminDashboardPage() {
  const [d, health, visits] = await Promise.all([getDashboard(), getServerHealth(), getVisits()]);
  const pending = d.orders.byStatus.PENDING ?? 0;
  const conv = d.funnel.views ? Math.round((d.funnel.checkouts / d.funnel.views) * 100) : 0;

  return (
    <>
      <h1 className="mb-1 font-amiri text-3xl font-bold">لوحة المؤشرات</h1>
      <p className="mb-6 text-sm text-zinc-400">
        نظرة اليوم: ما يفعله الزوار، وما ينتظر قرارك. الأرقام من أحداث الموقع نفسه (بلا اعتماد على
        Google أو Meta).
      </p>

      <div className="mb-6 grid gap-4">
        <ServerHealthCard health={health} />
        <VisitsCard visits={visits} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi
          icon={MessageCircle}
          label="نقرات واتساب اليوم"
          value={d.whatsapp.today}
          hint={`${d.whatsapp.week} هذا الأسبوع · ${d.whatsapp.month} هذا الشهر`}
        />
        <Kpi
          icon={ShoppingBag}
          label="طلبات بانتظار التأكيد"
          value={pending}
          hint={`${d.orders.week} طلباً هذا الأسبوع`}
          href="/admin/orders?status=PENDING"
        />
        <Kpi
          icon={TicketPercent}
          label="مبيعات مؤكَّدة (30 يوماً)"
          value={`${formatPrice(d.orders.revenueMonth)}`}
          hint={`${d.orders.confirmedMonth} طلباً مؤكَّداً · ${d.redemptionsMonth} كوبوناً استُخدم`}
          href="/admin/orders?status=CONFIRMED"
        />
        <Kpi
          icon={Users}
          label="الحسابات"
          value={d.customers.total}
          hint={`+${d.customers.week} هذا الأسبوع`}
          href="/admin/customers"
        />
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <Panel title="قمع الأسبوع (مشاهدة → سلة → واتساب)">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'مشاهدات منتج', value: d.funnel.views, icon: Eye },
              { label: 'إضافة للسلة', value: d.funnel.adds, icon: ShoppingBag },
              { label: 'إكمال عبر واتساب', value: d.funnel.checkouts, icon: MessageCircle },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-zinc-950/60 p-3">
                <s.icon className="mx-auto mb-1 h-4 w-4 text-zinc-500" />
                <p className="text-xl font-bold tabular-nums text-white">{s.value}</p>
                <p className="text-[11px] text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            نسبة التحويل من المشاهدة إلى الطلب: <b className="text-white">{conv}%</b>
          </p>
        </Panel>
        <Panel title="ينتظر قرارك">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between">
              <Link
                href="/admin/reviews"
                className="flex items-center gap-2 text-zinc-300 hover:text-white"
              >
                <Star className="h-4 w-4 text-amber-500" /> تقييمات بانتظار الموافقة
              </Link>
              <b className="tabular-nums text-white">{d.pendingReviews}</b>
            </li>
            <li className="flex items-center justify-between">
              <Link
                href="/admin/orders?status=PENDING"
                className="flex items-center gap-2 text-zinc-300 hover:text-white"
              >
                <ShoppingBag className="h-4 w-4 text-amber-500" /> طلبات لم تُؤكَّد
              </Link>
              <b className="tabular-nums text-white">{pending}</b>
            </li>
            <li className="flex items-center justify-between">
              <Link
                href="/admin/leads"
                className="flex items-center gap-2 text-zinc-300 hover:text-white"
              >
                <Building2 className="h-4 w-4 text-amber-500" /> طلبات جملة جديدة
              </Link>
              <b className="tabular-nums text-white">{d.newLeads}</b>
            </li>
            <li className="flex items-center justify-between">
              <Link
                href="/admin/products"
                className="flex items-center gap-2 text-zinc-300 hover:text-white"
              >
                <BellRing className="h-4 w-4 text-amber-500" /> ينتظرون توفر منتج
              </Link>
              <b className="tabular-nums text-white">{d.waitingAlerts}</b>
            </li>
            <li className="flex items-center justify-between">
              <Link
                href="/admin/draws"
                className="flex items-center gap-2 text-zinc-300 hover:text-white"
              >
                <Trophy className="h-4 w-4 text-amber-500" /> السحب المفتوح
              </Link>
              <span className="text-xs text-zinc-400">
                {d.openDraw
                  ? `${d.openDraw._count.entries} مشاركة · ينتهي ${dateFmt.format(d.openDraw.endsAt)}`
                  : 'لا سحب مفتوح'}
              </span>
            </li>
          </ul>
        </Panel>
        <Panel title="مخزون منخفض / نافد">
          {d.lowStock.length === 0 ? (
            <p className="text-sm text-zinc-500">كل المنتجات متوفرة فوق العتبة.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {d.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-zinc-300">
                    <PackageX className="h-4 w-4 text-red-400" /> {p.name}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {!p.inStock ? 'غير متوفر' : `بقي ${p.stockQty}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <Panel title="الأكثر مشاهدةً (7 أيام)">
          <ol className="space-y-1.5 text-sm">
            {d.topViewed.length === 0 && <li className="text-zinc-500">لا بيانات بعد.</li>}
            {d.topViewed.map((t) => (
              <li key={t.key} className="flex justify-between gap-2">
                <span className="truncate text-zinc-300">{t.product?.name ?? t.key}</span>
                <b className="tabular-nums text-white">{t.count}</b>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="الأكثر إضافةً للسلة (7 أيام)">
          <ol className="space-y-1.5 text-sm">
            {d.topAdded.length === 0 && <li className="text-zinc-500">لا بيانات بعد.</li>}
            {d.topAdded.map((t) => (
              <li key={t.key} className="flex justify-between gap-2">
                <span className="truncate text-zinc-300">{t.product?.name ?? 'خلطة مخصّصة'}</span>
                <b className="tabular-nums text-white">{t.count}</b>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title={`البحث (30 يوماً · ${d.searches.total})`}>
          <ol className="space-y-1.5 text-sm">
            {d.searches.top.length === 0 && <li className="text-zinc-500">لا عمليات بحث بعد.</li>}
            {d.searches.top.map((t) => (
              <li key={t.key} className="flex justify-between gap-2">
                <span className="flex items-center gap-1.5 truncate text-zinc-300">
                  <Search className="h-3.5 w-3.5 text-zinc-600" /> {t.key}
                </span>
                <b className="tabular-nums text-white">{t.count}</b>
              </li>
            ))}
          </ol>
          {d.searches.zero.length > 0 && (
            <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 p-2">
              <p className="mb-1 text-[11px] font-bold text-red-300">
                بُحث عنه ولم يُوجد — أفكار منتجات:
              </p>
              <p className="text-xs text-zinc-300">
                {d.searches.zero.map((z) => z.key).join(' · ')}
              </p>
            </div>
          )}
        </Panel>
      </div>

      <Panel title="آخر التغييرات">
        <ul className="divide-y divide-zinc-800 text-sm">
          {d.recentAudit.length === 0 && (
            <li className="py-2 text-zinc-500">لا تغييرات مسجّلة بعد.</li>
          )}
          {d.recentAudit.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-2 py-2">
              <History className="h-3.5 w-3.5 text-zinc-600" />
              <span className="text-zinc-400">{a.actor}</span>
              <span className="text-white">
                {ACTION_LABELS[a.action] ?? a.action} {ENTITY_LABELS[a.entity] ?? a.entity}
              </span>
              {a.label && <span className="text-amber-300">«{a.label}»</span>}
              <time className="mr-auto text-xs text-zinc-600">{dateFmt.format(a.createdAt)}</time>
            </li>
          ))}
        </ul>
        <Link
          href="/admin/activity"
          className="mt-3 inline-block text-xs text-amber-400 hover:underline"
        >
          السجل الكامل ←
        </Link>
      </Panel>
      <p className="mt-6 text-xs text-zinc-600">
        حالات الطلبات:{' '}
        {Object.entries(d.orders.byStatus)
          .map(([s, n]) => `${ORDER_STATUS_LABELS[s as keyof typeof ORDER_STATUS_LABELS]} ${n}`)
          .join(' · ') || 'لا طلبات'}
      </p>
    </>
  );
}
