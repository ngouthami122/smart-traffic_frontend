import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const LINKS = [
  ["/", "Dashboard", "📊"],
  ["/challans", "Challans", "🧾"],
  ["/parking", "Parking", "🅿️"],
  ["/reports", "Reports", "📈"],
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const title = (LINKS.find(([p]) => p === pathname) || LINKS[0])[1];
  return (
    <div className="shell">
      <aside className={"sidebar" + (open ? " open" : "")}>
        <div className="brand"><span className="brand-mark">🚦</span><div><b>SmartTraffic</b><small>Challan &amp; Parking</small></div></div>
        <nav aria-label="Main">
          {LINKS.map(([to, text, icon]) => (
            <NavLink key={to} to={to} end onClick={() => setOpen(false)} className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              <span aria-hidden="true">{icon}</span>{text}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">Traffic Control Room<br /><small>College project demo</small></div>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <div className="main">
        <header className="topbar">
          <button className="burger icon-btn" onClick={() => setOpen(true)} aria-label="Open menu">☰</button>
          <h1>{title}</h1>
          <span className="today">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
