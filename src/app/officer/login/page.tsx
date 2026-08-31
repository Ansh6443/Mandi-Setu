import Link from "next/link";

export default function OfficerLoginPage() {
  return (
    <div className="portal-page">
      <div className="portal-shell" style={{ maxWidth: 760 }}>
        <header className="portal-header">
          <div>
            <p className="muted">Officer Access</p>
            <h1 className="portal-title">मंडी अधिकारी लॉगिन</h1>
          </div>
          <Link href="/" className="btn-secondary">
            Home
          </Link>
        </header>

        <main className="panel-card">
          <div className="card-header">
            <h2>सुरक्षित प्रवेश</h2>
            <span className="status-pill">Verified gateway</span>
          </div>

          <div className="form-grid">
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="officerId">Officer ID</label>
              <input id="officerId" defaultValue="OFF-26032-04" />
            </div>

            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="password">Password</label>
              <input id="password" type="password" defaultValue="••••••••" />
            </div>

            <div className="field">
              <label htmlFor="mandiCode">Mandi Code</label>
              <input id="mandiCode" defaultValue="AZD-014" />
            </div>

            <div className="field">
              <label htmlFor="region">Region</label>
              <select id="region" defaultValue="nashik">
                <option value="nashik">नाशिक</option>
                <option value="ghazipur">गाज़ीपुर</option>
                <option value="latur">लातूर</option>
              </select>
            </div>
          </div>

          <div className="action-row">
            <Link href="/officer" className="btn-primary">
              Login to Dashboard
            </Link>
            <button type="button" className="btn-secondary">
              Forgot Password
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
