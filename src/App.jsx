import { useState, useEffect, useCallback } from "react";

// ── API ──────────────────────────────────────────────────────────────────────
const API = "https://web-production-0b506.up.railway.app";

function api(path, opts = {}) {
  const token = localStorage.getItem("rms_token");
  return fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...opts,
  }).then(async (r) => {
    if (r.status === 401) { localStorage.removeItem("rms_token"); window.location.reload(); }
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.detail || "Request failed");
    return data;
  });
}

// ── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const icons = {
    dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
    vehicle: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z",
    customer: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
    rental: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
    return: "M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z",
    payment: "M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z",
    report: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z",
    settings: "M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z",
    logout: "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
    plus: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
    edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
    close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
    search: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
    check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
    alert: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
    car: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z",
    money: "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d={icons[name] || icons.alert} />
    </svg>
  );
};

// ── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080c14;
    --surface: #0e1420;
    --surface2: #151d2e;
    --surface3: #1c2640;
    --border: #1e2d45;
    --border2: #243450;
    --accent: #2563eb;
    --accent-light: #3b82f6;
    --accent-glow: rgba(37,99,235,0.15);
    --silver: #94a3b8;
    --silver-light: #cbd5e1;
    --text: #e2e8f0;
    --text-dim: #64748b;
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
    --font-display: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --font-mono: 'DM Mono', monospace;
    --radius: 8px;
    --radius-lg: 12px;
    --shadow: 0 4px 24px rgba(0,0,0,0.4);
    --shadow-accent: 0 0 24px rgba(37,99,235,0.2);
  }

  html, body, #root { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font-body); font-size: 14px; line-height: 1.5; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: var(--surface); }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

  /* Layout */
  .app { display: flex; height: 100vh; overflow: hidden; }
  .sidebar { width: 220px; min-width: 220px; background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; z-index: 10; }
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .topbar { height: 56px; min-height: 56px; background: var(--surface); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 24px; gap: 12px; }
  .content { flex: 1; overflow-y: auto; padding: 24px; }

  /* Sidebar */
  .sidebar-logo { padding: 20px 16px 16px; border-bottom: 1px solid var(--border); }
  .logo-text { font-family: var(--font-display); font-weight: 800; font-size: 13px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text); line-height: 1.3; }
  .logo-text span { color: var(--silver); font-weight: 400; }
  .sidebar-nav { flex: 1; padding: 12px 8px; overflow-y: auto; }
  .nav-section { margin-bottom: 4px; }
  .nav-label { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-dim); padding: 8px 10px 4px; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: var(--radius); cursor: pointer; color: var(--silver); font-size: 13px; font-weight: 400; transition: all 0.15s; border: 1px solid transparent; margin-bottom: 1px; }
  .nav-item:hover { background: var(--surface2); color: var(--text); }
  .nav-item.active { background: var(--accent-glow); color: var(--accent-light); border-color: rgba(37,99,235,0.3); }
  .nav-item.active svg { color: var(--accent-light); }
  .sidebar-footer { padding: 12px 8px; border-top: 1px solid var(--border); }
  .user-badge { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: var(--radius); background: var(--surface2); }
  .user-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 700; font-size: 11px; color: white; }
  .user-info { flex: 1; min-width: 0; }
  .user-name { font-size: 12px; font-weight: 500; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-role { font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.08em; }

  /* Topbar */
  .page-title { font-family: var(--font-display); font-weight: 700; font-size: 16px; letter-spacing: 0.02em; flex: 1; }
  .topbar-actions { display: flex; align-items: center; gap: 8px; }

  /* Cards */
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; }
  .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .card-title { font-family: var(--font-display); font-weight: 600; font-size: 13px; letter-spacing: 0.04em; text-transform: uppercase; color: var(--silver); }

  /* Stat cards */
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; position: relative; overflow: hidden; }
  .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--accent); opacity: 0.6; }
  .stat-card.green::before { background: var(--success); }
  .stat-card.yellow::before { background: var(--warning); }
  .stat-card.red::before { background: var(--danger); }
  .stat-label { font-size: 11px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-dim); margin-bottom: 8px; }
  .stat-value { font-family: var(--font-display); font-weight: 800; font-size: 28px; color: var(--text); line-height: 1; margin-bottom: 4px; }
  .stat-sub { font-size: 11px; color: var(--text-dim); }

  /* Table */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  thead tr { border-bottom: 1px solid var(--border2); }
  th { font-family: var(--font-mono); font-size: 10px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim); padding: 10px 12px; text-align: left; white-space: nowrap; }
  td { padding: 11px 12px; border-bottom: 1px solid var(--border); color: var(--text); font-size: 13px; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tbody tr { transition: background 0.1s; }
  tbody tr:hover { background: var(--surface2); }
  .mono { font-family: var(--font-mono); font-size: 12px; }

  /* Badges */
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 100px; font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
  .badge-green { background: rgba(16,185,129,0.12); color: var(--success); border: 1px solid rgba(16,185,129,0.2); }
  .badge-blue { background: rgba(59,130,246,0.12); color: var(--accent-light); border: 1px solid rgba(59,130,246,0.2); }
  .badge-yellow { background: rgba(245,158,11,0.12); color: var(--warning); border: 1px solid rgba(245,158,11,0.2); }
  .badge-red { background: rgba(239,68,68,0.12); color: var(--danger); border: 1px solid rgba(239,68,68,0.2); }
  .badge-gray { background: rgba(100,116,139,0.12); color: var(--silver); border: 1px solid rgba(100,116,139,0.2); }

  /* Buttons */
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: var(--radius); font-family: var(--font-body); font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid transparent; transition: all 0.15s; white-space: nowrap; }
  .btn-primary { background: var(--accent); color: white; border-color: var(--accent); }
  .btn-primary:hover { background: var(--accent-light); box-shadow: var(--shadow-accent); }
  .btn-ghost { background: transparent; color: var(--silver); border-color: var(--border2); }
  .btn-ghost:hover { background: var(--surface2); color: var(--text); }
  .btn-danger { background: transparent; color: var(--danger); border-color: rgba(239,68,68,0.3); }
  .btn-danger:hover { background: rgba(239,68,68,0.1); }
  .btn-sm { padding: 4px 10px; font-size: 12px; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Forms */
  .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .form-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .form-full { grid-column: 1 / -1; }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .field label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-dim); }
  .field input, .field select, .field textarea { background: var(--surface2); border: 1px solid var(--border2); border-radius: var(--radius); padding: 8px 12px; color: var(--text); font-family: var(--font-body); font-size: 13px; outline: none; transition: border-color 0.15s; width: 100%; }
  .field input:focus, .field select:focus, .field textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-glow); }
  .field select option { background: var(--surface2); }
  .field textarea { resize: vertical; min-height: 80px; }

  /* Modal */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .modal { background: var(--surface); border: 1px solid var(--border2); border-radius: var(--radius-lg); width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow); }
  .modal-lg { max-width: 800px; }
  .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; margin-bottom: 20px; }
  .modal-title { font-family: var(--font-display); font-weight: 700; font-size: 16px; }
  .modal-body { padding: 0 24px 24px; }
  .modal-footer { display: flex; gap: 10px; justify-content: flex-end; padding-top: 20px; border-top: 1px solid var(--border); margin-top: 20px; }

  /* Login */
  .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); position: relative; overflow: hidden; }
  .login-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 20% 50%, rgba(37,99,235,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.04) 0%, transparent 50%); }
  .login-card { position: relative; z-index: 1; width: 100%; max-width: 400px; padding: 40px; background: var(--surface); border: 1px solid var(--border2); border-radius: 16px; box-shadow: 0 24px 64px rgba(0,0,0,0.5); }
  .login-logo { margin-bottom: 32px; }
  .login-brand { font-family: var(--font-display); font-weight: 800; font-size: 20px; letter-spacing: 0.02em; color: var(--text); }
  .login-brand span { color: var(--silver); font-weight: 400; }
  .login-sub { font-size: 12px; color: var(--text-dim); margin-top: 4px; letter-spacing: 0.04em; }
  .login-title { font-family: var(--font-display); font-weight: 700; font-size: 22px; margin-bottom: 24px; color: var(--text); }
  .login-fields { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
  .error-msg { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: var(--radius); color: var(--danger); font-size: 13px; margin-bottom: 16px; }

  /* Search */
  .search-wrap { position: relative; }
  .search-wrap svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-dim); pointer-events: none; }
  .search-wrap input { padding-left: 34px; }

  /* Empty state */
  .empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; color: var(--text-dim); gap: 12px; }
  .empty-icon { opacity: 0.3; }
  .empty p { font-size: 13px; }

  /* Page header */
  .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .page-heading { font-family: var(--font-display); font-weight: 700; font-size: 20px; }
  .page-sub { font-size: 12px; color: var(--text-dim); margin-top: 2px; }

  /* Actions cell */
  .actions { display: flex; gap: 6px; }

  /* Toast */
  .toast-wrap { position: fixed; bottom: 24px; right: 24px; z-index: 200; display: flex; flex-direction: column; gap: 8px; }
  .toast { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: var(--radius); font-size: 13px; font-weight: 500; box-shadow: var(--shadow); min-width: 240px; animation: slideIn 0.2s ease; }
  .toast-success { background: var(--surface2); border: 1px solid rgba(16,185,129,0.3); color: var(--success); }
  .toast-error { background: var(--surface2); border: 1px solid rgba(239,68,68,0.3); color: var(--danger); }
  @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

  /* Dashboard grid */
  .dash-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }

  /* Misc */
  .divider { height: 1px; background: var(--border); margin: 16px 0; }
  .text-dim { color: var(--text-dim); }
  .text-success { color: var(--success); }
  .text-danger { color: var(--danger); }
  .text-accent { color: var(--accent-light); }
  .text-mono { font-family: var(--font-mono); font-size: 12px; }
  .flex { display: flex; }
  .flex-center { display: flex; align-items: center; }
  .gap-8 { gap: 8px; }
  .gap-12 { gap: 12px; }
  .mt-16 { margin-top: 16px; }
  .mb-16 { margin-bottom: 16px; }
  .fw-bold { font-weight: 600; }
  .amount { font-family: var(--font-mono); font-size: 13px; }
`;

// ── TOAST ────────────────────────────────────────────────────────────────────
let _toastId = 0;
let _setToasts = null;
function toast(msg, type = "success") {
  const id = ++_toastId;
  _setToasts?.((t) => [...t, { id, msg, type }]);
  setTimeout(() => _setToasts?.((t) => t.filter((x) => x.id !== id)), 3500);
}

function Toasts() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => { _setToasts = setToasts; }, []);
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <Icon name={t.type === "success" ? "check" : "alert"} size={14} />
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
      localStorage.setItem("rms_token", data.access_token);
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-logo">
          <div className="login-brand">Business <span>easy</span> Solutions</div>
          <div className="login-sub">Rental Management System</div>
        </div>
        <div className="login-title">Sign In</div>
        {error && <div className="error-msg"><Icon name="alert" size={14} />{error}</div>}
        <form onSubmit={submit}>
          <div className="login-fields">
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard() {
  const [stats, setStats] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api("/api/vehicles/?active_only=false&available_only=false"),
      api("/api/rentals/"),
      api("/api/customers/"),
    ]).then(([vehicles, rentals, customers]) => {
      const active = rentals.filter(r => r.status === "active");
      const available = vehicles.filter(v => v.status === "available");
      const totalRevenue = rentals.reduce((s, r) => s + parseFloat(r.total_amount || 0), 0);
      setStats({ vehicles: vehicles.length, available: available.length, activeRentals: active.length, customers: customers.length, totalRevenue });
      setRentals(rentals.slice(0, 8));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty"><p>Loading dashboard…</p></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-heading">Dashboard</div>
          <div className="page-sub">Overview of your rental operations</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-label">Total Vehicles</div>
          <div className="stat-value">{stats?.vehicles ?? 0}</div>
          <div className="stat-sub">{stats?.available ?? 0} available</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Active Rentals</div>
          <div className="stat-value">{stats?.activeRentals ?? 0}</div>
          <div className="stat-sub">Currently rented out</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Customers</div>
          <div className="stat-value">{stats?.customers ?? 0}</div>
          <div className="stat-sub">Registered clients</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">€{(stats?.totalRevenue ?? 0).toLocaleString("el-CY", { maximumFractionDigits: 0 })}</div>
          <div className="stat-sub">All time invoiced</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Recent Rentals</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Vehicle</th>
                <th>From</th>
                <th>Until</th>
                <th>Days</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rentals.length === 0 && (
                <tr><td colSpan={7}><div className="empty"><p>No rentals yet</p></div></td></tr>
              )}
              {rentals.map(r => (
                <tr key={r.id}>
                  <td><span className="mono text-accent">{r.invoice_no}</span></td>
                  <td>Vehicle #{r.vehicle_id}</td>
                  <td className="mono">{r.from_date}</td>
                  <td className="mono">{r.until_date}</td>
                  <td>{r.num_days}</td>
                  <td><span className="amount">€{parseFloat(r.total_amount).toFixed(2)}</span></td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    available: "badge-green", active: "badge-blue", rented: "badge-yellow",
    returned: "badge-gray", completed: "badge-gray", terminated: "badge-red",
    normal: "badge-green", early: "badge-yellow",
  };
  return <span className={`badge ${map[status] || "badge-gray"}`}>{status}</span>;
}

// ── VEHICLES ─────────────────────────────────────────────────────────────────
function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | 'add' | vehicle obj

  const load = useCallback(() => {
    api("/api/vehicles/?active_only=false&available_only=false")
      .then(setVehicles).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = vehicles.filter(v =>
    [v.reg_no, v.brand, v.model, v.vehicle_type].some(f => f?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-heading">Vehicles</div>
          <div className="page-sub">{vehicles.length} registered vehicles</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal("add")}>
          <Icon name="plus" size={14} /> Add Vehicle
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-wrap" style={{ width: 260 }}>
            <Icon name="search" size={14} />
            <input className="field input" placeholder="Search reg no, brand, model…" value={search} onChange={e => setSearch(e.target.value)} style={{ background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: "var(--radius)", padding: "7px 12px 7px 34px", color: "var(--text)", width: "100%", outline: "none" }} />
          </div>
        </div>
        <div className="table-wrap">
          {loading ? <div className="empty"><p>Loading…</p></div> : (
            <table>
              <thead>
                <tr>
                  <th>Reg No</th><th>Type</th><th>Brand</th><th>Model</th>
                  <th>GPS</th><th>KM</th><th>Daily</th><th>Monthly</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={10}><div className="empty"><p>No vehicles found</p></div></td></tr>}
                {filtered.map(v => (
                  <tr key={v.id}>
                    <td><span className="mono text-accent fw-bold">{v.reg_no}</span></td>
                    <td><span className="badge badge-gray">{v.vehicle_type}</span></td>
                    <td>{v.brand}</td>
                    <td>{v.model}</td>
                    <td className="mono text-dim">{v.gps_no || "—"}</td>
                    <td className="mono">{v.current_km?.toLocaleString()}</td>
                    <td className="amount">€{parseFloat(v.daily_rate || 0).toFixed(2)}</td>
                    <td className="amount">€{parseFloat(v.monthly_rate || 0).toFixed(2)}</td>
                    <td><StatusBadge status={v.status} /></td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => setModal(v)}>
                          <Icon name="edit" size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <VehicleModal
          vehicle={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); toast(modal === "add" ? "Vehicle added!" : "Vehicle updated!"); }}
        />
      )}
    </div>
  );
}

function VehicleModal({ vehicle, onClose, onSaved }) {
  const [form, setForm] = useState({
    reg_no: vehicle?.reg_no || "",
    vehicle_type: vehicle?.vehicle_type || "car",
    brand: vehicle?.brand || "",
    model: vehicle?.model || "",
    gps_no: vehicle?.gps_no || "",
    daily_rate: vehicle?.daily_rate || "",
    monthly_rate: vehicle?.monthly_rate || "",
    current_km: vehicle?.current_km || 0,
    notes: vehicle?.notes || "",
    is_active: vehicle?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      const body = { ...form, daily_rate: parseFloat(form.daily_rate), monthly_rate: parseFloat(form.monthly_rate), current_km: parseInt(form.current_km) };
      if (vehicle) {
        await api(`/api/vehicles/${vehicle.id}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await api("/api/vehicles/", { method: "POST", body: JSON.stringify(body) });
      }
      onSaved();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{vehicle ? "Edit Vehicle" : "Add Vehicle"}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon name="close" size={14} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="field">
              <label>Reg No *</label>
              <input value={form.reg_no} onChange={f("reg_no")} placeholder="ABC-1234" />
            </div>
            <div className="field">
              <label>Type *</label>
              <select value={form.vehicle_type} onChange={f("vehicle_type")}>
                <option value="car">Car</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="van">Van</option>
                <option value="truck">Truck</option>
                <option value="bus">Bus</option>
              </select>
            </div>
            <div className="field">
              <label>Brand *</label>
              <input value={form.brand} onChange={f("brand")} placeholder="Toyota" />
            </div>
            <div className="field">
              <label>Model *</label>
              <input value={form.model} onChange={f("model")} placeholder="Corolla" />
            </div>
            <div className="field">
              <label>GPS No</label>
              <input value={form.gps_no} onChange={f("gps_no")} placeholder="GPS-001" />
            </div>
            <div className="field">
              <label>Current KM</label>
              <input type="number" value={form.current_km} onChange={f("current_km")} />
            </div>
            <div className="field">
              <label>Daily Rate (€) *</label>
              <input type="number" step="0.01" value={form.daily_rate} onChange={f("daily_rate")} placeholder="45.00" />
            </div>
            <div className="field">
              <label>Monthly Rate (€) *</label>
              <input type="number" step="0.01" value={form.monthly_rate} onChange={f("monthly_rate")} placeholder="900.00" />
            </div>
            <div className="field form-full">
              <label>Notes</label>
              <textarea value={form.notes} onChange={f("notes")} placeholder="Additional notes…" />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? "Saving…" : vehicle ? "Update Vehicle" : "Add Vehicle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CUSTOMERS ────────────────────────────────────────────────────────────────
function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);

  const load = useCallback(() => {
    api("/api/customers/").then(setCustomers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = customers.filter(c =>
    [c.customer_code, c.full_name, c.email, c.phone].some(f => f?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-heading">Customers</div>
          <div className="page-sub">{customers.length} registered customers</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal("add")}>
          <Icon name="plus" size={14} /> Add Customer
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-wrap" style={{ width: 260 }}>
            <Icon name="search" size={14} />
            <input placeholder="Search code, name, email…" value={search} onChange={e => setSearch(e.target.value)} style={{ background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: "var(--radius)", padding: "7px 12px 7px 34px", color: "var(--text)", width: "100%", outline: "none" }} />
          </div>
        </div>
        <div className="table-wrap">
          {loading ? <div className="empty"><p>Loading…</p></div> : (
            <table>
              <thead>
                <tr><th>Code</th><th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={7}><div className="empty"><p>No customers found</p></div></td></tr>}
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td><span className="mono text-accent fw-bold">{c.customer_code}</span></td>
                    <td className="fw-bold">{c.full_name}</td>
                    <td className="mono">{c.phone}</td>
                    <td className="text-dim">{c.email || "—"}</td>
                    <td className="text-dim">{c.address || "—"}</td>
                    <td><span className={`badge ${c.is_active ? "badge-green" : "badge-red"}`}>{c.is_active ? "Active" : "Inactive"}</span></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal(c)}>
                        <Icon name="edit" size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <CustomerModal
          customer={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); toast(modal === "add" ? "Customer added!" : "Customer updated!"); }}
        />
      )}
    </div>
  );
}

function CustomerModal({ customer, onClose, onSaved }) {
  const [form, setForm] = useState({
    customer_code: customer?.customer_code || "",
    full_name: customer?.full_name || "",
    phone: customer?.phone || "",
    email: customer?.email || "",
    address: customer?.address || "",
    notes: customer?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      if (customer) {
        await api(`/api/customers/${customer.id}`, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await api("/api/customers/", { method: "POST", body: JSON.stringify(form) });
      }
      onSaved();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{customer ? "Edit Customer" : "Add Customer"}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon name="close" size={14} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="field">
              <label>Customer Code *</label>
              <input value={form.customer_code} onChange={f("customer_code")} placeholder="CUST-001" />
            </div>
            <div className="field">
              <label>Full Name *</label>
              <input value={form.full_name} onChange={f("full_name")} placeholder="John Doe" />
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={form.phone} onChange={f("phone")} placeholder="+357 99 123456" />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={f("email")} placeholder="john@example.com" />
            </div>
            <div className="field form-full">
              <label>Address</label>
              <input value={form.address} onChange={f("address")} placeholder="123 Main St, Nicosia" />
            </div>
            <div className="field form-full">
              <label>Notes</label>
              <textarea value={form.notes} onChange={f("notes")} placeholder="Additional notes…" />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? "Saving…" : customer ? "Update Customer" : "Add Customer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── RENTALS ──────────────────────────────────────────────────────────────────
function Rentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  const load = useCallback(() => {
    api("/api/rentals/").then(setRentals).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-heading">Rentals</div>
          <div className="page-sub">{rentals.length} total rentals</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <Icon name="plus" size={14} /> New Rental
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? <div className="empty"><p>Loading…</p></div> : (
            <table>
              <thead>
                <tr>
                  <th>Invoice</th><th>Customer</th><th>Vehicle</th>
                  <th>From</th><th>Until</th><th>Days</th>
                  <th>Total</th><th>Balance</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rentals.length === 0 && <tr><td colSpan={9}><div className="empty"><p>No rentals yet</p></div></td></tr>}
                {rentals.map(r => (
                  <tr key={r.id}>
                    <td><span className="mono text-accent fw-bold">{r.invoice_no}</span></td>
                    <td>#{r.customer_id}</td>
                    <td>#{r.vehicle_id}</td>
                    <td className="mono">{r.from_date}</td>
                    <td className="mono">{r.until_date}</td>
                    <td>{r.num_days}</td>
                    <td><span className="amount">€{parseFloat(r.total_amount).toFixed(2)}</span></td>
                    <td><span className={`amount ${parseFloat(r.balance) > 0 ? "text-danger" : "text-success"}`}>€{parseFloat(r.balance).toFixed(2)}</span></td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <RentalModal
          onClose={() => setModal(false)}
          onSaved={() => { setModal(false); load(); toast("Rental created!"); }}
        />
      )}
    </div>
  );
}

function RentalModal({ onClose, onSaved }) {
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    vehicle_id: "", customer_id: "", from_date: "", until_date: "",
    rate_type: "daily", deposit: 0, down_payment: 0, down_payment_method: "", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    api("/api/vehicles/?active_only=true&available_only=true").then(setVehicles).catch(() => {});
    api("/api/customers/").then(setCustomers).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        ...form,
        vehicle_id: parseInt(form.vehicle_id),
        customer_id: parseInt(form.customer_id),
        deposit: parseFloat(form.deposit || 0),
        down_payment: parseFloat(form.down_payment || 0),
      };
      await api("/api/rentals/", { method: "POST", body: JSON.stringify(body) });
      onSaved();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">New Rental</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon name="close" size={14} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="field">
              <label>Vehicle *</label>
              <select value={form.vehicle_id} onChange={f("vehicle_id")}>
                <option value="">Select vehicle…</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.reg_no} — {v.brand} {v.model}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Customer *</label>
              <select value={form.customer_id} onChange={f("customer_id")}>
                <option value="">Select customer…</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.customer_code} — {c.full_name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>From Date *</label>
              <input type="date" value={form.from_date} onChange={f("from_date")} />
            </div>
            <div className="field">
              <label>Until Date *</label>
              <input type="date" value={form.until_date} onChange={f("until_date")} />
            </div>
            <div className="field">
              <label>Rate Type</label>
              <select value={form.rate_type} onChange={f("rate_type")}>
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="field">
              <label>Deposit (€)</label>
              <input type="number" step="0.01" value={form.deposit} onChange={f("deposit")} />
            </div>
            <div className="field">
              <label>Down Payment (€)</label>
              <input type="number" step="0.01" value={form.down_payment} onChange={f("down_payment")} />
            </div>
            <div className="field">
              <label>Payment Method</label>
              <select value={form.down_payment_method} onChange={f("down_payment_method")}>
                <option value="">None</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Bank Transfer</option>
              </select>
            </div>
            <div className="field form-full">
              <label>Notes</label>
              <textarea value={form.notes} onChange={f("notes")} placeholder="Additional notes…" />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? "Creating…" : "Create Rental"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── RETURNS ──────────────────────────────────────────────────────────────────
function Returns() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = useCallback(() => {
    api("/api/rentals/").then(r => {
      setRentals(r.filter(x => x.status === "active"));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-heading">Returns</div>
          <div className="page-sub">Process vehicle returns</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Active Rentals — Select to Process Return</div>
        </div>
        <div className="table-wrap">
          {loading ? <div className="empty"><p>Loading…</p></div> : (
            <table>
              <thead>
                <tr><th>Invoice</th><th>Vehicle</th><th>Customer</th><th>From</th><th>Until</th><th>Balance</th><th></th></tr>
              </thead>
              <tbody>
                {rentals.length === 0 && <tr><td colSpan={7}><div className="empty"><p>No active rentals</p></div></td></tr>}
                {rentals.map(r => (
                  <tr key={r.id}>
                    <td><span className="mono text-accent">{r.invoice_no}</span></td>
                    <td>Vehicle #{r.vehicle_id}</td>
                    <td>Customer #{r.customer_id}</td>
                    <td className="mono">{r.from_date}</td>
                    <td className="mono">{r.until_date}</td>
                    <td><span className="amount text-danger">€{parseFloat(r.balance).toFixed(2)}</span></td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => setModal(r)}>
                        <Icon name="return" size={12} /> Process Return
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <ReturnModal
          rental={modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); toast("Return processed!"); }}
        />
      )}
    </div>
  );
}

function ReturnModal({ rental, onClose, onSaved }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    rental_id: rental.id,
    termination_date: today,
    termination_type: "normal",
    termination_reason: "Rental completed",
    returned_km: "",
    deposit_returned: 0,
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      await api("/api/rentals/returns", {
        method: "POST",
        body: JSON.stringify({ ...form, returned_km: parseInt(form.returned_km || 0), deposit_returned: parseFloat(form.deposit_returned || 0) }),
      });
      onSaved();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Process Return — {rental.invoice_no}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon name="close" size={14} /></button>
        </div>
        <div className="modal-body">
          <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "12px 16px", marginBottom: 20, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            <div><div className="text-dim" style={{ fontSize: 11, marginBottom: 4 }}>INVOICE</div><div className="mono text-accent">{rental.invoice_no}</div></div>
            <div><div className="text-dim" style={{ fontSize: 11, marginBottom: 4 }}>VEHICLE</div><div>#{rental.vehicle_id}</div></div>
            <div><div className="text-dim" style={{ fontSize: 11, marginBottom: 4 }}>BALANCE DUE</div><div className="amount text-danger">€{parseFloat(rental.balance).toFixed(2)}</div></div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label>Return Date *</label>
              <input type="date" value={form.termination_date} onChange={f("termination_date")} />
            </div>
            <div className="field">
              <label>Termination Type</label>
              <select value={form.termination_type} onChange={f("termination_type")}>
                <option value="normal">Normal</option>
                <option value="early">Early</option>
                <option value="extended">Extended</option>
              </select>
            </div>
            <div className="field">
              <label>Returned KM</label>
              <input type="number" value={form.returned_km} onChange={f("returned_km")} placeholder="15250" />
            </div>
            <div className="field">
              <label>Deposit Returned (€)</label>
              <input type="number" step="0.01" value={form.deposit_returned} onChange={f("deposit_returned")} />
            </div>
            <div className="field form-full">
              <label>Reason</label>
              <input value={form.termination_reason} onChange={f("termination_reason")} />
            </div>
            <div className="field form-full">
              <label>Notes</label>
              <textarea value={form.notes} onChange={f("notes")} placeholder="Condition of vehicle, any damages…" />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? "Processing…" : "Confirm Return"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PAYMENTS ─────────────────────────────────────────────────────────────────
function Payments() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = useCallback(() => {
    api("/api/rentals/").then(r => {
      setRentals(r.filter(x => parseFloat(x.balance) > 0));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-heading">Payments</div>
          <div className="page-sub">Record payments against rentals with outstanding balance</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Outstanding Balances</div>
        </div>
        <div className="table-wrap">
          {loading ? <div className="empty"><p>Loading…</p></div> : (
            <table>
              <thead>
                <tr><th>Invoice</th><th>Customer</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {rentals.length === 0 && <tr><td colSpan={7}><div className="empty"><p>No outstanding balances</p></div></td></tr>}
                {rentals.map(r => (
                  <tr key={r.id}>
                    <td><span className="mono text-accent">{r.invoice_no}</span></td>
                    <td>#{r.customer_id}</td>
                    <td><span className="amount">€{parseFloat(r.total_amount).toFixed(2)}</span></td>
                    <td><span className="amount text-success">€{(parseFloat(r.total_amount) - parseFloat(r.balance)).toFixed(2)}</span></td>
                    <td><span className="amount text-danger fw-bold">€{parseFloat(r.balance).toFixed(2)}</span></td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => setModal(r)}>
                        <Icon name="payment" size={12} /> Record Payment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <PaymentModal
          rental={modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); toast("Payment recorded!"); }}
        />
      )}
    </div>
  );
}

function PaymentModal({ rental, onClose, onSaved }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    customer_id: rental.customer_id,
    rental_id: rental.id,
    payment_date: today,
    amount: parseFloat(rental.balance).toFixed(2),
    method: "cash",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      await api("/api/rentals/payments", {
        method: "POST",
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      });
      onSaved();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Record Payment — {rental.invoice_no}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon name="close" size={14} /></button>
        </div>
        <div className="modal-body">
          <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "12px 16px", marginBottom: 20, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            <div><div className="text-dim" style={{ fontSize: 11, marginBottom: 4 }}>INVOICE</div><div className="mono text-accent">{rental.invoice_no}</div></div>
            <div><div className="text-dim" style={{ fontSize: 11, marginBottom: 4 }}>TOTAL</div><div className="amount">€{parseFloat(rental.total_amount).toFixed(2)}</div></div>
            <div><div className="text-dim" style={{ fontSize: 11, marginBottom: 4 }}>BALANCE DUE</div><div className="amount text-danger fw-bold">€{parseFloat(rental.balance).toFixed(2)}</div></div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label>Payment Date *</label>
              <input type="date" value={form.payment_date} onChange={f("payment_date")} />
            </div>
            <div className="field">
              <label>Amount (€) *</label>
              <input type="number" step="0.01" value={form.amount} onChange={f("amount")} />
            </div>
            <div className="field form-full">
              <label>Method *</label>
              <select value={form.method} onChange={f("method")}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div className="field form-full">
              <label>Notes</label>
              <textarea value={form.notes} onChange={f("notes")} placeholder="Payment reference, notes…" />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Record Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── REPORTS ──────────────────────────────────────────────────────────────────
function Reports() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateModal, setDateModal] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    api("/api/customers/").then(setCustomers).catch(() => {});
  }, []);

  const openPdf = async (url) => {
    const token = localStorage.getItem("rms_token");
    try {
      const res = await fetch(`${API}${url}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to generate PDF");
      const blob = await res.blob();
      window.open(URL.createObjectURL(blob), "_blank");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const openPdfWithDates = async () => {
    if (!fromDate || !toDate) return;
    await openPdf(`${dateModal.url}?from_date=${fromDate}&to_date=${toDate}`);
    setDateModal(null);
  };

  const fetchReport = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const data = await api(`/api/reports/customer-balance/${selected}`);
      setReport(data);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ── Date Modal ── */}
      {dateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="card" style={{ width: 400, padding: 24 }}>
            <div className="card-title" style={{ marginBottom: 16 }}>{dateModal.label}</div>
            <div className="field">
              <label>From Date</label>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div className="field">
              <label>To Date</label>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button className="btn btn-primary" onClick={openPdfWithDates} disabled={!fromDate || !toDate}>Generate PDF</button>
              <button className="btn btn-secondary" onClick={() => setDateModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <div className="page-heading">Reports</div>
          <div className="page-sub">Financial reports and customer statements</div>
        </div>
      </div>

      {/* ── PDF Reports ── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div className="card-title">PDF Reports</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => openPdf("/api/reports/fleet-status/pdf")}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px" }}>
            🚗 Fleet Status
          </button>
          <button className="btn btn-secondary" onClick={() => { setDateModal({ url: "/api/reports/revenue/pdf", label: "Revenue Report" }); setFromDate(""); setToDate(""); }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px" }}>
            📈 Revenue Report
          </button>
          <button className="btn btn-secondary" onClick={() => { setDateModal({ url: "/api/reports/sales/pdf", label: "Sales Overview" }); setFromDate(""); setToDate(""); }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px" }}>
            🧾 Sales Overview
          </button>
          <button className="btn btn-secondary" onClick={() => openPdf("/api/reports/all-balances/pdf")}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px" }}>
            📊 All Balances
          </button>
        </div>
      </div>

      {/* ── Customer Balance Report ── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div className="card-title">Customer Balance Report</div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Select Customer</label>
            <select value={selected} onChange={e => setSelected(e.target.value)}>
              <option value="">Choose a customer…</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.customer_code} — {c.full_name}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={fetchReport} disabled={!selected || loading}>
            {loading ? "Loading…" : "Generate Report"}
          </button>
          {selected && (
            <button className="btn btn-secondary" onClick={() => openPdf(`/api/reports/customer-history/${selected}/pdf`)}>
              📄 PDF Statement
            </button>
          )}
        </div>

        {report && (
          <div style={{ marginTop: 24 }}>
            <div className="divider" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 16 }}>
              <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
                <div className="stat-label">Customer</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, marginTop: 4 }}>{report.full_name}</div>
                <div className="mono text-dim" style={{ fontSize: 11, marginTop: 4 }}>{report.customer_code}</div>
              </div>
              <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
                <div className="stat-label">Total Invoiced</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, marginTop: 4 }}>€{parseFloat(report.total_invoiced || 0).toFixed(2)}</div>
                <div className="text-dim" style={{ fontSize: 11, marginTop: 4 }}>Gross amount</div>
              </div>
              <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
                <div className="stat-label">Total Paid</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--success)", marginTop: 4 }}>€{parseFloat(report.total_paid || 0).toFixed(2)}</div>
                <div className="text-dim" style={{ fontSize: 11, marginTop: 4 }}>Payments received</div>
              </div>
            </div>
            <div style={{ marginTop: 16, background: parseFloat(report.balance) > 0 ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)", border: `1px solid ${parseFloat(report.balance) > 0 ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`, borderRadius: "var(--radius)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div className="stat-label">Outstanding Balance</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32, color: parseFloat(report.balance) > 0 ? "var(--danger)" : "var(--success)", marginTop: 4 }}>
                  €{parseFloat(report.balance || 0).toFixed(2)}
                </div>
              </div>
              <span className={`badge ${parseFloat(report.balance) > 0 ? "badge-red" : "badge-green"}`} style={{ fontSize: 12, padding: "6px 14px" }}>
                {parseFloat(report.balance) > 0 ? "Amount Due" : "Fully Paid"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
}// ── SETTINGS ─────────────────────────────────────────────────────────────────
function Settings() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api("/api/settings/").then(data => {
      setSettings(data);
      setForm(data);
    }).catch(() => {});
  }, []);

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      await api("/api/settings/", { method: "PUT", body: JSON.stringify(form) });
      toast("Settings saved!");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="empty"><p>Loading settings…</p></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-heading">Settings</div>
          <div className="page-sub">Company and system configuration</div>
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Company Information</div></div>
        <div className="form-grid">
          <div className="field form-full">
            <label>Company Name</label>
            <input value={form.company_name || ""} onChange={f("company_name")} />
          </div>
          <div className="field">
            <label>VAT Rate (%)</label>
            <input type="number" step="0.01" value={form.vat_rate || ""} onChange={f("vat_rate")} />
          </div>
          <div className="field">
            <label>Currency</label>
            <input value={form.currency || "EUR"} onChange={f("currency")} />
          </div>
          {form.address !== undefined && (
            <div className="field form-full">
              <label>Address</label>
              <input value={form.address || ""} onChange={f("address")} />
            </div>
          )}
          {form.phone !== undefined && (
            <div className="field">
              <label>Phone</label>
              <input value={form.phone || ""} onChange={f("phone")} />
            </div>
          )}
          {form.email !== undefined && (
            <div className="field">
              <label>Email</label>
              <input value={form.email || ""} onChange={f("email")} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "vehicles", label: "Vehicles", icon: "vehicle" },
  { id: "customers", label: "Customers", icon: "customer" },
  { id: "rentals", label: "Rentals", icon: "rental" },
  { id: "returns", label: "Returns", icon: "return" },
  { id: "payments", label: "Payments", icon: "payment" },
  { id: "reports", label: "Reports", icon: "report" },
  { id: "settings", label: "Settings", icon: "settings" },
];

function Sidebar({ page, setPage, user, onLogout }) {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-text">Business <span>easy</span><br />Solutions</div>
      </div>
      <nav className="sidebar-nav">
        {NAV.map(item => (
          <div
            key={item.id}
            className={`nav-item ${page === item.id ? "active" : ""}`}
            onClick={() => setPage(item.id)}
          >
            <Icon name={item.icon} size={15} />
            {item.label}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-badge">
          <div className="user-avatar">{user?.full_name?.[0] || "A"}</div>
          <div className="user-info">
            <div className="user-name">{user?.full_name || "Admin"}</div>
            <div className="user-role">{user?.role || "admin"}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onLogout} title="Logout" style={{ padding: "4px", border: "none" }}>
            <Icon name="logout" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── APP ──────────────────────────────────────────────────────────────────────
const PAGE_TITLES = {
  dashboard: "Dashboard", vehicles: "Vehicles", customers: "Customers",
  rentals: "Rentals", returns: "Returns", payments: "Payments",
  reports: "Reports", settings: "Settings",
};

export default function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("rms_token");
    return token ? { full_name: "Admin", role: "admin" } : null;
  });
  const [page, setPage] = useState("dashboard");

  const handleLogin = (data) => setUser({ full_name: data.full_name, role: data.role });
  const handleLogout = () => { localStorage.removeItem("rms_token"); setUser(null); };

  if (!user) return (
    <>
      <style>{styles}</style>
      <Login onLogin={handleLogin} />
      <Toasts />
    </>
  );

  const pages = { dashboard: Dashboard, vehicles: Vehicles, customers: Customers, rentals: Rentals, returns: Returns, payments: Payments, reports: Reports, settings: Settings };
  const PageComponent = pages[page] || Dashboard;

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <Sidebar page={page} setPage={setPage} user={user} onLogout={handleLogout} />
        <div className="main">
          <div className="topbar">
            <div className="page-title">{PAGE_TITLES[page]}</div>
            <div className="topbar-actions">
              <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>RMS v1.0</span>
            </div>
          </div>
          <div className="content">
            <PageComponent />
          </div>
        </div>
      </div>
      <Toasts />
    </>
  );
}
