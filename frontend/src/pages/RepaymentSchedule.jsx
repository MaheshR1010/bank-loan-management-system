import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./RepaymentSchedule.css";

function RepaymentSchedule() {
  const navigate = useNavigate();

  const [loanAccounts, setLoanAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLoanAccounts = async () => {
      try {
        const response = await api.get("/loan-accounts/my");

        setLoanAccounts(response.data);

        if (response.data.length > 0) {
          setSelectedAccount(String(response.data[0].id));
        }
      } catch (err) {
        console.error("Failed to load loan accounts:", err);

        const detail = err.response?.data?.detail;

        if (Array.isArray(detail)) {
          setError(
            detail.map((item) => item.msg || "Validation error").join(", ")
          );
        } else {
          setError(detail || "Unable to load your loan accounts.");
        }
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchLoanAccounts();
  }, []);

  useEffect(() => {
    if (!selectedAccount) {
      return;
    }

    const fetchSchedule = async () => {
      setLoadingSchedule(true);
      setError("");
      setSchedule([]);

      try {
        const response = await api.get("/repayments/my");

        const filteredSchedule = response.data.filter(
          (repayment) =>
            String(repayment.loan_account_id) === String(selectedAccount)
        );

        setSchedule(filteredSchedule);
      } catch (err) {
        console.error("Failed to load repayment schedule:", err);

        const detail = err.response?.data?.detail;

        if (Array.isArray(detail)) {
          setError(
            detail.map((item) => item.msg || "Validation error").join(", ")
          );
        } else {
          setError(detail || "Unable to load repayment schedule.");
        }
      } finally {
        setLoadingSchedule(false);
      }
    };

    fetchSchedule();
  }, [selectedAccount]);

  const selectedLoanAccount = loanAccounts.find(
    (account) => String(account.id) === String(selectedAccount)
  );

  const isClosedLoan =
    selectedLoanAccount?.status?.toLowerCase() === "closed" ||
    selectedLoanAccount?.status?.toLowerCase() === "completed";

  const hasPendingRepayments = schedule.some(
    (repayment) => repayment.status?.toLowerCase() !== "paid"
  );

  if (loadingAccounts) {
    return (
      <div className="repayment-page">
        <div className="repayment-loading">
          <div className="loading-spinner"></div>
          <p>Loading your loan accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="repayment-page">

      <header className="repayment-header">
        <div className="repayment-brand">
          <div className="repayment-brand-icon">C</div>

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


      <main className="repayment-content">

        <section className="repayment-intro">
          <div>
            <span className="page-label">REPAYMENT SERVICES</span>

            <h1>Repayment Schedule</h1>

            <p>
              Track your monthly installments, principal,
              interest and payment status.
            </p>
          </div>
        </section>


        {error && (
          <div className="repayment-error">
            <span>⚠</span>

            <div>
              <strong>Unable to load repayment information</strong>
              <p>{error}</p>
            </div>
          </div>
        )}


        {loanAccounts.length === 0 ? (

          <div className="empty-repayment">
            <div className="empty-repayment-icon">📅</div>

            <h2>No Loan Accounts</h2>

            <p>
              You need a loan account before
              a repayment schedule can be displayed.
            </p>

            <button
              className="repayment-action-button"
              onClick={() => navigate("/apply-loan")}
            >
              Apply for a Loan →
            </button>
          </div>

        ) : (

          <>

            <section className="account-selector-card">

              <div className="selector-heading">
                <div className="selector-icon">₹</div>

                <div>
                  <span>LOAN ACCOUNT</span>
                  <h2>Select an Account</h2>
                </div>
              </div>

              <div className="selector-control">

                <label htmlFor="loanAccount">
                  Loan Account
                </label>

                <select
                  id="loanAccount"
                  value={selectedAccount}
                  onChange={(event) =>
                    setSelectedAccount(event.target.value)
                  }
                >
                  {loanAccounts.map((account) => (
                    <option
                      key={account.id}
                      value={account.id}
                    >
                      {account.account_number} - ₹
                      {Number(
                        account.principal_amount
                      ).toLocaleString("en-IN")}
                      {account.status?.toLowerCase() === "closed"
                        ? " - CLOSED"
                        : ""}
                    </option>
                  ))}
                </select>

              </div>

            </section>


            {/* Closed loan information */}

            {isClosedLoan && (
              <div className="closed-loan-notice">

                <div className="closed-loan-icon">
                  ✓
                </div>

                <div>
                  <strong>Loan Account Closed</strong>

                  <p>
                    This loan account has been fully repaid.
                    All installments have been completed and
                    the outstanding balance is ₹0.00.
                  </p>
                </div>

              </div>
            )}


            {loadingSchedule ? (

              <div className="schedule-loading">

                <div className="loading-spinner"></div>

                <p>
                  Loading repayment schedule...
                </p>

              </div>

            ) : schedule.length === 0 ? (

              <div className="empty-repayment">

                <div className="empty-repayment-icon">
                  📋
                </div>

                <h2>
                  {isClosedLoan
                    ? "No Repayment Schedule Found"
                    : "No Repayment Schedule Found"}
                </h2>

                <p>
                  There is currently no repayment schedule
                  available for this loan account.
                </p>

              </div>

            ) : (

              <>

                {/* No pending installments message */}

                {!hasPendingRepayments && (
                  <div className="no-pending-repayments">

                    <div className="no-pending-repayments-icon">
                      ✓
                    </div>

                    <div>
                      <strong>No Pending Repayments</strong>

                      <p>
                        There are no pending installments
                        for this loan account.
                      </p>
                    </div>

                  </div>
                )}


                <section className="schedule-section">

                  <div className="schedule-heading">

                    <div>
                      <span className="page-label">
                        {isClosedLoan
                          ? "LOAN HISTORY"
                          : "PAYMENT PLAN"}
                      </span>

                      <h2>
                        {isClosedLoan
                          ? "Completed Repayment History"
                          : "Monthly Repayment Schedule"}
                      </h2>

                      <p>
                        {schedule.length} installments
                        in this repayment plan
                      </p>
                    </div>

                    <div className="schedule-count">
                      {schedule.length}
                    </div>

                  </div>


                  <div className="schedule-table-wrapper">

                    <table className="schedule-table">

                      <thead>
                        <tr>
                          <th>Installment</th>
                          <th>Due Date</th>
                          <th>Amount Due</th>
                          <th>Principal</th>
                          <th>Interest</th>
                          <th>Amount Paid</th>
                          <th>Remaining</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>

                        {schedule.map((repayment) => {

                          const status =
                            repayment.status?.toLowerCase();

                          let statusClass =
                            "schedule-status-default";

                          if (status === "paid") {
                            statusClass =
                              "schedule-status-paid";
                          } else if (
                            status === "pending"
                          ) {
                            statusClass =
                              "schedule-status-pending";
                          } else if (
                            status === "partial"
                          ) {
                            statusClass =
                              "schedule-status-partial";
                          } else if (
                            status === "overdue"
                          ) {
                            statusClass =
                              "schedule-status-overdue";
                          }

                          const amountDue =
                            Number(repayment.amount_due || 0);

                          const amountPaid =
                            Number(repayment.amount_paid || 0);

                          const remainingAmount = Math.max(
                            amountDue - amountPaid,
                            0
                          );

                          return (
                            <tr key={repayment.id}>

                              <td>
                                <span className="installment-number">
                                  #{repayment.installment_number}
                                </span>
                              </td>

                              <td>
                                {new Date(
                                  repayment.due_date
                                ).toLocaleDateString(
                                  "en-IN"
                                )}
                              </td>

                              <td>
                                <strong>
                                  ₹
                                  {amountDue.toLocaleString(
                                    "en-IN",
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )}
                                </strong>
                              </td>

                              <td>
                                ₹
                                {Number(
                                  repayment.principal_component
                                ).toLocaleString(
                                  "en-IN",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </td>

                              <td>
                                ₹
                                {Number(
                                  repayment.interest_component
                                ).toLocaleString(
                                  "en-IN",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </td>

                              <td>
                                ₹
                                {amountPaid.toLocaleString(
                                  "en-IN",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </td>

                              <td>
                                <strong>
                                  ₹
                                  {remainingAmount.toLocaleString(
                                    "en-IN",
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )}
                                </strong>
                              </td>

                              <td>
                                <span
                                  className={`schedule-status ${statusClass}`}
                                >
                                  <span className="status-dot"></span>
                                  {repayment.status}
                                </span>
                              </td>

                            </tr>
                          );
                        })}

                      </tbody>

                    </table>

                  </div>

                </section>

              </>

            )}

          </>

        )}

      </main>

    </div>
  );
}

export default RepaymentSchedule;
