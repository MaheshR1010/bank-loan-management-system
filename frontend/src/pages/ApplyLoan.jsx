import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import "./ApplyLoan.css";

function ApplyLoan() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loanProducts, setLoanProducts] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [amount, setAmount] = useState("");
  const [tenure, setTenure] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [customerResponse, productsResponse] = await Promise.all([
          api.get("/customers/me"),
          api.get("/loan-products/"),
        ]);

        setCustomer(customerResponse.data);
        setLoanProducts(productsResponse.data);
      } catch (err) {
        console.error("Failed to load data:", err);

        setError(
          err.response?.data?.detail ||
            "Unable to load customer or loan product information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      await api.post("/loan-applications/", {
        customer_id: customer.id,
        loan_product_id: Number(selectedProduct),
        requested_amount: Number(amount),
        requested_tenure_months: Number(tenure),
      });

      setMessage("Loan application submitted successfully.");

      setSelectedProduct("");
      setAmount("");
      setTenure("");
    } catch (err) {
      console.error("Loan application error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to submit the loan application."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="apply-loan-page">
        <div className="apply-loan-loading">
          <div className="apply-loading-spinner"></div>
          <p>Loading loan application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-loan-page">
      <header className="apply-loan-header">
        <div className="apply-loan-brand">
          <div className="apply-loan-brand-icon">C</div>

          <div>
            <h2>COMPUNET</h2>
            <span>Digital Banking</span>
          </div>
        </div>

        <button
          className="apply-back-button"
          onClick={() => navigate("/customer")}
        >
          ← Dashboard
        </button>
      </header>

      <main className="apply-loan-content">
        <section className="apply-loan-intro">
          <div>
            <span className="apply-page-label">LOAN SERVICES</span>

            <h1>Apply for a Loan</h1>

            <p>
              Choose a loan product, enter your required amount and
              repayment tenure to submit your application.
            </p>
          </div>

          <div className="apply-intro-icon">
            ₹
          </div>
        </section>

        {message && (
          <div className="apply-message">
            <div className="apply-message-icon">✓</div>

            <div>
              <strong>Application Submitted</strong>
              <p>{message}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="apply-error">
            <div className="apply-error-icon">!</div>

            <div>
              <strong>Unable to process application</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="apply-loan-layout">
          <section className="loan-form-card">
            <div className="loan-form-header">
              <div className="loan-form-icon">₹</div>

              <div>
                <span>APPLICATION DETAILS</span>
                <h2>Loan Information</h2>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="loanProduct">
                  Loan Product
                </label>

                <select
                  id="loanProduct"
                  value={selectedProduct}
                  onChange={(event) =>
                    setSelectedProduct(event.target.value)
                  }
                  required
                >
                  <option value="">
                    Select Loan Product
                  </option>

                  {loanProducts.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.product_code} - {product.product_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="amount">
                    Loan Amount
                  </label>

                  <div className="input-with-symbol">
                    <span>₹</span>

                    <input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(event) =>
                        setAmount(event.target.value)
                      }
                      placeholder="Enter loan amount"
                      min="1"
                      required
                    />
                  </div>

                  <small>
                    Enter the amount you wish to borrow.
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="tenure">
                    Tenure
                  </label>

                  <div className="input-with-suffix">
                    <input
                      id="tenure"
                      type="number"
                      value={tenure}
                      onChange={(event) =>
                        setTenure(event.target.value)
                      }
                      placeholder="Enter tenure"
                      min="1"
                      required
                    />

                    <span>Months</span>
                  </div>

                  <small>
                    Choose your preferred repayment period.
                  </small>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => navigate("/customer")}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-loan-button"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="button-spinner"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          <aside className="loan-info-card">
            <div className="loan-info-icon">✓</div>

            <h3>Before You Apply</h3>

            <div className="loan-info-item">
              <span>01</span>
              <p>
                Select the loan product that matches your
                financial requirement.
              </p>
            </div>

            <div className="loan-info-item">
              <span>02</span>
              <p>
                Enter the amount and repayment tenure you
                require.
              </p>
            </div>

            <div className="loan-info-item">
              <span>03</span>
              <p>
                Submit your application for review by the
                loan team.
              </p>
            </div>

            <div className="loan-security-note">
              <span>🔒</span>
              <p>
                Your application information is securely
                processed by COMPUNET Digital Banking.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default ApplyLoan;
