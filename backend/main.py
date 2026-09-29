from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.users import router as users_router
from app.routers.customers import router as customers_router
from app.routers.loan_products import router as loan_products_router
from app.routers.interest_rates import router as interest_rates_router
from app.routers.loan_applications import router as loan_applications_router
from app.routers.loan_approvals import router as loan_approvals_router
from app.routers.loan_accounts import router as loan_accounts_router
from app.routers.repayments import router as repayments_router
from app.routers.payments import router as payments_router
from app.routers.auth import router as auth_router


app = FastAPI(
    title="Bank Loan Management System",
    description="Backend API for the Compunet Bank Loan Management System",
    version="1.0.0",
)


# Allow the React frontend to communicate with the FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(users_router)
app.include_router(customers_router)
app.include_router(loan_products_router)
app.include_router(interest_rates_router)
app.include_router(loan_applications_router)
app.include_router(loan_approvals_router)
app.include_router(loan_accounts_router)
app.include_router(repayments_router)
app.include_router(payments_router)
app.include_router(auth_router)


@app.get("/")
def root():
    return {
        "message": "Bank Loan Management System API is running",
        "version": "1.0.0",
    }