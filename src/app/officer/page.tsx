import Link from "next/link";

const entries = [
  { name: "राम प्रसाद", token: "T-114", crop: "गेहूं", status: "Queue 4" },
  { name: "शिव कुमार", token: "T-067", crop: "चावल", status: "Under weighing" },
  { name: "नंदा देवी", token: "T-032", crop: "मक्का", status: "Payment complete" },
];

export default function OfficerPage() {
  return (
    <div className="portal-page">
      <div className="portal-shell">
        <header className="portal-header">
          <div>
            <p className="muted">Officer Portal</p>
            <h1 className="portal-title">मंडी संचालन टेबल</h1>
          </div>
          <div className="action-row">
            <Link href="/" className="btn-secondary">
              Home
            </Link>
            <Link href="/farmer" className="btn-primary">
              Farmer App
            </Link>
          </div>
        </header>

        <main className="portal-grid">
          <section className="panel-card">
            <div className="card-header">
              <h2>Queue board</h2>
              <span className="status-pill">Operational</span>
            </div>

            <div className="queue-list">
              {entries.map((entry) => (
                <div key={entry.token} className="queue-item">
                  <div>
                    <strong>{entry.name}</strong>
                    <div className="queue-meta">
                      {entry.crop} • {entry.token}
                    </div>
                  </div>
                  <span className="tiny-badge">{entry.status}</span>
                  <button type="button" className="btn-secondary">
                    Assign slot
                  </button>
                </div>
              ))}
            </div>
          </section>

          <aside className="panel-card">
            <div className="card-header">
              <h2>Operational snapshot</h2>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <strong>94%</strong>
                <span>Gate pass issued</span>
              </div>
              <div className="stat-card">
                <strong>24</strong>
                <span>Active farmers</span>
              </div>
              <div className="stat-card">
                <strong>₹ 2.3L</strong>
                <span>Today settlement</span>
              </div>
              <div className="stat-card">
                <strong>5</strong>
                <span>Pending reviews</span>
              </div>
            </div>
          </aside>
        </main>

        <section className="panel-card" style={{ marginTop: "1.5rem" }}>
          <div className="card-header">
            <h2>Manual intervention</h2>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="issue">Issue category</label>
              <select id="issue" defaultValue="weighting">
                <option value="weighting">Weight verification</option>
                <option value="quality">Quality inspection</option>
                <option value="payment">DBT repetition</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="priority">Priority</label>
              <select id="priority" defaultValue="high">
                <option value="high">High</option>
                <option value="med">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="notes">Notes</label>
              <textarea id="notes" defaultValue="Farmer has a duplicate verification request. Please review the previous lot record before approval." />
            </div>
          </div>

          <div className="action-row">
            <button type="button" className="btn-primary">
              Escalate case
            </button>
            <button type="button" className="btn-secondary">
              Save note
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
