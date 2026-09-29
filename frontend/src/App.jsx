import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import CustomerDashboard from "./pages/CustomerDashboard";
import ApplyLoan from "./pages/ApplyLoan";
import MyApplications from "./pages/MyApplications";
import MyLoanAccounts from "./pages/MyLoanAccounts";
import RepaymentSchedule from "./pages/RepaymentSchedule";
import MakePayment from "./pages/MakePayment";
import ReviewerDashboard from "./pages/ReviewerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import { AuthProvider, useAuth } from "./context/AuthContext";


function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}


function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  const getHomeRoute = () => {
    if (!isAuthenticated) {
      return "/login";
    }

    if (user?.role === "admin") {
      return "/admin";
    }

    if (user?.role === "reviewer") {
      return "/reviewer";
    }

    return "/customer";
  };


  return (
    <Routes>

      {/* Home */}
      <Route
        path="/"
        element={<Navigate to={getHomeRoute()} replace />}
      />


      {/* Login */}
      <Route
        path="/login"
        element={<Login />}
      />


      {/* Customer Dashboard */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />


      {/* Apply for Loan */}
      <Route
        path="/apply-loan"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <ApplyLoan />
          </ProtectedRoute>
        }
      />


      {/* My Applications */}
      <Route
        path="/my-applications"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <MyApplications />
          </ProtectedRoute>
        }
      />


      {/* My Loan Accounts */}
      <Route
        path="/my-loan-accounts"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <MyLoanAccounts />
          </ProtectedRoute>
        }
      />


      {/* Repayment Schedule */}
      <Route
        path="/repayment-schedule"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <RepaymentSchedule />
          </ProtectedRoute>
        }
      />


      {/* Make Payment */}
      <Route
        path="/make-payment"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <MakePayment />
          </ProtectedRoute>
        }
      />


      {/* Reviewer Dashboard */}
      <Route
        path="/reviewer"
        element={
          <ProtectedRoute allowedRoles={["reviewer", "admin"]}>
            <ReviewerDashboard />
          </ProtectedRoute>
        }
      />


      {/* Admin Dashboard */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />


      {/* Unknown URL */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}


export default App;