\# 🏦 Bank Loan Management System



A full-stack \*\*Bank Loan Management System\*\* developed using \*\*FastAPI, React, MySQL, and SQLAlchemy\*\*.



The system manages the complete loan lifecycle, starting from customer registration and loan application through reviewer approval, loan account creation, repayment schedule generation, and online payment processing.



\---



\## 📌 Project Overview



The Bank Loan Management System provides a complete workflow for managing loan applications and loan accounts.



\### Loan Lifecycle



```text

Customer Registration

&#x20;       ↓

Loan Application Submission

&#x20;       ↓

Reviewer Approval

&#x20;       ↓

Loan Account Creation

&#x20;       ↓

Repayment Schedule Generation

&#x20;       ↓

Online Payment Processing

&#x20;       ↓

Loan Completion / Closure

```



\---



\## 🛠️ Technology Stack



| Technology           | Purpose                                     |

| -------------------- | ------------------------------------------- |

| \*\*Python\*\*           | Backend programming language                |

| \*\*FastAPI\*\*          | REST API / Backend framework                |

| \*\*React\*\*            | Frontend framework                          |

| \*\*JavaScript\*\*       | Frontend application logic                  |

| \*\*MySQL\*\*            | Relational database                         |

| \*\*SQLAlchemy\*\*       | ORM for Python ↔ MySQL database interaction |

| \*\*Pydantic\*\*         | Request and response data validation        |

| \*\*Alembic\*\*          | Database schema migrations                  |

| \*\*JWT\*\*              | Authentication                              |

| \*\*Passlib + bcrypt\*\* | Password hashing                            |

| \*\*Axios\*\*            | Frontend API calls                          |

| \*\*React Router\*\*     | Frontend navigation and routing             |

| \*\*Uvicorn\*\*          | FastAPI application server                  |

| \*\*Vite\*\*             | React development and build tool            |

| \*\*Git\*\*              | Version control                             |



\---



\## ⚙️ Main Features



\### 👤 Customer Management



\* Customer registration

\* Customer authentication

\* Secure password storage

\* JWT-based authentication

\* Customer-specific loan and application access



\### 📝 Loan Application



\* View available loan products

\* Submit loan applications

\* Track submitted applications

\* View application details and status



\### 🔍 Loan Review \& Approval



\* Reviewer access to loan applications

\* Review submitted applications

\* Approve or reject loan applications

\* Approved applications can proceed to loan account creation



\### 🏦 Loan Account



\* Create loan accounts from approved applications

\* Maintain loan account details

\* Track principal amount

\* Track outstanding principal

\* Maintain loan account status



\### 📅 Repayment Schedule



\* Generate repayment schedules for loan accounts

\* Maintain installment details

\* Track principal and interest components

\* Track amount due

\* Track amount paid

\* Track remaining amount

\* Track repayment status



\### 💳 Online Payment Processing



\* Process customer loan payments

\* Support partial payments

\* Support payments greater than the current installment

\* Automatically allocate excess payment to subsequent installments

\* Prevent skipping installments with outstanding balances

\* Update repayment status and remaining balance

\* Update loan outstanding principal

\* Automatically close the loan when all installments are completed



\---



\## 🔐 Authentication



The application uses \*\*JWT-based authentication\*\* for securing protected API endpoints.



Passwords are securely hashed using:



```text

Passlib + bcrypt

```



Role-based access is used to provide different functionality to users based on their roles.



\---



\## 🗄️ Database



The project uses \*\*MySQL\*\* as the relational database.



\*\*SQLAlchemy\*\* is used as the ORM layer between the Python application and MySQL.



Database schema changes are managed using \*\*Alembic\*\* migrations.



\### Main Database Entities



```text

Users

Customers

Loan Products

Interest Rates

Loan Applications

Loan Approvals

Loan Accounts

Repayments

Payments

```



\---



\## 🔄 Payment Flow



The payment system supports both partial and excess payments.



\### Partial Payment



Example:



```text

Installment Amount : ₹19,300

Payment            : ₹15,000



Amount Paid        : ₹15,000

Remaining Amount   : ₹4,300

Status             : Partial

```



The remaining amount can be paid later.



\### Excess Payment



Example:



```text

Installment 1 : ₹19,300

Installment 2 : ₹19,300

Installment 3 : ₹19,300



Payment       : ₹50,000

```



The system automatically allocates the payment sequentially:



```text

Installment 1 → ₹19,300 → Paid

Installment 2 → ₹19,300 → Paid

Installment 3 → ₹11,400 → Partial

Remaining     → ₹7,900

```



The system also prevents customers from directly paying a later installment while an earlier installment still has an outstanding balance.



\---



\## 📂 Project Structure



```text

bank-loan-management-system/

│

├── backend/

│   ├── alembic/

│   │   └── versions/

│   │

│   ├── app/

│   │   ├── core/

│   │   ├── db/

│   │   ├── engines/

│   │   ├── models/

│   │   ├── routers/

│   │   ├── schemas/

│   │   └── services/

│   │

│   ├── main.py

│   ├── requirements.txt

│   └── alembic.ini

│

├── frontend/

│   ├── public/

│   ├── src/

│   │   ├── assets/

│   │   ├── context/

│   │   ├── pages/

│   │   └── services/

│   │

│   ├── package.json

│   ├── package-lock.json

│   └── vite.config.js

│

├── .gitignore

└── README.md

```



\---



\## 🚀 Backend Setup



\### 1. Navigate to the backend



```bash

cd backend

```



\### 2. Create a virtual environment



```bash

python -m venv venv

```



\### 3. Activate the virtual environment



\*\*Windows:\*\*



```powershell

venv\\Scripts\\activate

```



\### 4. Install dependencies



```bash

pip install -r requirements.txt

```



\### 5. Configure MySQL



Create the required MySQL database and configure the application's database connection.



Keep database credentials and other secrets outside the Git repository.



\### 6. Run migrations



```bash

alembic upgrade head

```



\### 7. Start FastAPI



```bash

uvicorn main:app --reload

```



Backend:



```text

http://127.0.0.1:8000

```



Swagger API documentation:



```text

http://127.0.0.1:8000/docs

```



\---



\## 💻 Frontend Setup



Open another terminal and navigate to the frontend:



```bash

cd frontend

```



Install dependencies:



```bash

npm install

```



Start the development server:



```bash

npm run dev

```



Vite will display the local frontend URL in the terminal.



\---



\## 🔗 Backend ↔ Frontend



The React frontend communicates with the FastAPI backend through REST APIs.



```text

React Frontend

&#x20;     │

&#x20;     │ Axios

&#x20;     ▼

FastAPI REST API

&#x20;     │

&#x20;     │ SQLAlchemy

&#x20;     ▼

&#x20;   MySQL

```



\---



\## 🧰 Development Tools



The project uses:



\* \*\*Git\*\* for version control

\* \*\*GitHub\*\* for source-code hosting

\* \*\*Vite\*\* for frontend development

\* \*\*Uvicorn\*\* for running the FastAPI server

\* \*\*Alembic\*\* for database migrations

\* \*\*Swagger / OpenAPI\*\* for API testing and documentation



\---



\## 👨‍💻 Author



\*\*Mahesh R\*\*



B.Tech Computer Science Engineering



\---



\## 📄 Project Purpose



This project was developed as a \*\*full-stack software project\*\* to demonstrate backend API development, frontend development, relational database management, authentication, ORM usage, database migrations, and end-to-end loan management workflows.



