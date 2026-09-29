import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./MyLoanAccounts.css";

function MyLoanAccounts() {
  const navigate = useNavigate();

  const [loanAccounts, setLoanAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLoanAccounts = async () => {
      try {
        const response = await api.get("/loan-accounts/my");

        setLoanAccounts(response.data);
      } catch (err) {
        console.error("Failed to load loan accounts:", err);

        setError(
          err.response?.data?.detail ||
            "Unable to load your loan accounts."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLoanAccounts();
  }, []);

  if (loading) {
    return (
      <div className="loan-accounts-page">
        <div className="loan-accounts-loading">
          <div className="loading-spinner"></div>
          <p>Loading your loan accounts...</p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Separate active accounts from closed/completed history
  // ---------------------------------------------------------
  const activeAccounts = loanAccounts.filter(
    (account) =>
      account.status?.toLowerCase() === "active"
  );

  const loanHistory = loanAccounts.filter((account) => {
    const status = account.status?.toLowerCase();

    return (
      status === "closed" ||
      status === "completed"
    );
  });

  return (
    <div className="loan-accounts-page">

      <header className="loan-accounts-header">
        <div className="loan-accounts-brand">
          <div className="loan-accounts-brand-icon">C</div>

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

      <main className="loan-accounts-content">

        <section className="loan-accounts-intro">
          <div>
            <span className="page-label">LOAN SERVICES</span>

            <h1>My Loan Accounts</h1>

            <p>
              View your active loan accounts, balances, interest rates
              and repayment information.
            </p>
          </div>

          <div className="accounts-summary">
            <span>ACTIVE ACCOUNTS</span>
            <strong>{activeAccounts.length}</strong>
          </div>
        </section>

        {error && (
          <div className="loan-account-error">
            <span>⚠</span>

            <div>
              <strong>Unable to load loan accounts</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!error &&
          activeAccounts.length === 0 &&
          loanHistory.length === 0 && (
            <div className="empty-loan-accounts">
              <div className="empty-loan-icon">🏦</div>

              <h2>No Loan Accounts</h2>

              <p>
                You currently don't have any loan accounts.
              </p>

              <button
                className="new-loan-button"
                onClick={() => navigate("/apply-loan")}
              >
                Apply for a Loan →
              </button>
            </div>
          )}

        {/* ---------------------------------------------------
            ACTIVE LOAN ACCOUNTS
        --------------------------------------------------- */}
        {!error && activeAccounts.length > 0 && (
          <section className="loan-accounts-list">

            <div className="loan-list-header">
              <div>
                <h2>Your Active Loan Accounts</h2>

                <p>
                  {activeAccounts.length} active account
                  {activeAccounts.length !== 1 ? "s" : ""} found
                </p>
              </div>
            </div>

            <div className="loan-account-cards">

              {activeAccounts.map((account) => {

                const status =
                  account.status?.toLowerCase();

                let statusClass =
                  "account-status-default";

                if (status === "active") {
                  statusClass =
                    "account-status-active";
                } else if (
                  status === "closed" ||
                  status === "completed"
                ) {
                  statusClass =
                    "account-status-closed";
                } else if (
                  status === "overdue" ||
                  status === "defaulted"
                ) {
                  statusClass =
                    "account-status-warning";
                }

                return (
                  <article
                    className="loan-account-card"
                    key={account.id}
                  >

                    <div className="loan-account-card-top">

                      <div className="loan-account-title">

                        <div className="loan-account-icon">
                          ₹
                        </div>

                        <div>
                          <span>LOAN ACCOUNT</span>

                          <h3>
                            {account.account_number}
                          </h3>
                        </div>

                      </div>

                      <span
                        className={`account-status ${statusClass}`}
                      >
                        <span className="status-dot"></span>
                        {account.status}
                      </span>

                    </div>

                    <div className="loan-primary-details">

                      <div className="balance-section">

                        <span>
                          OUTSTANDING PRINCIPAL
                        </span>

                        <strong>
                          ₹
                          {Number(
                            account.outstanding_principal
                          ).toLocaleString("en-IN")}
                        </strong>

                      </div>

                      <div className="principal-section">

                        <span>
                          ORIGINAL PRINCIPAL
                        </span>

                        <strong>
                          ₹
                          {Number(
                            account.principal_amount
                          ).toLocaleString("en-IN")}
                        </strong>

                      </div>

                    </div>

                    <div className="loan-account-details">

                      <div className="loan-detail">

                        <span>INTEREST RATE</span>

                        <strong>
                          {account.annual_interest_rate}%
                        </strong>

                      </div>

                      <div className="loan-detail">

                        <span>LOAN TENURE</span>

                        <strong>
                          {account.tenure_months}
                          <small> months</small>
                        </strong>

                      </div>

                      <div className="loan-detail">

                        <span>DISBURSEMENT DATE</span>

                        <strong>
                          {account.disbursement_date
                            ? new Date(
                                account.disbursement_date
                              ).toLocaleDateString("en-IN")
                            : "Not available"}
                        </strong>

                      </div>

                      <div className="loan-detail">

                        <span>MATURITY DATE</span>

                        <strong>
                          {account.maturity_date
                            ? new Date(
                                account.maturity_date
                              ).toLocaleDateString("en-IN")
                            : "Not available"}
                        </strong>

                      </div>

                    </div>

                    <div className="loan-account-footer">

                      <span>
                        Loan account information
                        is maintained securely by Compunet.
                      </span>

                      <span className="loan-footer-icon">
                        ✓
                      </span>

                    </div>

                  </article>
                );
              })}

            </div>
          </section>
        )}

        {/* ---------------------------------------------------
            LOAN HISTORY
        --------------------------------------------------- */}
        {!error && loanHistory.length > 0 && (
          <section className="loan-accounts-list loan-history-section">

            <div className="loan-list-header">
              <div>
                <h2>Loan History</h2>

                <p>
                  {loanHistory.length} completed loan
                  {loanHistory.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="loan-account-cards">

              {loanHistory.map((account) => (

                <article
                  className="loan-account-card loan-history-card"
                  key={account.id}
                >

                  <div className="loan-account-card-top">

                    <div className="loan-account-title">

                      <div className="loan-account-icon">
                        ✓
                      </div>

                      <div>
                        <span>LOAN ACCOUNT</span>

                        <h3>
                          {account.account_number}
                        </h3>
                      </div>

                    </div>

                    <span className="account-status account-status-closed">
                      <span className="status-dot"></span>
                      {account.status}
                    </span>

                  </div>

                  <div className="loan-primary-details">

                    <div className="balance-section">

                      <span>
                        OUTSTANDING PRINCIPAL
                      </span>

                      <strong>
                        ₹
                        {Number(
                          account.outstanding_principal
                        ).toLocaleString("en-IN")}
                      </strong>

                    </div>

                    <div className="principal-section">

                      <span>
                        ORIGINAL PRINCIPAL
                      </span>

                      <strong>
                        ₹
                        {Number(
                          account.principal_amount
                        ).toLocaleString("en-IN")}
                      </strong>

                    </div>

                  </div>

                  <div className="loan-account-details">

                    <div className="loan-detail">

                      <span>INTEREST RATE</span>

                      <strong>
                        {account.annual_interest_rate}%
                      </strong>

                    </div>

                    <div className="loan-detail">

                      <span>LOAN TENURE</span>

                      <strong>
                        {account.tenure_months}
                        <small> months</small>
                      </strong>

                    </div>

                    <div className="loan-detail">

                      <span>DISBURSEMENT DATE</span>

                      <strong>
                        {account.disbursement_date
                          ? new Date(
                              account.disbursement_date
                            ).toLocaleDateString("en-IN")
                          : "Not available"}
                      </strong>

                    </div>

                    <div className="loan-detail">

                      <span>MATURITY DATE</span>

                      <strong>
                        {account.maturity_date
                          ? new Date(
                              account.maturity_date
                            ).toLocaleDateString("en-IN")
                          : "Not available"}
                      </strong>

                    </div>

                  </div>

                  <div className="loan-account-footer">

                    <span>
                      This loan account has been closed
                      successfully.
                    </span>

                    <span className="loan-footer-icon">
                      ✓
                    </span>

                  </div>

                </article>

              ))}

            </div>
          </section>
        )}

      </main>
    </div>
  );
}

export default MyLoanAccounts;