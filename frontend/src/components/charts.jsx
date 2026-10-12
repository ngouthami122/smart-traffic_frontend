// Small SVG/CSS charts written by hand, so the project needs no chart library.
import { inr } from "../format";

export function Donut({ data, center, sub }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const r = 60, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 160 160" role="img" aria-label={data.map((d) => `${d.label}: ${d.value}`).join(", ")}>
        <circle cx="80" cy="80" r={r} fill="none" stroke="var(--line)" strokeWidth="22" />
        {total > 0 && data.map((d) => {
          const len = (d.value / total) * c;
          const el = <circle key={d.label} cx="80" cy="80" r={r} fill="none" stroke={d.color} strokeWidth="22"
            strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} transform="rotate(-90 80 80)" />;
          offset += len;
          return el;
        })}
        <text x="80" y={sub ? 76 : 80} textAnchor="middle" dominantBaseline="central" className="donut-num">{center ?? total}</text>
        {sub && <text x="80" y="98" textAnchor="middle" className="donut-sub">{sub}</text>}
      </svg>
      <ul className="legend">
        {data.map((d) => <li key={d.label}><i style={{ background: d.color }} />{d.label}<b>{d.value}</b></li>)}
      </ul>
    </div>
  );
}

/** Grouped vertical bars. rows: [{ label, a, b }], series: [{ key, name, color }] */
export function Bars({ rows, series, money }) {
  const max = Math.max(1, ...rows.flatMap((r) => series.map((s) => r[s.key])));
  return (
    <div>
      <div className="bars" role="img" aria-label="Bar chart">
        {rows.map((r) => (
          <div className="bar-col" key={r.label}>
            <div className="bar-stack">
              {series.map((s) => (
                <div key={s.key} className="bar" style={{ height: `${(r[s.key] / max) * 100}%`, background: s.color }}
                  title={`${s.name}: ${money ? inr(r[s.key]) : r[s.key]}`} />
              ))}
            </div>
            <span>{r.label}</span>
          </div>
        ))}
      </div>
      <ul className="legend row">{series.map((s) => <li key={s.key}><i style={{ background: s.color }} />{s.name}</li>)}</ul>
    </div>
  );
}

export function HBars({ rows, color = "var(--brand)" }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="hbars">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="hb-top"><span>{r.label}</span><b>{r.value}</b></div>
          <div className="hb-track"><div style={{ width: `${(r.value / max) * 100}%`, background: color }} /></div>
        </li>
      ))}
    </ul>
  );
}
