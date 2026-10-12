import { api } from "../api";
import { useLoad } from "../hooks";
import { inr, label, monthLabel, COLORS } from "../format";
import { Card, Loading, ErrorBox, StatCard } from "../components/ui";
import { Donut, Bars, HBars } from "../components/charts";

export default function Reports() {
  const { data, loading, error, reload } = useLoad(() => Promise.all([api.byStatus(), api.fines(), api.occupancy()]), []);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  const [byStatus, fines, occ] = data;
  const paid = byStatus.find((r) => r.status === "PAID"), pending = byStatus.find((r) => r.status === "PENDING");
  return (
    <>
      <div className="report-head no-print"><p className="muted">Live figures from the database.</p><button className="btn" onClick={() => window.print()}>🖨 Print / Save as PDF</button></div>

      <Card title="1. Challans by payment status">
        <div className="grid-2 align">
          <Donut data={[{ label: "Paid", value: paid.count, color: COLORS.ok }, { label: "Pending", value: pending.count, color: COLORS.warn }]} center={paid.count + pending.count} sub="challans" />
          <div className="table-wrap"><table>
            <thead><tr><th>Status</th><th className="num">Challans</th><th className="num">Amount</th></tr></thead>
            <tbody>{byStatus.map((r) => <tr key={r.status}><td>{label(r.status)}</td><td className="num">{r.count}</td><td className="num">{inr(r.amount)}</td></tr>)}</tbody>
          </table></div>
        </div>
      </Card>

      <Card title="2. Fine collection">
        <div className="stats small">
          <StatCard icon="🧮" label="Total issued" value={inr(fines.totalIssued)} />
          <StatCard icon="💰" label="Collected" value={inr(fines.collected)} tone="ok" />
          <StatCard icon="⏳" label="Pending" value={inr(fines.pending)} tone="warn" />
          <StatCard icon="🎯" label="Collection rate" value={`${fines.collectionRatePercent}%`} />
        </div>
        <div className="grid-2 align">
          <Bars money rows={fines.byMonth.map((m) => ({ label: monthLabel(m.month), collected: Number(m.collected), pending: Number(m.pending) }))}
            series={[{ key: "collected", name: "Collected", color: COLORS.ok }, { key: "pending", name: "Pending", color: COLORS.warn }]} />
          <div><h3 className="sub-h">Challans by violation</h3><HBars rows={fines.byViolation.map((v) => ({ label: label(v.type), value: v.count }))} /></div>
        </div>
      </Card>

      <Card title="3. Parking occupancy">
        <div className="grid-2 align">
          <Donut data={[{ label: "Occupied", value: occ.occupied, color: COLORS.bad }, { label: "Available", value: occ.available, color: COLORS.ok }]} center={`${occ.occupancyPercent}%`} sub="occupied" />
          <div>
            <div className="table-wrap"><table>
              <thead><tr><th>Slot type</th><th className="num">Total</th><th className="num">Occupied</th><th className="num">Free</th></tr></thead>
              <tbody>{occ.bySlotType.map((r) => <tr key={r.type}><td>{label(r.type)}</td><td className="num">{r.total}</td><td className="num">{r.occupied}</td><td className="num">{r.total - r.occupied}</td></tr>)}</tbody>
            </table></div>
            <p className="revenue">Parking revenue collected: <b>{inr(occ.parkingRevenue)}</b></p>
          </div>
        </div>
      </Card>
    </>
  );
}
