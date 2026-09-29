import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loanProducts, setLoanProducts] = useState([]);
  const [interestRates, setInterestRates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loanAccounts, setLoanAccounts] = useState([]);
  const [repayments, setRepayments] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        usersResponse,
        productsResponse,
        ratesResponse,
        applicationsResponse,
        accountsResponse,
        repaymentsResponse,
        paymentsResponse,
      ] = await Promise.all([
        api.get("/users/"),
        api.get("/loan-products/"),
        api.get("/interest-rates/"),
        api.get("/loan-applications/"),
        api.get("/loan-accounts/"),
        api.get("/repayments/"),
        api.get("/payments/"),
      ]);

      setUsers(usersResponse.data);
      setLoanProducts(productsResponse.data);
      setInterestRates(ratesResponse.data);
      setApplications(applicationsResponse.data);
      setLoanAccounts(accountsResponse.data);
      setRepayments(repaymentsResponse.data);
      setPayments(paymentsResponse.data);
    } catch (err) {
      console.error("Admin dashboard error:", err);

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail.map((item) => item.msg || "Validation error").join(", ")
        );
      } else {
        setError(detail || "Failed to load admin dashboard.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleUserStatus = async (userId, currentStatus) => {
    setMessage("");
    setError("");

    try {
      await api.patch(`/users/${userId}/status`, {
        is_active: !currentStatus,
      });

      setMessage(
        `User ${!currentStatus ? "activated" : "deactivated"} successfully.`
      );

      await loadDashboard();
    } catch (err) {
      console.error(err);

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail.map((item) => item.msg || "Validation error").join(", ")
        );
      } else {
        setError(detail || "Unable to update user status.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const formatCurrency = (value, decimals = false) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: decimals ? 2 : 0,
      maximumFractionDigits: decimals ? 2 : 0,
    })}`;

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString("en-IN") : "-";

  const formatDateTime = (value) =>
    value ? new Date(value).toLocaleString("en-IN") : "-";

  const statusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (["approved", "active", "paid", "successful"].includes(value)) {
      return "admin-status admin-status-success";
    }

    if (["submitted", "pending", "processing"].includes(value)) {
      return "admin-status admin-status-warning";
    }

    if (
      ["rejected", "declined", "overdue", "failed", "inactive"].includes(
        value
      )
    ) {
      return "admin-status admin-status-danger";
    }

    return "admin-status admin-status-neutral";
  };

  if (loading) {
    return (
      <div className="admin-loading-page">
        <div className="admin-loading-spinner"></div>
        <h2>Loading Admin Console</h2>
        <p>Preparing your banking operations dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* SIDEBAR */}

      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">C</div>

          <div>
            <h2>COMPUNET</h2>
            <span>Banking Operations</span>
          </div>
        </div>

        <div className="admin-profile">
          <div className="admin-profile-avatar">A</div>

          <div>
            <strong>Administrator</strong>
            <span>System Manager</span>
          </div>
        </div>

        <nav className="admin-nav">
          <span className="admin-nav-label">OPERATIONS</span>

          <button className="admin-nav-item active">
            <span>▦</span>
            Dashboard
          </button>

          <button
            className="admin-nav-item"
            onClick={() =>
              document
                .getElementById("users-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <span>◉</span>
            Users
          </button>

          <button
            className="admin-nav-item"
            onClick={() =>
              document
                .getElementById("products-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <span>▣</span>
            Loan Products
          </button>

          <button
            className="admin-nav-item"
            onClick={() =>
              document
                .getElementById("applications-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <span>▤</span>
            Applications
          </button>

          <button
            className="admin-nav-item"
            onClick={() =>
              document
                .getElementById("accounts-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <span>◫</span>
            Loan Accounts
          </button>

          <button
            className="admin-nav-item"
            onClick={() =>
              document
                .getElementById("payments-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <span>₹</span>
            Payments
          </button>
        </nav>

        <div className="admin-sidebar-bottom">
          <button className="admin-logout" onClick={handleLogout}>
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-top-label">ADMINISTRATION</span>
            <h1>Banking Operations Dashboard</h1>
            <p>
              Monitor customers, lending activity, repayments and payments.
            </p>
          </div>

          <div className="admin-top-actions">
            <button
              className="admin-refresh-button"
              onClick={loadDashboard}
            >
              ↻ Refresh
            </button>

            <div className="admin-top-avatar">A</div>
          </div>
        </header>

        {/* ALERTS */}

        {message && (
          <div className="admin-alert admin-alert-success">
            <span>✓</span>
            <div>
              <strong>Operation completed</strong>
              <p>{message}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="admin-alert admin-alert-error">
            <span>!</span>
            <div>
              <strong>Unable to load dashboard</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* KPI CARDS */}

        <section className="admin-kpi-grid">
          <div className="admin-kpi-card">
            <div className="admin-kpi-icon users-icon">◉</div>
            <div>
              <span>Total Users</span>
              <strong>{users.length}</strong>
              <small>Registered system users</small>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="admin-kpi-icon product-icon">▣</div>
            <div>
              <span>Loan Products</span>
              <strong>{loanProducts.length}</strong>
              <small>Configured products</small>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="admin-kpi-icon application-icon">▤</div>
            <div>
              <span>Applications</span>
              <strong>{applications.length}</strong>
              <small>Loan applications</small>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="admin-kpi-icon account-icon">◫</div>
            <div>
              <span>Loan Accounts</span>
              <strong>{loanAccounts.length}</strong>
              <small>Active loan records</small>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="admin-kpi-icon repayment-icon">↻</div>
            <div>
              <span>Repayments</span>
              <strong>{repayments.length}</strong>
              <small>Scheduled installments</small>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="admin-kpi-icon payment-icon">₹</div>
            <div>
              <span>Payments</span>
              <strong>{payments.length}</strong>
              <small>Recorded transactions</small>
            </div>
          </div>
        </section>

        {/* SYSTEM OVERVIEW */}

        <section className="admin-section">
          <div className="admin-section-heading">
            <div>
              <span>SYSTEM MONITORING</span>
              <h2>System Overview</h2>
              <p>Current records across the banking management system.</p>
            </div>
          </div>

          <div className="overview-grid">
            <div className="overview-item">
              <span>Users</span>
              <strong>{users.length}</strong>
            </div>

            <div className="overview-item">
              <span>Loan Products</span>
              <strong>{loanProducts.length}</strong>
            </div>

            <div className="overview-item">
              <span>Interest Rates</span>
              <strong>{interestRates.length}</strong>
            </div>

            <div className="overview-item">
              <span>Applications</span>
              <strong>{applications.length}</strong>
            </div>

            <div className="overview-item">
              <span>Loan Accounts</span>
              <strong>{loanAccounts.length}</strong>
            </div>

            <div className="overview-item">
              <span>Repayments</span>
              <strong>{repayments.length}</strong>
            </div>

            <div className="overview-item">
              <span>Payments</span>
              <strong>{payments.length}</strong>
            </div>
          </div>
        </section>

        {/* USERS */}

        <section className="admin-section" id="users-section">
          <div className="admin-section-heading">
            <div>
              <span>CUSTOMER MANAGEMENT</span>
              <h2>Users</h2>
              <p>Manage registered system users and account status.</p>
            </div>

            <div className="section-count">{users.length} records</div>
          </div>

          <div className="admin-table-card">
            {users.length === 0 ? (
              <div className="admin-empty">No users found.</div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>#{user.id}</td>

                        <td>
                          <div className="table-user">
                            <div className="table-user-avatar">
                              {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                            </div>

                            <strong>{user.full_name}</strong>
                          </div>
                        </td>

                        <td>{user.email}</td>

                        <td>
                          <span className="role-badge">
                            {user.role}
                          </span>
                        </td>

                        <td>
                          <span
                            className={statusClass(
                              user.is_active ? "active" : "inactive"
                            )}
                          >
                            <span className="status-dot"></span>
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td>{formatDate(user.created_at)}</td>

                        <td>
                          <button
                            className={`user-action-button ${
                              user.is_active ? "deactivate" : "activate"
                            }`}
                            onClick={() =>
                              handleUserStatus(user.id, user.is_active)
                            }
                          >
                            {user.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* LOAN PRODUCTS */}

        <section className="admin-section" id="products-section">
          <div className="admin-section-heading">
            <div>
              <span>PRODUCT CONFIGURATION</span>
              <h2>Loan Products</h2>
              <p>Configured lending products and their limits.</p>
            </div>

            <div className="section-count">
              {loanProducts.length} products
            </div>
          </div>

          <div className="admin-table-card">
            {loanProducts.length === 0 ? (
              <div className="admin-empty">No loan products found.</div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Product</th>
                      <th>Minimum</th>
                      <th>Maximum</th>
                      <th>Tenure</th>
                      <th>Base Rate</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loanProducts.map((product) => (
                      <tr key={product.id}>
                        <td>#{product.id}</td>

                        <td>
                          <div className="product-name">
                            <strong>{product.product_name}</strong>
                            <span>{product.product_code}</span>
                          </div>
                        </td>

                        <td>{formatCurrency(product.min_loan_amount)}</td>

                        <td>{formatCurrency(product.max_loan_amount)}</td>

                        <td>
                          {product.min_tenure_months} -{" "}
                          {product.max_tenure_months} months
                        </td>

                        <td>{product.base_interest_rate}%</td>

                        <td>
                          <span
                            className={statusClass(
                              product.is_active ? "active" : "inactive"
                            )}
                          >
                            <span className="status-dot"></span>
                            {product.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* INTEREST RATES */}

        <section className="admin-section">
          <div className="admin-section-heading">
            <div>
              <span>RATE MANAGEMENT</span>
              <h2>Interest Rates</h2>
              <p>Current configured interest rate records.</p>
            </div>

            <div className="section-count">
              {interestRates.length} rates
            </div>
          </div>

          <div className="admin-table-card">
            {interestRates.length === 0 ? (
              <div className="admin-empty">No interest rates found.</div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Loan Product ID</th>
                      <th>Annual Rate</th>
                      <th>Effective From</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {interestRates.map((rate) => (
                      <tr key={rate.id}>
                        <td>#{rate.id}</td>
                        <td>Product #{rate.loan_product_id}</td>
                        <td>
                          <strong className="rate-value">
                            {rate.annual_rate}%
                          </strong>
                        </td>
                        <td>{formatDate(rate.effective_from)}</td>
                        <td>
                          <span
                            className={statusClass(
                              rate.is_active ? "active" : "inactive"
                            )}
                          >
                            <span className="status-dot"></span>
                            {rate.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* APPLICATIONS */}

        <section className="admin-section" id="applications-section">
          <div className="admin-section-heading">
            <div>
              <span>LOAN PROCESSING</span>
              <h2>Loan Applications</h2>
              <p>Review the current application records.</p>
            </div>

            <div className="section-count">
              {applications.length} applications
            </div>
          </div>

          <div className="admin-table-card">
            {applications.length === 0 ? (
              <div className="admin-empty">
                No loan applications found.
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Application</th>
                      <th>Customer</th>
                      <th>Product</th>
                      <th>Amount</th>
                      <th>Tenure</th>
                      <th>Status</th>
                      <th>Applied</th>
                    </tr>
                  </thead>

                  <tbody>
                    {applications.map((application) => (
                      <tr key={application.id}>
                        <td>#{application.id}</td>

                        <td>
                          <strong>
                            {application.application_number}
                          </strong>
                        </td>

                        <td>Customer #{application.customer_id}</td>

                        <td>Product #{application.loan_product_id}</td>

                        <td>
                          <strong>
                            {formatCurrency(application.requested_amount)}
                          </strong>
                        </td>

                        <td>
                          {application.requested_tenure_months} months
                        </td>

                        <td>
                          <span className={statusClass(application.status)}>
                            <span className="status-dot"></span>
                            {application.status}
                          </span>
                        </td>

                        <td>{formatDate(application.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* LOAN ACCOUNTS */}

        <section className="admin-section" id="accounts-section">
          <div className="admin-section-heading">
            <div>
              <span>ACCOUNT MANAGEMENT</span>
              <h2>Loan Accounts</h2>
              <p>Monitor disbursed loan accounts and balances.</p>
            </div>

            <div className="section-count">
              {loanAccounts.length} accounts
            </div>
          </div>

          <div className="admin-table-card">
            {loanAccounts.length === 0 ? (
              <div className="admin-empty">
                No loan accounts found.
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Account</th>
                      <th>Application</th>
                      <th>Principal</th>
                      <th>Rate</th>
                      <th>Tenure</th>
                      <th>Outstanding</th>
                      <th>Status</th>
                      <th>Maturity</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loanAccounts.map((account) => (
                      <tr key={account.id}>
                        <td>#{account.id}</td>

                        <td>
                          <strong>
                            {account.account_number || "-"}
                          </strong>
                        </td>

                        <td>#{account.application_id}</td>

                        <td>
                          {formatCurrency(account.principal_amount)}
                        </td>

                        <td>{account.annual_interest_rate}%</td>

                        <td>{account.tenure_months} months</td>

                        <td>
                          <strong>
                            {formatCurrency(
                              account.outstanding_principal
                            )}
                          </strong>
                        </td>

                        <td>
                          <span className={statusClass(account.status)}>
                            <span className="status-dot"></span>
                            {account.status}
                          </span>
                        </td>

                        <td>{formatDate(account.maturity_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* REPAYMENTS */}

        <section className="admin-section">
          <div className="admin-section-heading">
            <div>
              <span>REPAYMENT MONITORING</span>
              <h2>Repayments</h2>
              <p>Track scheduled installments and payment status.</p>
            </div>

            <div className="section-count">
              {repayments.length} repayments
            </div>
          </div>

          <div className="admin-table-card">
            {repayments.length === 0 ? (
              <div className="admin-empty">
                No repayments found.
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Account</th>
                      <th>Installment</th>
                      <th>Due Date</th>
                      <th>Amount Due</th>
                      <th>Principal</th>
                      <th>Interest</th>
                      <th>Paid</th>
                      <th>Status</th>
                      <th>Paid Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {repayments.map((repayment) => (
                      <tr key={repayment.id}>
                        <td>#{repayment.id}</td>

                        <td>Account #{repayment.loan_account_id}</td>

                        <td>
                          #{repayment.installment_number}
                        </td>

                        <td>{formatDate(repayment.due_date)}</td>

                        <td>
                          <strong>
                            {formatCurrency(repayment.amount_due)}
                          </strong>
                        </td>

                        <td>
                          {formatCurrency(
                            repayment.principal_component
                          )}
                        </td>

                        <td>
                          {formatCurrency(
                            repayment.interest_component
                          )}
                        </td>

                        <td>
                          {formatCurrency(repayment.amount_paid)}
                        </td>

                        <td>
                          <span className={statusClass(repayment.status)}>
                            <span className="status-dot"></span>
                            {repayment.status}
                          </span>
                        </td>

                        <td>{formatDate(repayment.paid_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* PAYMENTS */}

        <section className="admin-section" id="payments-section">
          <div className="admin-section-heading">
            <div>
              <span>TRANSACTION MONITORING</span>
              <h2>Payments</h2>
              <p>Monitor recorded customer payment transactions.</p>
            </div>

            <div className="section-count">
              {payments.length} payments
            </div>
          </div>

          <div className="admin-table-card">
            {payments.length === 0 ? (
              <div className="admin-empty">
                No payments found.
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Repayment</th>
                      <th>Loan Account</th>
                      <th>Amount</th>
                      <th>Payment Date</th>
                      <th>Method</th>
                      <th>Reference</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>#{payment.id}</td>

                        <td>#{payment.repayment_id}</td>

                        <td>#{payment.loan_account_id}</td>

                        <td>
                          <strong>
                            {formatCurrency(payment.amount, true)}
                          </strong>
                        </td>

                        <td>{formatDate(payment.payment_date)}</td>

                        <td>
                          <span className="method-badge">
                            {payment.payment_method || "-"}
                          </span>
                        </td>

                        <td>
                          <span className="reference-value">
                            {payment.reference_number || "-"}
                          </span>
                        </td>

                        <td>
                          <span className={statusClass(payment.status)}>
                            <span className="status-dot"></span>
                            {payment.status || "-"}
                          </span>
                        </td>

                        <td>{formatDateTime(payment.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <footer className="admin-footer">
          <span>COMPUNET Digital Banking</span>
          <span>Bank Loan Management System • Admin Console</span>
        </footer>
      </main>
    </div>
  );
}

export default AdminDashboard;
