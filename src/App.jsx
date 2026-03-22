import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

const COLORS = {
  bg: "#0A0A0F",
  surface: "#13131A",
  surfaceAlt: "#1A1A24",
  border: "#252535",
  accent: "#7C5CFC",
  accentGlow: "#7C5CFC33",
  accentSoft: "#A084FD",
  green: "#22D3A5",
  greenSoft: "#22D3A520",
  orange: "#FF7A3D",
  orangeSoft: "#FF7A3D20",
  red: "#FF4D6A",
  redSoft: "#FF4D6A20",
  text: "#EEEEF5",
  textMuted: "#7878A0",
  textFaint: "#3E3E5A",
};

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const formatDate = (date) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(date));

const INITIAL_CLIENTS = [];
const INITIAL_PROJECTS = [];
const INITIAL_SESSIONS = [];

// Reusable Components
const Badge = ({ children, color = COLORS.accent }) => (
  <span style={{
    background: color + "22", color, border: `1px solid ${color}44`,
    borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em"
  }}>{children}</span>
);

const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{
    background: COLORS.surface, border: `1px solid ${COLORS.border}`,
    borderRadius: 16, padding: 20, cursor: onClick ? "pointer" : "default",
    transition: "all 0.2s", ...style
  }}
    onMouseEnter={e => onClick && (e.currentTarget.style.borderColor = COLORS.accent + "66")}
    onMouseLeave={e => onClick && (e.currentTarget.style.borderColor = COLORS.border)}
  >{children}</div>
);

const Avatar = ({ letter, color, size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: size / 3, background: color + "33",
    border: `2px solid ${color}66`, display: "flex", alignItems: "center", justifyContent: "center",
    color, fontWeight: 700, fontSize: size * 0.38, flexShrink: 0,
    fontFamily: "'Syne', sans-serif"
  }}>{letter}</div>
);

const StatCard = ({ label, value, sub, color = COLORS.accent, icon }) => (
  <Card style={{ flex: 1, minWidth: 140 }}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div style={{
        width: 8, height: 8, borderRadius: "50%", background: color,
        boxShadow: `0 0 8px ${color}`, marginTop: 6
      }} />
    </div>
    <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.text, fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color, marginTop: 2 }}>{sub}</div>}
  </Card>
);

// CLIENTS MODULE
function ClientsModule({ clients, setClients, projects, sessions }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", color: "#7C5CFC" });

  const addClient = () => {
    if (!form.name.trim()) return;
    const newClient = {
      id: Date.now(), name: form.name,
      color: form.color, avatar: form.name[0].toUpperCase()
    };
    setClients(c => [...c, newClient]);
    setForm({ name: "", color: "#7C5CFC" });
    setShowForm(false);
  };

  const getClientStats = (clientId) => {
    const clientProjects = projects.filter(p => p.clientId === clientId);
    const totalHours = clientProjects.reduce((sum, p) => {
      const projSessions = sessions.filter(s => s.projectId === p.id);
      return sum + projSessions.reduce((a, s) => a + s.duration, 0) / 3600;
    }, 0);
    return { projects: clientProjects.length, hours: totalHours.toFixed(1) };
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, fontFamily: "'Syne', sans-serif" }}>Clientes</h2>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: COLORS.accentGlow, color: COLORS.accent, border: `1px solid ${COLORS.accent}44`,
          borderRadius: 10, padding: "8px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif"
        }}>+ Novo</button>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nome do cliente"
              style={{
                flex: 1, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`,
                color: COLORS.text, borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none",
                fontFamily: "'DM Sans', sans-serif"
              }} />
            <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
              style={{ width: 44, height: 44, border: "none", background: "none", cursor: "pointer", borderRadius: 8 }} />
            <button onClick={addClient} style={{
              background: COLORS.green, color: "#000", border: "none",
              borderRadius: 10, padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer"
            }}>✓</button>
          </div>
        </Card>
      )}

      {clients.map(client => {
        const stats = getClientStats(client.id);
        return (
          <Card key={client.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar letter={client.avatar} color={client.color} size={44} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, fontFamily: "'Syne', sans-serif" }}>{client.name}</div>
                <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: COLORS.textMuted }}>{stats.projects} projetos</span>
                  <span style={{ fontSize: 12, color: COLORS.textMuted }}>·</span>
                  <span style={{ fontSize: 12, color: COLORS.textMuted }}>{stats.hours}h registradas</span>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// LOG HOURS FORM — inline dentro do card do projeto
function LogHoursForm({ projectId, onSave, onCancel }) {
  const today = new Date().toISOString().split("T")[0];
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");

  const handleSave = () => {
    const totalSecs = (parseFloat(hours) || 0) * 3600 + (parseFloat(minutes) || 0) * 60;
    if (totalSecs <= 0) return;
    onSave({ projectId, date, duration: totalSecs, note });
  };

  const inputStyle = {
    background: COLORS.bg, border: `1px solid ${COLORS.border}`,
    color: COLORS.text, borderRadius: 8, padding: "8px 10px",
    fontSize: 13, outline: "none", fontFamily: "'DM Sans', sans-serif", width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${COLORS.border}` }}>
      <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
        Lançar horas
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>Horas</div>
          <input type="number" min="0" value={hours} onChange={e => setHours(e.target.value)}
            placeholder="0" style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>Minutos</div>
          <input type="number" min="0" max="59" value={minutes} onChange={e => setMinutes(e.target.value)}
            placeholder="0" style={inputStyle} />
        </div>
        <div style={{ flex: 2 }}>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>Data</div>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ ...inputStyle, colorScheme: "dark" }} />
        </div>
      </div>
      <input value={note} onChange={e => setNote(e.target.value)}
        placeholder="Descrição (opcional)"
        style={{ ...inputStyle, marginBottom: 10 }} />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleSave} style={{
          flex: 1, background: COLORS.green, color: "#000", border: "none",
          borderRadius: 8, padding: "10px", fontWeight: 700, fontSize: 13, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif"
        }}>✓ Salvar</button>
        <button onClick={onCancel} style={{
          flex: 1, background: COLORS.surfaceAlt, color: COLORS.textMuted, border: `1px solid ${COLORS.border}`,
          borderRadius: 8, padding: "10px", fontWeight: 600, fontSize: 13, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif"
        }}>Cancelar</button>
      </div>
    </div>
  );
}

// PROJECTS MODULE
function ProjectsModule({ projects, setProjects, clients, sessions, setSessions }) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [loggingId, setLoggingId] = useState(null); // qual projeto está com o form aberto
  const [form, setForm] = useState({ clientId: "", name: "", budget: "" });

  const addProject = () => {
    if (!form.name || !form.clientId) return;
    setProjects(p => [...p, {
      id: Date.now(), clientId: Number(form.clientId), name: form.name,
      budget: Number(form.budget) || 0,
      status: "active", totalHours: 0
    }]);
    setForm({ clientId: "", name: "", budget: "" });
    setShowNewForm(false);
  };

  const saveSession = ({ projectId, date, duration, note }) => {
    setSessions(s => [{ id: Date.now(), projectId, date, duration, note }, ...s]);
    setLoggingId(null);
  };

  const getProjectStats = (projectId) => {
    const s = sessions.filter(x => x.projectId === projectId);
    const hours = s.reduce((a, x) => a + x.duration, 0) / 3600;
    return { hours: hours.toFixed(1), sessions: s.length };
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, fontFamily: "'Syne', sans-serif" }}>Projetos</h2>
        <button onClick={() => setShowNewForm(!showNewForm)} style={{
          background: COLORS.accentGlow, color: COLORS.accent, border: `1px solid ${COLORS.accent}44`,
          borderRadius: 10, padding: "8px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif"
        }}>+ Novo</button>
      </div>

      {showNewForm && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <select value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
              style={{
                background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`,
                color: form.clientId ? COLORS.text : COLORS.textMuted, borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none",
                fontFamily: "'DM Sans', sans-serif"
              }}>
              <option value="">Selecionar cliente</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nome do projeto"
              style={{
                background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`,
                color: COLORS.text, borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none",
                fontFamily: "'DM Sans', sans-serif"
              }} />
            <input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
              placeholder="Budget total (R$)"
              style={{
                background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`,
                color: COLORS.text, borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none",
                fontFamily: "'DM Sans', sans-serif"
              }} />
            <button onClick={addProject} style={{
              background: COLORS.green, color: "#000", border: "none",
              borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 14, cursor: "pointer"
            }}>Adicionar Projeto</button>
          </div>
        </Card>
      )}

      {projects.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.textFaint, fontSize: 13 }}>
          Nenhum projeto ainda. Crie um acima.
        </div>
      )}

      {projects.map(proj => {
        const client = clients.find(c => c.id === proj.clientId);
        const stats = getProjectStats(proj.id);
        const progress = proj.budget > 0 ? Math.min((parseFloat(stats.hours) / (proj.budget / 100)) * 100, 100) : 0;
        const isLogging = loggingId === proj.id;

        return (
          <Card key={proj.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
              {client && <Avatar letter={client.avatar} color={client.color} size={38} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, fontFamily: "'Syne', sans-serif" }}>{proj.name}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>{client?.name}</div>
              </div>
              <Badge color={proj.status === "active" ? COLORS.green : COLORS.textMuted}>
                {proj.status === "active" ? "Ativo" : "Concluído"}
              </Badge>
            </div>

            <div style={{ display: "flex", gap: 16, alignItems: "flex-end", marginBottom: proj.budget > 0 ? 12 : 0 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 2 }}>Horas</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, fontFamily: "'Space Mono', monospace" }}>{stats.hours}h</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 2 }}>Sessões</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>{stats.sessions}</div>
              </div>
              {proj.status === "active" && !isLogging && (
                <button onClick={() => setLoggingId(proj.id)} style={{
                  background: COLORS.accentGlow, color: COLORS.accent, border: `1px solid ${COLORS.accent}44`,
                  borderRadius: 8, padding: "7px 14px", fontWeight: 600, fontSize: 12, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap"
                }}>+ Horas</button>
              )}
            </div>

            {proj.budget > 0 && (
              <div style={{ marginBottom: isLogging ? 0 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: COLORS.textMuted }}>Budget</span>
                  <span style={{ fontSize: 11, color: COLORS.textMuted }}>{formatCurrency(proj.budget)}</span>
                </div>
                <div style={{ background: COLORS.surfaceAlt, borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${progress}%`,
                    background: progress > 80 ? COLORS.red : COLORS.green,
                    borderRadius: 4, transition: "width 0.6s ease"
                  }} />
                </div>
              </div>
            )}

            {isLogging && (
              <LogHoursForm
                projectId={proj.id}
                onSave={saveSession}
                onCancel={() => setLoggingId(null)}
              />
            )}
          </Card>
        );
      })}
    </div>
  );
}

// DASHBOARD MODULE
function DashboardModule({ projects, clients, sessions }) {
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = today.slice(0, 7);

  const todaySessions = sessions.filter(s => s.date === today);
  const monthSessions = sessions.filter(s => s.date.startsWith(currentMonth));

  const todayHours = todaySessions.reduce((a, s) => a + s.duration, 0) / 3600;
  const monthHours = monthSessions.reduce((a, s) => a + s.duration, 0) / 3600;

  // Weekly activity (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    const daySessions = sessions.filter(s => s.date === key);
    const hours = daySessions.reduce((a, s) => a + s.duration, 0) / 3600;
    return { date: key, hours, label: d.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3) };
  });
  const maxHours = Math.max(...last7.map(d => d.hours), 1);

  // Top clients this month by hours
  const clientHours = clients.map(c => {
    const hrs = monthSessions
      .filter(s => projects.find(p => p.id === s.projectId)?.clientId === c.id)
      .reduce((a, s) => a + s.duration, 0) / 3600;
    return { ...c, hours: hrs };
  }).sort((a, b) => b.hours - a.hours).filter(c => c.hours > 0);

  return (
    <div>
      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <StatCard label="Hoje" value={`${todayHours.toFixed(1)}h`} sub={`${todaySessions.length} sessões`} color={COLORS.green} icon="⏱" />
        <StatCard label="Este mês" value={`${monthHours.toFixed(1)}h`} sub={`${monthSessions.length} registros`} color={COLORS.accent} icon="📅" />
        <StatCard label="Clientes" value={clients.length} sub={`${projects.filter(p => p.status === "active").length} projetos ativos`} color={COLORS.orange} icon="👤" />
        <StatCard label="Projetos" value={projects.length} sub={`${projects.filter(p => p.status === "completed").length} concluídos`} color={COLORS.accentSoft} icon="◫" />
      </div>

      {/* Weekly chart */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 13, color: COLORS.text, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>Atividade — últimos 7 dias</h3>
          <span style={{ fontSize: 12, color: COLORS.textMuted }}>{monthHours.toFixed(1)}h no mês</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 80 }}>
          {last7.map((d, i) => {
            const heightPct = (d.hours / maxHours) * 100;
            const isToday = d.date === today;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: "100%", height: 60, display: "flex", alignItems: "flex-end" }}>
                  <div style={{
                    width: "100%", height: `${Math.max(heightPct, d.hours > 0 ? 8 : 2)}%`,
                    background: isToday ? COLORS.green : (d.hours > 0 ? COLORS.accent : COLORS.surfaceAlt),
                    borderRadius: "4px 4px 2px 2px",
                    boxShadow: isToday ? `0 0 12px ${COLORS.green}66` : "none",
                    transition: "height 0.4s ease",
                    minHeight: 2
                  }} />
                </div>
                <span style={{ fontSize: 10, color: isToday ? COLORS.green : COLORS.textMuted, fontWeight: isToday ? 700 : 400 }}>{d.label}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Top clients */}
      {clientHours.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 13, color: COLORS.text, fontWeight: 700, fontFamily: "'Syne', sans-serif", marginBottom: 14 }}>Top clientes este mês</h3>
          {clientHours.slice(0, 3).map((c, i) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: i < 2 ? 12 : 0 }}>
              <Avatar letter={c.avatar} color={c.color} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{c.name}</div>
                <div style={{ background: COLORS.surfaceAlt, borderRadius: 3, height: 4, marginTop: 4 }}>
                  <div style={{
                    height: "100%", borderRadius: 3,
                    width: `${(c.hours / clientHours[0].hours) * 100}%`,
                    background: c.color
                  }} />
                </div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.accent, fontFamily: "'Space Mono', monospace" }}>{c.hours.toFixed(1)}h</span>
            </div>
          ))}
        </Card>
      )}

      {/* Recent sessions */}
      <Card>
        <h3 style={{ fontSize: 13, color: COLORS.text, fontWeight: 700, fontFamily: "'Syne', sans-serif", marginBottom: 14 }}>Histórico recente</h3>
        {sessions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "16px 0", color: COLORS.textFaint, fontSize: 13 }}>
            Nenhum registro ainda. Lance horas em um projeto.
          </div>
        ) : sessions.slice(0, 5).map((s, i) => {
          const p = projects.find(x => x.id === s.projectId);
          const c = p ? clients.find(x => x.id === p.clientId) : null;
          return (
            <div key={s.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              paddingBottom: i < Math.min(sessions.length, 5) - 1 ? 10 : 0,
              marginBottom: i < Math.min(sessions.length, 5) - 1 ? 10 : 0,
              borderBottom: i < Math.min(sessions.length, 5) - 1 ? `1px solid ${COLORS.border}` : "none"
            }}>
              {c && <Avatar letter={c.avatar} color={c.color} size={28} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>{p?.name}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>{formatDate(s.date)} · {s.note || "sem nota"}</div>
              </div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: COLORS.green }}>{formatTime(s.duration)}</div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// NAV CONFIG
const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "◈" },
  { id: "projects", label: "Projetos", icon: "◫" },
  { id: "clients", label: "Clientes", icon: "◉" },
];

// ROOT APP
export default function FreelanceOS() {
  const [tab, setTab] = useState("dashboard");
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #252535; border-radius: 2px; }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
        select option { background: #1A1A24; }
        input::placeholder { color: #3E3E5A; }
        input:focus, select:focus { border-color: #7C5CFC66 !important; }
      `}</style>

      <div style={{
        background: COLORS.bg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif",
        color: COLORS.text, maxWidth: 420, margin: "0 auto", position: "relative",
        display: "flex", flexDirection: "column"
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 20px 0", background: COLORS.bg,
          position: "sticky", top: 0, zIndex: 10,
          borderBottom: `1px solid ${COLORS.border}`
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" }}>
                Freelance<span style={{ color: COLORS.accent }}>OS</span>
              </div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 1 }}>
                {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </div>
            </div>
            <div style={{
              background: COLORS.green + "22", border: `1px solid ${COLORS.green}44`,
              borderRadius: 20, padding: "4px 12px", fontSize: 11, color: COLORS.green, fontWeight: 600
            }}>
              ● Online
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 2 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, padding: "10px 4px", background: "none", border: "none", cursor: "pointer",
                borderBottom: `2px solid ${tab === t.id ? COLORS.accent : "transparent"}`,
                color: tab === t.id ? COLORS.accent : COLORS.textMuted,
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 11,
                transition: "all 0.2s", letterSpacing: "0.02em"
              }}>
                <div style={{ fontSize: 16, marginBottom: 2 }}>{t.icon}</div>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "20px 16px 100px", flex: 1, overflowY: "auto" }}>
          {tab === "dashboard" && <DashboardModule projects={projects} clients={clients} sessions={sessions} />}
          {tab === "projects" && <ProjectsModule projects={projects} setProjects={setProjects} clients={clients} sessions={sessions} setSessions={setSessions} />}
          {tab === "clients" && <ClientsModule clients={clients} setClients={setClients} projects={projects} sessions={sessions} />}
        </div>

        {/* Bottom gradient */}
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: 420, height: 60,
          background: `linear-gradient(transparent, ${COLORS.bg})`,
          pointerEvents: "none"
        }} />
      </div>
    </>
  );
}