import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./MakePayment.css";

function MakePayment() {
  const navigate = useNavigate();

  const [loanAccounts, setLoanAccounts] = useState([]);
  const [repayments, setRepayments] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedRepayment, setSelectedRepayment] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [accountsResponse, repaymentsResponse] = await Promise.all([
          api.get("/loan-accounts/my"),
          api.get("/repayments/my"),
        ]);

        setLoanAccounts(accountsResponse.data);
        setRepayments(repaymentsResponse.data);

        const activeAccounts = accountsResponse.data.filter(
          (account) => account.status?.toLowerCase() === "active"
        );

        if (activeAccounts.length > 0) {
          setSelectedAccount(String(activeAccounts[0].id));
        }
      } catch (err) {
        console.error("Failed to load payment data:", err);

        setError(
          err.response?.data?.detail ||
            "Unable to load payment information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Only active loan accounts can be used for payments.
  const activeLoanAccounts = loanAccounts.filter(
    (account) => account.status?.toLowerCase() === "active"
  );

  // Show all unpaid installments, including partial installments.
  // Paid installments are excluded.
  const pendingRepayments = repayments.filter(
    (repayment) =>
      String(repayment.loan_account_id) === String(selectedAccount) &&
      repayment.status !== "paid"
  );

  // Calculate the actual amount still required for an installment.
  const getRemainingAmount = (repayment) => {
    return Math.max(
      Number(repayment.amount_due) - Number(repayment.amount_paid || 0),
      0
    );
  };

  useEffect(() => {
    if (pendingRepayments.length > 0) {
      const repayment = pendingRepayments[0];

      setSelectedRepayment(String(repayment.id));
      setAmount(getRemainingAmount(repayment).toFixed(2));
    } else {
      setSelectedRepayment("");
      setAmount("");
    }
  }, [selectedAccount, repayments]);

  const handleRepaymentChange = (event) => {
    const repaymentId = event.target.value;

    setSelectedRepayment(repaymentId);

    const repayment = repayments.find(
      (item) => String(item.id) === repaymentId
    );

    if (repayment) {
      setAmount(getRemainingAmount(repayment).toFixed(2));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const response = await api.post("/payments/", {
        repayment_id: Number(selectedRepayment),
        loan_account_id: Number(selectedAccount),
        amount: Number(amount),
        payment_date: new Date().toISOString().split("T")[0],
        payment_method: paymentMethod,
        reference_number: referenceNumber,
      });

      setMessage(
        `Payment successful! Payment ID: ${response.data.id}`
      );

      setReferenceNumber("");

      const [accountsResponse, repaymentsResponse] = await Promise.all([
        api.get("/loan-accounts/my"),
        api.get("/repayments/my"),
      ]);

      setLoanAccounts(accountsResponse.data);
      setRepayments(repaymentsResponse.data);

      const activeAccounts = accountsResponse.data.filter(
        (account) => account.status?.toLowerCase() === "active"
      );

      if (
        activeAccounts.length > 0 &&
        !activeAccounts.some(
          (account) => String(account.id) === String(selectedAccount)
        )
      ) {
        setSelectedAccount(String(activeAccounts[0].id));
      }
    } catch (err) {
      console.error("Payment failed:", err);

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail.map((item) => item.msg || "Validation error").join(", ")
        );
      } else {
        setError(detail || "Payment failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-page">
        <div className="payment-loading">
          <div className="payment-spinner"></div>
          <h3>Loading Payment</h3>
          <p>Please wait while we load your loan information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">

      {/* Header */}

      <header className="payment-header">

        <div className="payment-brand">

          <div className="payment-brand-icon">
            C
          </div>

          <div>
            <h2>COMPUNET</h2>
            <span>Digital Banking</span>
          </div>

        </div>

        <button
          className="payment-dashboard-button"
          onClick={() => navigate("/customer")}
        >
          ← Dashboard
        </button>

      </header>


      {/* Main */}

      <main className="payment-main">

        {/* Page heading */}

        <div className="payment-page-heading">

          <div>

            <span className="payment-eyebrow">
              REPAYMENT SERVICES
            </span>

            <h1>Make Payment</h1>

            <p>
              Make a secure payment towards your outstanding
              loan installment.
            </p>

          </div>

          <div className="secure-badge">
            <span>✓</span>
            Secure Payment
          </div>

        </div>


        {/* Success */}

        {message && (
          <div className="payment-alert payment-success">

            <div className="alert-icon">
              ✓
            </div>

            <div>
              <strong>Payment Successful</strong>
              <p>{message}</p>
            </div>

          </div>
        )}


        {/* Error */}

        {error && (
          <div className="payment-alert payment-error">

            <div className="alert-icon">
              !
            </div>

            <div>
              <strong>Payment Could Not Be Processed</strong>
              <p>{error}</p>
            </div>

          </div>
        )}


        {activeLoanAccounts.length === 0 ? (

          <section className="payment-empty">

            <div className="empty-icon">
              🏦
            </div>

            <h2>No Active Loan Accounts</h2>

            <p>
              You don't have any active loan accounts
              available for payment.
            </p>

            <button
              className="primary-payment-button"
              onClick={() => navigate("/apply-loan")}
            >
              Apply for a Loan
              <span>→</span>
            </button>

          </section>

        ) : (

          <div className="payment-grid">

            {/* Left - Payment Form */}

            <section className="payment-card">

              <div className="payment-card-heading">

                <div className="payment-card-icon">
                  ₹
                </div>

                <div>
                  <span>LOAN REPAYMENT</span>
                  <h2>Payment Details</h2>
                </div>

              </div>


              <div className="card-divider"></div>


              <form
                className="payment-form"
                onSubmit={handleSubmit}
              >

                {/* Account */}

                <div className="payment-field">

                  <label htmlFor="loanAccount">
                    Loan Account
                  </label>

                  <select
                    id="loanAccount"
                    value={selectedAccount}
                    onChange={(event) =>
                      setSelectedAccount(event.target.value)
                    }
                    required
                  >

                    {activeLoanAccounts.map((account) => (
                      <option
                        key={account.id}
                        value={account.id}
                      >
                        {account.account_number} - ₹
                        {Number(
                          account.principal_amount
                        ).toLocaleString("en-IN")}
                      </option>
                    ))}

                  </select>

                </div>


                {pendingRepayments.length === 0 ? (

                  <div className="no-pending-payment">

                    <div className="no-pending-icon">
                      ✓
                    </div>

                    <h3>No Pending Repayments</h3>

                    <p>
                      There are no pending installments
                      for this loan account.
                    </p>

                  </div>

                ) : (

                  <>

                    {/* Installment */}

                    <div className="payment-field">

                      <label htmlFor="repayment">
                        Select Installment
                      </label>

                      <select
                        id="repayment"
                        value={selectedRepayment}
                        onChange={handleRepaymentChange}
                        required
                      >

                        {pendingRepayments.map((repayment) => {

                          const remainingAmount =
                            getRemainingAmount(repayment);

                          return (
                            <option
                              key={repayment.id}
                              value={repayment.id}
                            >
                              Installment{" "}
                              {repayment.installment_number} - ₹
                              {remainingAmount.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                              {repayment.status === "partial"
                                ? " (Remaining)"
                                : ""}
                            </option>
                          );
                        })}

                      </select>

                    </div>


                    {/* Remaining Amount + Method */}

                    <div className="payment-two-columns">

                      <div className="payment-field">

                        <label htmlFor="amount">
                          Amount to Pay
                        </label>

                        <div className="payment-amount-input">

                          <span>₹</span>

                          <input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={amount}
                            onChange={(event) =>
                              setAmount(event.target.value)
                            }
                            required
                          />

                        </div>

                        {(() => {
                          const repayment = repayments.find(
                            (item) =>
                              String(item.id) ===
                              String(selectedRepayment)
                          );

                          if (
                            repayment &&
                            repayment.status === "partial"
                          ) {
                            return (
                              <small>
                                Original EMI: ₹
                                {Number(
                                  repayment.amount_due
                                ).toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                                {" • "}
                                Already paid: ₹
                                {Number(
                                  repayment.amount_paid || 0
                                ).toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </small>
                            );
                          }

                          return null;
                        })()}

                      </div>


                      <div className="payment-field">

                        <label htmlFor="paymentMethod">
                          Payment Method
                        </label>

                        <select
                          id="paymentMethod"
                          value={paymentMethod}
                          onChange={(event) =>
                            setPaymentMethod(event.target.value)
                          }
                        >

                          <option value="UPI">
                            UPI
                          </option>

                          <option value="Bank Transfer">
                            Bank Transfer
                          </option>

                          <option value="Cash">
                            Cash
                          </option>

                          <option value="Card">
                            Card
                          </option>

                        </select>

                      </div>

                    </div>


                    {/* Reference */}

                    <div className="payment-field">

                      <label htmlFor="referenceNumber">
                        Reference Number
                      </label>

                      <input
                        id="referenceNumber"
                        type="text"
                        value={referenceNumber}
                        onChange={(event) =>
                          setReferenceNumber(event.target.value)
                        }
                        placeholder="Enter payment reference"
                        required
                      />

                      <small>
                        Enter the reference number provided by
                        your payment method.
                      </small>

                    </div>


                    {/* Submit */}

                    <button
                      type="submit"
                      className="submit-payment-button"
                      disabled={submitting}
                    >

                      {submitting ? (
                        <>
                          <span className="button-spinner"></span>
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          Make Payment
                          <span>→</span>
                        </>
                      )}

                    </button>

                  </>

                )}

              </form>

            </section>


            {/* Right - Information */}

            <aside className="payment-guide-card">

              <div className="guide-header">

                <div className="guide-shield">
                  ✓
                </div>

                <div>
                  <h2>Secure Payment</h2>

                  <p>
                    Your payment information is
                    securely processed.
                  </p>
                </div>

              </div>


              <div className="guide-divider"></div>


              <div className="guide-steps">

                <div className="guide-step">

                  <div className="step-number">
                    01
                  </div>

                  <div className="step-content">
                    <h3>Select Account</h3>

                    <p>
                      Choose the loan account you
                      want to make a payment for.
                    </p>
                  </div>

                </div>


                <div className="guide-step">

                  <div className="step-number">
                    02
                  </div>

                  <div className="step-content">
                    <h3>Select Installment</h3>

                    <p>
                      Choose one of your pending
                      installments.
                    </p>
                  </div>

                </div>


                <div className="guide-step">

                  <div className="step-number">
                    03
                  </div>

                  <div className="step-content">
                    <h3>Complete Payment</h3>

                    <p>
                      Enter your payment details
                      and submit securely.
                    </p>
                  </div>

                </div>

              </div>


              <div className="guide-note">

                <span>ⓘ</span>

                <p>
                  Please verify your payment details
                  before submitting.
                </p>

              </div>

            </aside>

          </div>

        )}

      </main>

    </div>
  );
}

export default MakePayment;
