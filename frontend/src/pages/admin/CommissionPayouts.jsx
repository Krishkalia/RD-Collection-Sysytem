import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Send, History, CheckCircle, RefreshCw } from 'lucide-react';

const CommissionPayouts = () => {
  const [stats, setStats] = useState({ pending: 0, totalPaid: 0 });
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` } };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/commission/admin/stats`, config);
      setStats({
          pending: res.data.unprocessedCollections,
          totalPaid: res.data.readyForPayout
      });
      setAgents(res.data.agentSummary); 
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleGenerate = async (agentId) => {
    setProcessing(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` } };
      const date = new Date();
      await axios.post(`${import.meta.env.VITE_API_URL}/api/commission/generate`, {
        agentId,
        month: date.getMonth() + 1,
        year: date.getFullYear()
      }, config);
      alert('Commission generated successfully!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 className="text-dark fw-bold mb-1">Agent Commissions</h2>
            <p className="text-muted small mb-0">Review and process monthly payouts for agents</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
          <div className="col-md-6">
              <div className="card shadow-sm border-0 rounded-4 bg-primary text-white p-4">
                  <div className="d-flex justify-content-between align-items-center">
                      <div>
                          <p className="mb-1 opacity-75">Unprocessed Collections (This Month)</p>
                          <h3 className="fw-bold mb-0">₹{stats.pending.toLocaleString()}</h3>
                      </div>
                      <div className="bg-white bg-opacity-25 rounded-circle p-3"><DollarSign size={24} /></div>
                  </div>
              </div>
          </div>
          <div className="col-md-6">
              <div className="card shadow-sm border-0 rounded-4 bg-success text-white p-4">
                  <div className="d-flex justify-content-between align-items-center">
                      <div>
                          <p className="mb-1 opacity-75">Ready for Payout (Unpaid)</p>
                          <h3 className="fw-bold mb-0">₹{stats.totalPaid.toLocaleString()}</h3>
                      </div>
                      <div className="bg-white bg-opacity-25 rounded-circle p-3"><Send size={24} /></div>
                  </div>
              </div>
          </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="p-4 border-bottom bg-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">Active Agents Summary</h5>
            <button className="btn btn-sm btn-light rounded-pill px-3" onClick={fetchData}><RefreshCw size={14} className="me-1" /> Refresh</button>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-uppercase small fw-bold text-muted">
                <th className="ps-4">Agent Name</th>
                <th>Commission Rate</th>
                <th>Pending Collections</th>
                <th>Estimated Commission</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5"><span className="spinner-border text-primary"></span></td></tr>
              ) : agents.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-5 text-muted">No agents found</td></tr>
              ) : agents.map(agent => (
                <tr key={agent.agentId}>
                  <td className="ps-4">
                    <div className="fw-bold">{agent.name}</div>
                    <div className="small text-muted">{agent.phone}</div>
                  </td>
                  <td><span className="badge bg-info bg-opacity-10 text-info rounded-pill px-3">{agent.commissionRate}%</span></td>
                  <td className="fw-medium">₹{agent.pendingCollections.toLocaleString()}</td>
                  <td className="text-success fw-bold">₹{((agent.pendingCollections * agent.commissionRate) / 100).toLocaleString()}</td>
                  <td className="text-end pe-4">
                    {agent.isProcessed ? (
                        <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3">Processed</span>
                    ) : (
                        <button 
                            onClick={() => handleGenerate(agent.agentId)}
                            disabled={processing || agent.pendingCollections === 0}
                            className="btn btn-primary btn-sm rounded-pill px-3"
                        >
                            Generate Payout
                        </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


export default CommissionPayouts;
