import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./CustomerDashboard.css";

function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="customer-dashboard">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">C</div>

          <div>
            <h2>COMPUNET</h2>
            <span>Digital Banking</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <button className="nav-item active">
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/my-applications")}
          >
            <span>▣</span>
            My Applications
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/my-loan-accounts")}
          >
            <span>▤</span>
            My Loans
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/repayment-schedule")}
          >
            <span>◷</span>
            Repayments
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/make-payment")}
          >
            <span>₹</span>
            Payments
          </button>

        </nav>

        <button className="logout-button" onClick={logout}>
          <span>↪</span>
          Logout
        </button>

      </aside>

      {/* Main Area */}
      <div className="dashboard-main">

        {/* Top Header */}
        <header className="top-header">

          <div>
            <p className="welcome-small">CUSTOMER PORTAL</p>
            <h1>Welcome, {user?.full_name} 👋</h1>
          </div>

          <div className="profile-area">
            <div className="notification">🔔</div>

            <div className="profile-avatar">
              {user?.full_name?.charAt(0)?.toUpperCase()}
            </div>

            <div className="profile-name">
              <strong>{user?.full_name}</strong>
              <span>Customer</span>
            </div>
          </div>

        </header>

        {/* Welcome Banner */}
        <section className="welcome-banner">

          <div>
            <span className="banner-label">COMPUNET BANKING</span>

            <h2>
              Your financial journey,
              <br />
              managed simply.
            </h2>

            <p>
              Manage your loans, applications and repayments
              from one secure place.
            </p>

            <button
              className="primary-button"
              onClick={() => navigate("/apply-loan")}
            >
              Apply for a Loan
              <span>→</span>
            </button>
          </div>

          <div className="banner-decoration">
            <div className="circle circle-one"></div>
            <div className="circle circle-two"></div>
            <div className="bank-symbol">₹</div>
          </div>

        </section>

        {/* Quick Actions */}
        <section className="dashboard-section">

          <div className="section-heading">
            <div>
              <h2>Quick Actions</h2>
              <p>Access your most-used banking services</p>
            </div>
          </div>

          <div className="action-grid">

            <button
              className="action-card blue"
              onClick={() => navigate("/apply-loan")}
            >
              <div className="action-icon">₹</div>

              <div className="action-content">
                <h3>Apply for Loan</h3>
                <p>Start a new loan application</p>
              </div>

              <span className="arrow">→</span>
            </button>

            <button
              className="action-card purple"
              onClick={() => navigate("/my-applications")}
            >
              <div className="action-icon">▣</div>

              <div className="action-content">
                <h3>My Applications</h3>
                <p>Track your loan applications</p>
              </div>

              <span className="arrow">→</span>
            </button>

            <button
              className="action-card green"
              onClick={() => navigate("/my-loan-accounts")}
            >
              <div className="action-icon">▤</div>

              <div className="action-content">
                <h3>My Loan Accounts</h3>
                <p>View your active loan accounts</p>
              </div>

              <span className="arrow">→</span>
            </button>

            <button
              className="action-card orange"
              onClick={() => navigate("/repayment-schedule")}
            >
              <div className="action-icon">◷</div>

              <div className="action-content">
                <h3>Repayment Schedule</h3>
                <p>Check your upcoming EMIs</p>
              </div>

              <span className="arrow">→</span>
            </button>

            <button
              className="action-card pink"
              onClick={() => navigate("/make-payment")}
            >
              <div className="action-icon">✓</div>

              <div className="action-content">
                <h3>Make Payment</h3>
                <p>Pay your upcoming installment</p>
              </div>

              <span className="arrow">→</span>
            </button>

          </div>

        </section>

        {/* Security Notice */}
        <div className="security-notice">
          <span>🔒</span>

          <div>
            <strong>Your account is secure</strong>
            <p>
              Compunet protects your banking information with secure
              authentication and access controls.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CustomerDashboard;