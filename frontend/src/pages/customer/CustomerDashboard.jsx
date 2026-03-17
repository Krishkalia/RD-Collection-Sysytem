import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, PieChart, Clock, ArrowUpRight } from 'lucide-react';

const CustomerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('rdToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [statsRes, transRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/customer/stats`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/api/customer/transactions`, config)
        ]);
        
        setStats(statsRes.data);
        setTransactions(transRes.data.slice(0, 5)); // Only show last 5
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>;
  }

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark fw-bold mb-0">My Dashboard</h2>
        <div className="text-muted small">Welcome back! Here's your investment summary.</div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card text-white bg-primary shadow-sm h-100 border-0 rounded-4 overflow-hidden position-relative">
            <div className="card-body p-4 position-relative z-index-1">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h6 className="text-white-50 mb-1 small fw-bold text-uppercase">Total Deposited</h6>
                  <h2 className="fw-bold mb-0">₹{stats?.totalDeposited?.toLocaleString()}</h2>
                </div>
                <div className="bg-white bg-opacity-20 p-2 rounded-3">
                  <Wallet size={24} />
                </div>
              </div>
              <div className="mt-4 pt-3 border-top border-white border-opacity-10 d-flex justify-content-between align-items-center">
                <small className="text-white-50">Active Accounts: {stats?.activeAccounts}</small>
                <button className="btn btn-link text-white text-decoration-none p-0 small fw-bold d-flex align-items-center gap-1">
                  View All <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
            <div className="position-absolute end-0 bottom-0 opacity-10 mb-n4 me-n4">
                <Wallet size={120} />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-white shadow-sm h-100 border-0 rounded-4">
            <div className="card-body p-4 text-center d-flex flex-column justify-content-center">
              <h6 className="text-muted mb-3 small fw-bold text-uppercase">Next Installment Due</h6>
              <h3 className="fw-bold text-danger mb-1">₹{stats?.nextDueAmount?.toLocaleString()}</h3>
              <p className="text-muted small mb-3">Due by: <span className="fw-bold">{stats?.nextDueDate}</span></p>
              <button disabled className="btn btn-primary-custom w-100 rounded-3">Self-Payment Coming Soon</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-white shadow-sm h-100 border-0 rounded-4">
            <div className="card-body p-4 d-flex flex-column justify-content-center">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 className="text-muted mb-0 small fw-bold text-uppercase">Expected Maturity</h6>
                <div className="bg-success bg-opacity-10 p-2 rounded-3 text-success">
                  <PieChart size={24} />
                </div>
              </div>
              <h3 className="fw-bold text-success mb-1">₹{stats?.expectedMaturity?.toLocaleString()}</h3>
              <p className="text-muted small mb-0">Projected savings across all plans</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="card-title fw-bold mb-0">Recent Activity</h5>
            <Clock size={20} className="text-muted" />
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Date</th>
                  <th>RD Account</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-4 text-muted">No recent transactions found.</td></tr>
                ) : (
                  transactions.map(tx => (
                    <tr key={tx._id}>
                      <td className="ps-3">
                        <div className="fw-bold small">{new Date(tx.collectionDate).toLocaleDateString()}</div>
                        <small className="text-muted">{new Date(tx.collectionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                      </td>
                      <td>
                        <div className="fw-bold">{tx.rdAccountId?.planId?.name || 'RD Account'}</div>
                        <small className="text-muted font-monospace">{tx.rdAccountId?.accountNumber || ''}</small>
                      </td>
                      <td className="fw-bold text-success">+ ₹{tx.amount?.toLocaleString()}</td>
                      <td><span className="badge bg-light text-dark border text-capitalize">{tx.paymentMode}</span></td>
                      <td>
                        <span className={`badge border px-3 rounded-pill ${tx.status === 'confirmed' ? 'bg-success-subtle text-success border-success-subtle' : 'bg-warning-subtle text-warning border-warning-subtle'}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
