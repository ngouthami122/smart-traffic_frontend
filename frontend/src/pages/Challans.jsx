import { useState } from "react";
import { api } from "../api";
import { useLoad, useDebounced } from "../hooks";
import { inr, dateStr, label, todayStr, VIOLATIONS } from "../format";
import { Card, Modal, Field, Pill, Loading, ErrorBox, Empty, useToast } from "../components/ui";

const blank = () => ({ vehicleNumber: "", violationType: "NO_HELMET", violationDate: todayStr(), fineAmount: 1000, paymentStatus: "PENDING" });

function ChallanForm({ initial, onClose, onSaved }) {
  const editing = Boolean(initial?.id);
  const [f, setF] = useState(initial ? { ...initial } : blank());
  const [errors, setErrors] = useState({});
  const [topError, setTopError] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const pickType = (t) => {
    set("violationType", t);
    if (!editing) set("fineAmount", VIOLATIONS.find(([k]) => k === t)[1]);
  };
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setErrors({}); setTopError("");
    const body = { vehicleNumber: f.vehicleNumber, violationType: f.violationType, violationDate: f.violationDate, fineAmount: Number(f.fineAmount), paymentStatus: f.paymentStatus };
    try {
      editing ? await api.updateChallan(initial.id, body) : await api.createChallan(body);
      toast(editing ? "Challan updated" : "Challan created");
      onSaved();
    } catch (err) { setErrors(err.fieldErrors || {}); setTopError(err.message); }
    finally { setSaving(false); }
  };
  return (
    <Modal title={editing ? "Edit challan" : "New challan"} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        {topError && <div className="alert" role="alert">{topError}</div>}
        <Field label="Vehicle number" error={errors.vehicleNumber}>
          <input value={f.vehicleNumber} onChange={(e) => set("vehicleNumber", e.target.value.toUpperCase())} placeholder="TS09EA1234" maxLength={15} autoFocus />
        </Field>
        <div className="two">
          <Field label="Violation type" error={errors.violationType}>
            <select value={f.violationType} onChange={(e) => pickType(e.target.value)}>{VIOLATIONS.map(([k]) => <option key={k} value={k}>{label(k)}</option>)}</select>
          </Field>
          <Field label="Violation date" error={errors.violationDate}>
            <input type="date" max={todayStr()} value={f.violationDate} onChange={(e) => set("violationDate", e.target.value)} />
          </Field>
        </div>
        <div className="two">
          <Field label="Fine amount (INR)" error={errors.fineAmount}>
            <input type="number" min="1" step="0.01" value={f.fineAmount} onChange={(e) => set("fineAmount", e.target.value)} />
          </Field>
          <Field label="Payment status" error={errors.paymentStatus}>
            <select value={f.paymentStatus} onChange={(e) => set("paymentStatus", e.target.value)}><option value="PENDING">Pending</option><option value="PAID">Paid</option></select>
          </Field>
        </div>
        <div className="actions"><button type="button" className="btn ghost" onClick={onClose}>Cancel</button><button className="btn primary" disabled={saving}>{saving ? "Saving..." : "Save challan"}</button></div>
      </form>
    </Modal>
  );
}

export default function Challans() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [editing, setEditing] = useState(null); // null = closed, {} = new, row = edit
  const q = useDebounced(search);
  const { data, loading, error, reload } = useLoad(() => api.challans({ search: q, status, type }), [q, status, type]);
  const toast = useToast();

  const markPaid = async (c) => {
    try { await api.updateChallan(c.id, { vehicleNumber: c.vehicleNumber, violationType: c.violationType, violationDate: c.violationDate, fineAmount: c.fineAmount, paymentStatus: "PAID" }); toast("Marked as paid"); reload(); }
    catch (e) { toast(e.message, "err"); }
  };
  const remove = async (c) => {
    if (!window.confirm(`Delete the challan for ${c.vehicleNumber}? This cannot be undone.`)) return;
    try { await api.deleteChallan(c.id); toast("Challan deleted"); reload(); } catch (e) { toast(e.message, "err"); }
  };

  return (
    <Card title="Traffic challans" action={<button className="btn primary" onClick={() => setEditing({})}>+ New challan</button>}>
      <div className="toolbar">
        <input className="search" type="search" placeholder="Search vehicle number..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search by vehicle number" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status"><option value="">All statuses</option><option value="PENDING">Pending</option><option value="PAID">Paid</option></select>
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by violation"><option value="">All violations</option>{VIOLATIONS.map(([k]) => <option key={k} value={k}>{label(k)}</option>)}</select>
      </div>
      {loading && !data ? <Loading /> : error ? <ErrorBox message={error} onRetry={reload} /> : data.length === 0 ? <Empty>No challans match your filters.</Empty> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Vehicle</th><th>Violation</th><th>Date</th><th className="num">Fine</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id}>
                  <td><span className="plate">{c.vehicleNumber}</span></td>
                  <td>{label(c.violationType)}</td>
                  <td>{dateStr(c.violationDate)}</td>
                  <td className="num">{inr(c.fineAmount)}</td>
                  <td><Pill kind={c.paymentStatus === "PAID" ? "ok" : "warn"}>{label(c.paymentStatus)}</Pill>{c.paidDate && <small className="sub">on {dateStr(c.paidDate)}</small>}</td>
                  <td className="row-actions">
                    {c.paymentStatus === "PENDING" && <button className="btn sm ok" onClick={() => markPaid(c)}>Mark paid</button>}
                    <button className="btn sm" onClick={() => setEditing(c)}>Edit</button>
                    <button className="btn sm danger" onClick={() => remove(c)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && data && <p className="count">{data.length} challan{data.length === 1 ? "" : "s"} shown</p>}
      {editing && <ChallanForm initial={editing.id ? editing : null} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
    </Card>
  );
}
