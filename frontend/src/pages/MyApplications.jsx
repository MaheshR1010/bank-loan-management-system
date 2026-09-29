import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./MyApplications.css";

function MyApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get("/loan-applications/my");
        setApplications(response.data);
      } catch (err) {
        console.error("Failed to load applications:", err);

        setError(
          err.response?.data?.detail ||
            "Unable to load your loan applications."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="applications-page">
        <div className="applications-loading">
          <div className="loading-spinner"></div>
          <p>Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="applications-page">

      {/* Header */}
      <header className="applications-header">

        <div className="applications-brand">
          <div className="applications-brand-icon">C</div>

          <div>
            <h2>COMPUNET</h2>
            <span>Digital Banking</span>
          </div>
        </div>

        <button
          className="dashboard-back-button"
          onClick={() => navigate("/customer")}
        >
          ← Dashboard
        </button>

      </header>

      {/* Main Content */}
      <main className="applications-content">

        {/* Page Heading */}
        <section className="page-intro">

          <div>
            <span className="page-label">LOAN SERVICES</span>

            <h1>My Applications</h1>

            <p>
              Track and manage all your loan applications in one place.
            </p>
          </div>

          <button
            className="new-application-button"
            onClick={() => navigate("/apply-loan")}
          >
            <span>+</span>
            Apply for Loan
          </button>

        </section>

        {/* Error */}
        {error && (
          <div className="application-error">
            <span>⚠</span>
            <div>
              <strong>Unable to load applications</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Applications */}
        {!error && applications.length === 0 ? (
          <div className="empty-applications">

            <div className="empty-icon">📄</div>

            <h2>No Applications Yet</h2>

            <p>
              You haven't submitted any loan applications.
              Start your first application today.
            </p>

            <button
              className="new-application-button"
              onClick={() => navigate("/apply-loan")}
            >
              Apply for a Loan →
            </button>

          </div>
        ) : (
          <section className="applications-list">

            <div className="applications-list-header">
              <div>
                <h2>Your Loan Applications</h2>
                <p>
                  {applications.length} application
                  {applications.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="application-cards">

              {applications.map((application) => {

                const status = application.status?.toLowerCase();

                let statusClass = "status-default";

                if (status === "approved") {
                  statusClass = "status-approved";
                } else if (
                  status === "rejected" ||
                  status === "declined"
                ) {
                  statusClass = "status-rejected";
                } else if (
                  status === "submitted" ||
                  status === "pending"
                ) {
                  statusClass = "status-pending";
                }

                return (
                  <article
                    className="application-card"
                    key={application.id}
                  >

                    {/* Card Top */}
                    <div className="application-card-top">

                      <div className="application-number">

                        <div className="document-icon">
                          📄
                        </div>

                        <div>
                          <span>APPLICATION NUMBER</span>

                          <h3>
                            {application.application_number}
                          </h3>
                        </div>

                      </div>

                      <span
                        className={`application-status ${statusClass}`}
                      >
                        <span className="status-dot"></span>
                        {application.status}
                      </span>

                    </div>

                    {/* Card Details */}
                    <div className="application-details">

                      <div className="detail-box">

                        <span>REQUESTED AMOUNT</span>

                        <strong>
                          ₹
                          {Number(
                            application.requested_amount
                          ).toLocaleString("en-IN")}
                        </strong>

                      </div>

                      <div className="detail-box">

                        <span>LOAN TENURE</span>

                        <strong>
                          {application.requested_tenure_months}
                          <small> months</small>
                        </strong>

                      </div>

                      <div className="detail-box">

                        <span>APPLIED ON</span>

                        <strong>
                          {new Date(
                            application.created_at
                          ).toLocaleDateString("en-IN")}
                        </strong>

                      </div>

                    </div>

                    {/* Card Footer */}
                    <div className="application-card-footer">

                      <span>
                        Application status is updated by the
                        loan review team.
                      </span>

                      <span className="application-arrow">
                        →
                      </span>

                    </div>

                  </article>
                );
              })}

            </div>

          </section>
        )}

      </main>
    </div>
  );
}

export default MyApplications;