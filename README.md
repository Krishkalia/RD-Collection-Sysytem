# RD Collection System (Stitch)

A comprehensive investment and collection management system for RD (Recurring Deposit) operations. This project provides a unified platform for administrators, collection agents, and customers to manage deposits, plans, and commissions.

## 🚀 Features

### 🏛️ Admin Dashboard
- **Total Control**: Oversee all agents, customers, and investment plans.
- **Plan Management**: Create and customize RD plans with flexible tenure and interest rates.
- **Agent Oversight**: Assign customers to agents, track performance, and manage commission payouts.
- **Reporting**: Detailed daily reports and system analytics.

### 💼 Agent Interface
- **Collection Management**: Real-time entry of deposit collections.
- **Customer Tracking**: View assigned customers and their payment histories.
- **Commission Tracking**: Integrated ranking system (Bronze, Silver, Gold) with live commission estimation.

### 👤 Customer Portal
- **Dashboard**: Track your active RD accounts and total savings.
- **Digital Passbook**: Full transparent history of every installment paid.
- **Profile Management**: Keep your contact and KYC details up to date.

## 🛠️ Technical Stack

- **Frontend**: React (Vite), Bootstrap, Tailwind CSS, Lucide-React.
- **Backend**: Node.js, Express.
- **Database**: MongoDB (Mongoose).
- **UI Enhancements**:
  - `react-hot-toast` for real-time notifications.
  - `sweetalert2` for interactive confirmations.
  - Custom loaders and smooth transitions.

## 📦 Project Structure

```text
├── root/
│   ├── backend/          # Express.js Server & MongoDB Models
│   ├── frontend/         # React.js Frontend (Vite)
│   ├── package.json      # Unified runner (concurrently)
│   └── .gitignore        # Clean repository settings
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally or a connection string)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Krishkalia/RD-Collection-Sysytem.git
   cd RD-Collection-Sysytem
   ```

2. **Install Root Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   - Create a `.env` in the `backend` folder:
     ```env
     PORT=5000
     MONGO_URI=your_mongodb_uri
     JWT_SECRET=your_jwt_secret
     ```
   - Create a `.env` in the `frontend` folder:
     ```env
     VITE_API_URL=http://localhost:5000
     ```

### 🏃 Running the Application

You can start both the backend and frontend simultaneously from the root directory:

```bash
npm start
```
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 📄 License
This project is proprietary. All rights reserved.
