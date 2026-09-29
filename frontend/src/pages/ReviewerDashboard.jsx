import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ReviewerDashboard.css";

function ReviewerDashboard() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadApplications = async () => {
    try {
      const response = await api.get("/loan-applications/");
      setApplications(response.data);
      setError("");
    } catch (err) {
      console.error(err);

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail.map((item) => item.msg || "Validation error").join(", ")
        );
      } else {
        setError(detail || "Failed to load applications.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleDecision = async (applicationId, decision) => {
    setProcessingId(applicationId);
    setMessage("");
    setError("");

    try {
      await api.post("/loan-approvals/", {
        application_id: applicationId,
        decision: decision,
        remarks:
          decision === "approved"
            ? "Loan application approved after review."
            : "Loan application rejected after review.",
      });

      setMessage(
        `Application ${
          decision === "approved" ? "approved" : "rejected"
        } successfully.`
      );

      await loadApplications();
    } catch (err) {
      console.error(err);

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail.map((item) => item.msg || "Validation error").join(", ")
        );
      } else {
        setError(detail || "Unable to process application.");
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateLoanAccount = async (applicationId) => {
    setProcessingId(applicationId);
    setMessage("");
    setError("");

    try {
      const response = await api.post("/loan-accounts/", {
        application_id: applicationId,
        disbursement_date: new Date().toISOString().split("T")[0],
      });

      setMessage(
        `Loan account ${response.data.account_number} created successfully.`
      );

      await loadApplications();
    } catch (err) {
      console.error(err);

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail.map((item) => item.msg || "Validation error").join(", ")
        );
      } else {
        setError(detail || "Unable to create loan account.");
      }
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="reviewer-page">
        <div className="reviewer-loading">
          <div className="loading-spinner"></div>
          <h2>Loading Reviewer Dashboard</h2>
          <p>Please wait...</p>
        </div>
      </div>
    );
  }

  const submittedCount = applications.filter(
    (app) => app.status === "submitted"
  ).length;

  const approvedCount = applications.filter(
    (app) => app.status === "approved"
  ).length;

  const rejectedCount = applications.filter(
    (app) => app.status === "rejected"
  ).length;

  return (
    <div className="reviewer-page">
      {/* Header */}
      <header className="reviewer-header">
        <div className="reviewer-brand">
          <div className="reviewer-logo">🏦</div>

          <div>
            <h1>Bank Loan Management System</h1>
            <p>Loan Review & Approval Portal</p>
          </div>
        </div>

        <div className="reviewer-header-right">
          <div className="reviewer-role">
            <span className="role-icon">✓</span>
            Reviewer
          </div>

          <button
            className="logout-button"
            onClick={() => {
              localStorage.removeItem("access_token");
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="reviewer-main">
        <div className="reviewer-title-section">
          <div>
            <h2>Reviewer Dashboard</h2>
            <p>Review and process customer loan applications.</p>
          </div>

          <button
            className="refresh-button"
            onClick={loadApplications}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        {/* Statistics */}
        <section className="reviewer-stats">
          <div className="stat-card">
            <div className="stat-icon total-icon">📋</div>
            <div>
              <span>Total Applications</span>
              <strong>{applications.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending-icon">⏳</div>
            <div>
              <span>Pending Review</span>
              <strong>{submittedCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon approved-icon">✓</div>
            <div>
              <span>Approved</span>
              <strong>{approvedCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon rejected-icon">✕</div>
            <div>
              <span>Rejected</span>
              <strong>{rejectedCount}</strong>
            </div>
          </div>
        </section>

        {/* Messages */}
        {message && (
          <div className="reviewer-alert success-alert">
            <span>✓</span>
            <p>{message}</p>
          </div>
        )}

        {error && (
          <div className="reviewer-alert error-alert">
            <span>!</span>
            <p>{error}</p>
          </div>
        )}

        {/* Applications */}
        <section className="applications-card">
          <div className="applications-header">
            <div>
              <h3>Loan Applications</h3>
              <p>Review customer applications and take appropriate action.</p>
            </div>

            <span className="application-count">
              {applications.length} Applications
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <h3>No Loan Applications</h3>
              <p>There are currently no loan applications to review.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>Application No.</th>
                    <th>Customer ID</th>
                    <th>Loan Product</th>
                    <th>Amount</th>
                    <th>Tenure</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td>
                        <span className="application-number">
                          {application.application_number}
                        </span>
                      </td>

                      <td>
                        <span className="customer-id">
                          #{application.customer_id}
                        </span>
                      </td>

                      <td>
                        <span className="product-id">
                          Product #{application.loan_product_id}
                        </span>
                      </td>

                      <td>
                        <strong className="amount">
                          ₹
                          {Number(
                            application.requested_amount
                          ).toLocaleString("en-IN")}
                        </strong>
                      </td>

                      <td>
                        {application.requested_tenure_months} months
                      </td>

                      <td>
                        <span
                          className={`status-badge status-${application.status}`}
                        >
                          {application.status}
                        </span>
                      </td>

                      <td>
                        {new Date(
                          application.created_at
                        ).toLocaleDateString("en-IN")}
                      </td>

                      <td>
                        <div className="action-buttons">
                          {application.status === "submitted" ? (
                            <>
                              <button
                                className="approve-button"
                                onClick={() =>
                                  handleDecision(
                                    application.id,
                                    "approved"
                                  )
                                }
                                disabled={
                                  processingId === application.id
                                }
                              >
                                {processingId === application.id
                                  ? "Processing..."
                                  : "✓ Approve"}
                              </button>

                              <button
                                className="reject-button"
                                onClick={() =>
                                  handleDecision(
                                    application.id,
                                    "rejected"
                                  )
                                }
                                disabled={
                                  processingId === application.id
                                }
                              >
                                {processingId === application.id
                                  ? "Processing..."
                                  : "✕ Reject"}
                              </button>
                            </>
                          ) : application.status === "approved" ? (
                            <button
                              className="create-account-button"
                              onClick={() =>
                                handleCreateLoanAccount(
                                  application.id
                                )
                              }
                              disabled={
                                processingId === application.id
                              }
                            >
                              {processingId === application.id
                                ? "Creating..."
                                : "＋ Create Loan Account"}
                            </button>
                          ) : (
                            <span className="processed-text">
                              Processed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ReviewerDashboard;