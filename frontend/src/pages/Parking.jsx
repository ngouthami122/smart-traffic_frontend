import { useState } from "react";
import { api } from "../api";
import { useLoad } from "../hooks";
import { inr, dateTime, duration, label, SLOT_TYPES } from "../format";
import { Card, Modal, Field, Pill, Loading, ErrorBox, Empty, useToast } from "../components/ui";

function SlotForm({ initial, onClose, onSaved }) {
  const editing = Boolean(initial?.id);
  const [f, setF] = useState({ slotNumber: initial?.slotNumber || "", slotType: initial?.slotType || "CAR" });
  const [err, setErr] = useState({}); const [top, setTop] = useState("");
  const toast = useToast();
  const submit = async (e) => {
    e.preventDefault(); setErr({}); setTop("");
    try { editing ? await api.updateSlot(initial.id, f) : await api.createSlot(f); toast(editing ? "Slot updated" : "Slot added"); onSaved(); }
    catch (x) { setErr(x.fieldErrors || {}); setTop(x.message); }
  };
  return (
    <Modal title={editing ? "Edit parking slot" : "Add parking slot"} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        {top && <div className="alert" role="alert">{top}</div>}
        <Field label="Slot number" error={err.slotNumber}><input value={f.slotNumber} onChange={(e) => setF({ ...f, slotNumber: e.target.value.toUpperCase() })} placeholder="A7" maxLength={20} autoFocus /></Field>
        <Field label="Slot type" error={err.slotType}><select value={f.slotType} onChange={(e) => setF({ ...f, slotType: e.target.value })}>{SLOT_TYPES.map((t) => <option key={t} value={t}>{label(t)}</option>)}</select></Field>
        <div className="actions"><button type="button" className="btn ghost" onClick={onClose}>Cancel</button><button className="btn primary">Save</button></div>
      </form>
    </Modal>
  );
}

export default function Parking() {
  const { data, loading, error, reload } = useLoad(() => Promise.all([api.slots(), api.active(), api.history()]), []);
  const [entry, setEntry] = useState({ vehicleNumber: "", slotId: "" });
  const [entryErr, setEntryErr] = useState({}); const [entryTop, setEntryTop] = useState("");
  const [exitPlate, setExitPlate] = useState(""); const [exitErr, setExitErr] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [slotModal, setSlotModal] = useState(null);
  const toast = useToast();

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  const [slots, active, history] = data;
  const free = slots.filter((s) => !s.occupied);
  const parkedAt = Object.fromEntries(active.map((r) => [r.slot.id, r.vehicleNumber]));

  const doEntry = async (e) => {
    e.preventDefault(); setEntryErr({}); setEntryTop("");
    try {
      const r = await api.entry({ vehicleNumber: entry.vehicleNumber, slotId: Number(entry.slotId) || null });
      toast(`${r.vehicleNumber} parked in ${r.slot.slotNumber}`); setEntry({ vehicleNumber: "", slotId: "" }); reload();
    } catch (x) { setEntryErr(x.fieldErrors || {}); setEntryTop(x.message); }
  };
  const doExit = async (plate) => {
    setExitErr("");
    try { const r = await api.exit({ vehicleNumber: plate }); setReceipt(r); setExitPlate(""); reload(); }
    catch (x) { setExitErr(x.fieldErrors?.vehicleNumber || x.message); }
  };
  const removeSlot = async (s) => {
    if (!window.confirm(`Delete slot ${s.slotNumber}?`)) return;
    try { await api.deleteSlot(s.id); toast("Slot deleted"); reload(); } catch (x) { toast(x.message, "err"); }
  };

  return (
    <>
      <Card title="Parking slots" action={<button className="btn primary" onClick={() => setSlotModal({})}>+ Add slot</button>}>
        <p className="count">{free.length} available · {slots.length - free.length} occupied · {slots.length} total</p>
        {slots.length === 0 ? <Empty>No slots yet. Add your first parking slot.</Empty> : (
          <div className="slot-grid">
            {slots.map((s) => (
              <div key={s.id} className={"slot " + (s.occupied ? "busy" : "free")}>
                <div className="slot-top"><b>{s.slotNumber}</b><Pill kind={s.occupied ? "bad" : "ok"}>{s.occupied ? "Occupied" : "Free"}</Pill></div>
                <div className="slot-type">{label(s.slotType)}</div>
                <div className="slot-car">{s.occupied ? <span className="plate sm">{parkedAt[s.id]}</span> : <button className="link" onClick={() => setEntry({ ...entry, slotId: String(s.id) })}>Use this slot</button>}</div>
                <div className="slot-actions"><button className="link" onClick={() => setSlotModal(s)}>Edit</button><button className="link danger" disabled={s.occupied} onClick={() => removeSlot(s)}>Delete</button></div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid-2">
        <Card title="Register vehicle entry">
          <form onSubmit={doEntry} noValidate>
            {entryTop && <div className="alert" role="alert">{entryTop}</div>}
            <Field label="Vehicle number" error={entryErr.vehicleNumber}><input value={entry.vehicleNumber} onChange={(e) => setEntry({ ...entry, vehicleNumber: e.target.value.toUpperCase() })} placeholder="TS09EA1234" maxLength={15} /></Field>
            <Field label="Parking slot" error={entryErr.slotId}>
              <select value={entry.slotId} onChange={(e) => setEntry({ ...entry, slotId: e.target.value })}>
                <option value="">Choose a free slot</option>{free.map((s) => <option key={s.id} value={s.id}>{s.slotNumber} ({label(s.slotType)})</option>)}
              </select>
            </Field>
            <button className="btn primary">Register entry</button>
          </form>
        </Card>
        <Card title="Record vehicle exit">
          <form onSubmit={(e) => { e.preventDefault(); doExit(exitPlate); }} noValidate>
            <Field label="Vehicle number" error={exitErr}><input value={exitPlate} onChange={(e) => setExitPlate(e.target.value.toUpperCase())} placeholder="TS09EA1234" maxLength={15} /></Field>
            <button className="btn primary">Record exit and calculate charge</button>
            <p className="hint">Charge = hourly rate x hours, rounded up to a full hour (minimum 1 hour). Car {inr(30)}, bike {inr(10)}, EV {inr(40)} per hour.</p>
          </form>
        </Card>
      </div>

      <Card title={`Currently parked (${active.length})`}>
        {active.length === 0 ? <Empty>No vehicles are parked right now.</Empty> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Vehicle</th><th>Slot</th><th>Entered</th><th>Parked for</th><th></th></tr></thead>
            <tbody>{active.map((r) => (
              <tr key={r.id}><td><span className="plate">{r.vehicleNumber}</span></td><td>{r.slot.slotNumber} <small className="sub">{label(r.slot.slotType)}</small></td><td>{dateTime(r.entryTime)}</td><td>{duration(r.entryTime)}</td>
                <td className="row-actions"><button className="btn sm" onClick={() => doExit(r.vehicleNumber)}>Exit</button></td></tr>))}
            </tbody></table></div>
        )}
      </Card>

      <Card title="Recent parking history">
        {history.length === 0 ? <Empty>No completed visits yet.</Empty> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Vehicle</th><th>Slot</th><th>Entry</th><th>Exit</th><th>Duration</th><th className="num">Charge</th></tr></thead>
            <tbody>{history.map((r) => (
              <tr key={r.id}><td><span className="plate">{r.vehicleNumber}</span></td><td>{r.slot.slotNumber}</td><td>{dateTime(r.entryTime)}</td><td>{dateTime(r.exitTime)}</td><td>{duration(r.entryTime, r.exitTime)}</td><td className="num">{inr(r.charge)}</td></tr>))}
            </tbody></table></div>
        )}
      </Card>

      {slotModal && <SlotForm initial={slotModal.id ? slotModal : null} onClose={() => setSlotModal(null)} onSaved={() => { setSlotModal(null); reload(); }} />}
      {receipt && (
        <Modal title="Parking charge" onClose={() => setReceipt(null)}>
          <div className="receipt">
            <span className="plate">{receipt.vehicleNumber}</span>
            <div className="big">{inr(receipt.charge)}</div>
            <dl><dt>Slot</dt><dd>{receipt.slot.slotNumber} ({label(receipt.slot.slotType)})</dd><dt>Entry</dt><dd>{dateTime(receipt.entryTime)}</dd><dt>Exit</dt><dd>{dateTime(receipt.exitTime)}</dd><dt>Duration</dt><dd>{duration(receipt.entryTime, receipt.exitTime)}</dd></dl>
          </div>
          <div className="actions"><button className="btn primary" onClick={() => setReceipt(null)}>Done</button></div>
        </Modal>
      )}
    </>
  );
}
