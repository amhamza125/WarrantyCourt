// App shell — SPEC §2/§4: phone app bar + hamburger drawer, the 240px
// desktop rail, the wallet row, the global banners (paused = §2 wording
// from copy.js, contract override = §3.9 amber), hash routing with the
// full route table, the §2 keying rule (records keyed by contract +
// wallet so a switch replaces them with reading states immediately),
// the footer, the wallet chooser and the toasts.
import React, { useEffect, useState } from "react";
import { useStore } from "./lib/store.jsx";
import { OVERRIDE_BANNER_TEXT, PAUSED_BANNER_TEXT } from "./lib/copy.js";
import { explorerTxUrl } from "./lib/config.js";
import { WalletChooser } from "./components/WalletChooser.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { Register } from "./pages/Register.jsx";
import { PolicyDetail } from "./pages/PolicyDetail.jsx";
import { PurchaseDetail } from "./pages/PurchaseDetail.jsx";
import { ClaimDetail } from "./pages/ClaimDetail.jsx";
import { Seller } from "./pages/Seller.jsx";
import { Buyer } from "./pages/Buyer.jsx";
import { Funds } from "./pages/Funds.jsx";
import { Admin } from "./pages/Admin.jsx";
import { Settings } from "./pages/Settings.jsx";

const ICONS = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="10" width="8" height="11" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
    </svg>
  ),
  register: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  seller: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H2v10l9.3 9.3a1 1 0 0 0 1.4 0l8.6-8.6a1 1 0 0 0 0-1.4z" />
      <circle cx="7" cy="7" r="1.6" />
    </svg>
  ),
  buyer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 7h15l-1.5 9h-12z" />
      <path d="M6 7L5 3H2" />
      <circle cx="9" cy="20" r="1.6" />
      <circle cx="18" cy="20" r="1.6" />
    </svg>
  ),
  funds: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M15 9.5c-.6-1-1.7-1.5-3-1.5-1.7 0-3 .9-3 2.2 0 3 6 1.6 6 4.3 0 1.3-1.3 2.2-3 2.2-1.4 0-2.6-.6-3.2-1.7" />
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l8 3v6c0 5-3.5 9.3-8 11-4.5-1.7-8-6-8-11V5z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19 12a7 7 0 0 0-.14-1.4l2-1.55-2-3.46-2.35.95A7 7 0 0 0 14.1 5.1L13.7 2.6h-3.4L9.9 5.1a7 7 0 0 0-2.41 1.44L5.14 5.6l-2 3.46 2 1.55a7 7 0 0 0 0 2.8l-2 1.55 2 3.46 2.35-.95a7 7 0 0 0 2.41 1.44l.4 2.5h3.4l.4-2.5a7 7 0 0 0 2.41-1.44l2.35.95 2-3.46-2-1.55c.1-.46.14-.93.14-1.4z" />
    </svg>
  ),
};

function parseRoute() {
  const h = (window.location.hash || "#/").replace(/^#\/?/, "");
  if (h === "") return { page: "dashboard" };
  const detail = /^(policy|purchase|claim)-(\d+)$/.exec(h);
  if (detail) return { page: detail[1], id: Number(detail[2]) };
  if (["register", "seller", "buyer", "funds", "admin", "settings"].includes(h)) return { page: h };
  return { page: "dashboard" };
}

function activeFor(route) {
  switch (route.page) {
    case "dashboard":
      return "dashboard";
    case "register":
    case "claim":
      return "register";
    case "seller":
    case "policy":
      return "seller";
    case "buyer":
    case "purchase":
      return "buyer";
    case "funds":
      return "funds";
    case "admin":
      return "admin";
    case "settings":
      return "settings";
    default:
      return "dashboard";
  }
}

function NavList({ active, showAdmin, onNavigate }) {
  const items = [
    ["dashboard", "#/", "Dashboard", ""],
    ["register", "#/register", "Register", "public"],
    ["seller", "#/seller", "Seller console", ""],
    ["buyer", "#/buyer", "Buyer console", ""],
    ["funds", "#/funds", "My Funds", ""],
    ...(showAdmin ? [["admin", "#/admin", "Owner tools", ""]] : []),
    ["settings", "#/settings", "Settings", ""],
  ];
  return (
    <nav className="navlist">
      {items.map(([key, href, label, tag]) => (
        <a
          key={key}
          href={href}
          className={active === key ? "active" : ""}
          aria-current={active === key ? "page" : undefined}
          onClick={onNavigate}
        >
          {ICONS[key]}
          {label}
          {tag && <small>{tag}</small>}
        </a>
      ))}
    </nav>
  );
}

function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind || ""}`} role="status">
          <b>{t.title}</b>
          {t.body}
          <div className="txhash">
            {t.hash && (
              <a href={explorerTxUrl(t.hash)} target="_blank" rel="noreferrer">
                Transaction {String(t.hash).slice(0, 10)}… ↗
              </a>
            )}{" "}
            <button type="button" className="textbtn" onClick={() => dismissToast(t.id)}>
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function App() {
  const store = useStore();
  const { account, setChooserOpen, overview, contractAddr, isOverride } = store;
  const [route, setRoute] = useState(parseRoute);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onHash = () => {
      setRoute(parseRoute());
      setDrawerOpen(false);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const isOwner =
    account && overview.data && account.toLowerCase() === String(overview.data.owner).toLowerCase();
  const active = activeFor(route);
  const pageKey = `${contractAddr}|${account || ""}|${route.page}|${route.id || ""}`;

  let page = null;
  switch (route.page) {
    case "dashboard":
      page = <Dashboard />;
      break;
    case "register":
      page = <Register />;
      break;
    case "policy":
      page = <PolicyDetail id={route.id} />;
      break;
    case "purchase":
      page = <PurchaseDetail id={route.id} />;
      break;
    case "claim":
      page = <ClaimDetail id={route.id} />;
      break;
    case "seller":
      page = <Seller />;
      break;
    case "buyer":
      page = <Buyer />;
      break;
    case "funds":
      page = <Funds />;
      break;
    case "admin":
      page = <Admin />;
      break;
    case "settings":
      page = <Settings />;
      break;
    default:
      page = <Dashboard />;
  }

  return (
    <>
      <header className="appbar">
        <button
          type="button"
          className="burger"
          aria-label="Open menu"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <span className="logo sm">§</span>
        <div>
          <div className="brand" style={{ fontSize: 17 }}>
            Warranty<em>Court</em>
          </div>
        </div>
      </header>

      <div className={`scrim ${drawerOpen ? "open" : ""}`} onClick={() => setDrawerOpen(false)}></div>
      <aside className={`drawer ${drawerOpen ? "open" : ""}`} aria-hidden={!drawerOpen}>
        <div className="drawerhead">
          <span className="logo">§</span>
          <div>
            <div className="brand">
              Warranty<em>Court</em>
            </div>
            <div className="sub">Warranty claims, settled in the open</div>
          </div>
          <button type="button" className="closex" aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
            ✕
          </button>
        </div>
        <NavList active={active} showAdmin={!!isOwner} onNavigate={() => setDrawerOpen(false)} />
        <div className="drawerfoot">
          Bradbury testnet · GEN is test money with no real-world value. Every page reads live from the
          contract.
        </div>
      </aside>

      <div className="shell">
        <aside className="rail">
          <div className="drawerhead">
            <span className="logo">§</span>
            <div>
              <div className="brand">
                Warranty<em>Court</em>
              </div>
              <div className="sub">Warranty claims, settled in the open</div>
            </div>
          </div>
          <NavList active={active} showAdmin={!!isOwner} />
          <div className="railfoot">
            Bradbury testnet · GEN is test money with no real-world value. Every page reads live from the
            contract.
          </div>
        </aside>

        <main className="content">
          <div className="walletrow">
            {account ? (
              <span className="pill">
                <span className="dot"></span>
                {account.slice(0, 6)}…{account.slice(-4)} · Bradbury
              </span>
            ) : (
              <>
                <span className="pill dim">Not connected — reading only</span>
                <button type="button" className="connectbtn" onClick={() => setChooserOpen(true)}>
                  Connect wallet
                </button>
              </>
            )}
          </div>

          {overview.data && overview.data.paused && (
            <div className="banner paused" role="status">
              {PAUSED_BANNER_TEXT}
            </div>
          )}
          {isOverride && (
            <div className="banner override" role="status">
              {OVERRIDE_BANNER_TEXT}{" "}
              <a href="#/settings">Reset it in Settings</a>.
            </div>
          )}

          <div className="pagewrap" key={pageKey}>
            {page}
          </div>

          <p className="foot">
            WarrantyCourt — every number on these pages is read from the contract on the GenLayer Bradbury
            testnet. GEN here is test money with no real-world value.
          </p>
        </main>
      </div>

      <WalletChooser />
      <Toasts />
    </>
  );
}
