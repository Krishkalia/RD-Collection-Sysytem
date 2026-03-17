import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, CreditCard, User, Calendar, CheckCircle, XCircle, Download, UserCheck, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ManageAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [agents, setAgents] = useState([]);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [newAgentId, setNewAgentId] = useState('');

  useEffect(() => {
    fetchAccounts();
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` } };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/agents`, config);
      setAgents(res.data);
    } catch (err) {
      console.error('Failed to fetch agents', err);
    }
  };

  const fetchAccounts = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` } };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/accounts`, config);
      setAccounts(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.customerId?.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const [showPassbook, setShowPassbook] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [passbookData, setPassbookData] = useState([]);
  const [passbookLoading, setPassbookLoading] = useState(false);

  const viewPassbook = async (acc) => {
    setSelectedAccount(acc);
    setShowPassbook(true);
    setPassbookLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` } };
      // Build dummy endpoint check or use customer transactions but with admin auth
      // Let's check admin routes if we have this. If not, we might need a new one.
      // For now, let's use a generic fetch since we need history for specifically this account.
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/accounts/${acc._id}/history`, config);
      setPassbookData(res.data);
    } catch (err) {
      console.error(err);
      setPassbookData([]);
    } finally {
      setPassbookLoading(false);
    }
  };

  const handleExportPassbook = () => {
    if (passbookData.length === 0) return toast.error('No data to export');
    const headers = ['Date', 'Installment #', 'Amount', 'Mode', 'Status'];
    const rows = passbookData.map(tx => [
        new Date(tx.collectionDate).toLocaleDateString(),
        tx.installmentNumber,
        tx.amount,
        tx.paymentMode,
        tx.status
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Passbook_${selectedAccount.accountNumber}.csv`;
    link.click();
  };

  const handleUpdateAgent = async (e) => {
    e.preventDefault();
    if (!newAgentId) return toast.error('Please select an agent');
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` } };
      await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/accounts/${selectedAccount._id}/agent`, { agentId: newAgentId }, config);
      toast.success('Agent reassigned successfully');
      setShowAgentModal(false);
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reassign agent');
    }
  };

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark fw-bold mb-0">RD Accounts</h2>
        <div className="d-flex gap-2">
            <div className="position-relative">
                <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                <input 
                    type="text" 
                    className="form-control ps-5 bg-white border-0 shadow-sm" 
                    placeholder="Search accounts..." 
                    style={{borderRadius: '10px', width: '300px'}}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button className="btn btn-white shadow-sm d-flex align-items-center gap-2" style={{borderRadius: '10px'}}>
                <Filter size={18} /> Filter
            </button>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-uppercase small fw-bold text-muted">
                <th className="ps-4">Account Number</th>
                <th>Customer</th>
                <th>Plan Name</th>
                <th>Assigned Agent</th>
                <th>Deposited / Maturity</th>
                <th>Status</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-5"><span className="spinner-border text-primary"></span></td></tr>
              ) : filteredAccounts.length > 0 ? (
                filteredAccounts.map(acc => (
                  <tr key={acc._id}>
                    <td className="ps-4 fw-bold text-primary">{acc.accountNumber}</td>
                    <td>
                        <div className="d-flex align-items-center gap-2">
                            <div className="bg-light rounded-circle p-2"><User size={14} className="text-primary" /></div>
                            <span className="fw-medium">{acc.customerId?.userId?.name}</span>
                        </div>
                    </td>
                    <td>{acc.planId?.name}</td>
                    <td>
                        <div className="d-flex align-items-center gap-2">
                             <span className="small fw-medium">{acc.agentId?.userId?.name || 'Unassigned'}</span>
                             <button 
                                onClick={() => { setSelectedAccount(acc); setNewAgentId(acc.agentId?._id || ''); setShowAgentModal(true); }}
                                className="btn btn-link p-0 text-muted" title="Change Agent"
                             >
                                <RefreshCw size={12} />
                             </button>
                        </div>
                    </td>
                    <td>
                        <div className="fw-bold">₹{acc.totalDeposited.toLocaleString()} / <span className="text-success">₹{acc.maturityAmount.toLocaleString()}</span></div>
                        <div className="progress mt-1" style={{height: '4px'}}>
                            <div className="progress-bar bg-primary" style={{width: `${Math.min(100, (acc.totalDeposited/acc.maturityAmount)*100)}%`}}></div>
                        </div>
                    </td>
                    <td>
                      <span className={`badge rounded-pill ${acc.status === 'active' ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`}>
                        {acc.status}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button onClick={() => viewPassbook(acc)} className="btn btn-sm btn-outline-primary border-0 rounded-pill me-2">Passbook</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="text-center py-5 text-muted">No accounts found matching your search.</td></tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* Passbook Modal */}
      {showPassbook && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-0 p-4 pb-0">
                <h5 className="fw-bold">Passbook: {selectedAccount.accountNumber}</h5>
                <button type="button" className="btn-close" onClick={() => setShowPassbook(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <p className="text-muted small mb-0">Customer: <b>{selectedAccount.customerId?.userId?.name}</b></p>
                    <button onClick={handleExportPassbook} className="btn btn-sm btn-primary rounded-pill px-3">
                        <Download size={14} className="me-1" /> Export CSV
                    </button>
                </div>
                <div className="table-responsive bg-light rounded-3 p-2">
                    <table className="table table-sm table-hover mb-0">
                        <thead className="small text-muted">
                            <tr>
                                <th>Date</th>
                                <th>Inst #</th>
                                <th>Amount</th>
                                <th>Mode</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {passbookLoading ? (
                                <tr><td colSpan="5" className="text-center py-3"><span className="spinner-border spinner-border-sm"></span></td></tr>
                            ) : passbookData.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-3 text-muted">No history found</td></tr>
                            ) : (
                                passbookData.map(tx => (
                                    <tr key={tx._id}>
                                        <td>{new Date(tx.collectionDate).toLocaleDateString()}</td>
                                        <td>#{tx.installmentNumber}</td>
                                        <td className="fw-bold">₹{tx.amount.toLocaleString()}</td>
                                        <td className="text-capitalize">{tx.paymentMode}</td>
                                        <td><span className={`text-${tx.status === 'confirmed' ? 'success' : 'warning'}`}>{tx.status}</span></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Agent Modal */}
      {showAgentModal && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-0 p-4 pb-0">
                <h5 className="fw-bold">Reassign Agent</h5>
                <button type="button" className="btn-close" onClick={() => setShowAgentModal(false)}></button>
              </div>
              <form onSubmit={handleUpdateAgent}>
                <div className="modal-body p-4">
                    <p className="small text-muted mb-3">Reassigning agent for account <b>{selectedAccount?.accountNumber}</b></p>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Select New Agent</label>
                        <select 
                            className="form-select bg-light border-0" 
                            value={newAgentId} 
                            onChange={(e) => setNewAgentId(e.target.value)}
                            required
                        >
                            <option value="">Choose Agent...</option>
                            {agents.map(a => (
                                <option key={a._id} value={a._id}>{a.userId?.name} ({a.status})</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="modal-footer border-0 p-4 pt-0">
                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowAgentModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary rounded-pill px-4">Update Allocation</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

};

export default ManageAccounts;
