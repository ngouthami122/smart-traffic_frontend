import { api } from "../api";
import { useLoad } from "../hooks";
import { inr, label, monthLabel, COLORS } from "../format";
import { Card, Loading, ErrorBox, StatCard } from "../components/ui";
import { Donut, Bars, HBars } from "../components/charts";

export default function Dashboard() {
  const { data, loading, error, reload } = useLoad(() => Promise.all([api.summary(), api.fines(), api.occupancy()]), []);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  const [s, fines, occ] = data;
  return (
    <>
      <div className="stats">
        <StatCard icon="🧾" label="Total challans" value={s.totalChallans} hint={`${s.pendingChallans} pending · ${s.paidChallans} paid`} />
        <StatCard icon="⏳" label="Pending fines" value={inr(s.pendingFines)} hint="Yet to be collected" tone="warn" />
        <StatCard icon="💰" label="Collected fines" value={inr(s.collectedFines)} hint={`${fines.collectionRatePercent}% of all fines`} tone="ok" />
        <StatCard icon="🅿️" label="Total parking slots" value={s.totalSlots} tone="violet" />
        <StatCard icon="✅" label="Available slots" value={s.availableSlots} tone="ok" />
        <StatCard icon="🚗" label="Occupied slots" value={s.occupiedSlots} tone="bad" />
      </div>
      <div className="grid-3">
        <Card title="Challans by payment status">
          <Donut data={[{ label: "Paid", value: s.paidChallans, color: COLORS.ok }, { label: "Pending", value: s.pendingChallans, color: COLORS.warn }]} center={s.totalChallans} sub="challans" />
        </Card>
        <Card title="Parking occupancy">
          <Donut data={[{ label: "Occupied", value: s.occupiedSlots, color: COLORS.bad }, { label: "Available", value: s.availableSlots, color: COLORS.ok }]} center={`${occ.occupancyPercent}%`} sub="occupied" />
        </Card>
        <Card title="Top violations">
          <HBars rows={fines.byViolation.slice(0, 5).map((v) => ({ label: label(v.type), value: v.count }))} />
        </Card>
      </div>
      <Card title="Fines by month (last 6 months)">
        <Bars money rows={fines.byMonth.map((m) => ({ label: monthLabel(m.month), collected: Number(m.collected), pending: Number(m.pending) }))}
          series={[{ key: "collected", name: "Collected", color: COLORS.ok }, { key: "pending", name: "Pending", color: COLORS.warn }]} />
      </Card>
    </>
  );
}
