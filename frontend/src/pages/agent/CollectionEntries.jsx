import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CollectionEntries = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                // We'll use the existing /reports/daily logic or similar if needed, 
                // but let's assume a dedicated agent collections route for now (already implemented in backend/routes/agent.js)
                // router.get('/collections', ...) was NOT implemented yet, let's add it to backend if needed.
                // For now, let's use a simpler fetch or add to backend.
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/agent/collections`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` }
                });
                setEntries(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEntries();
    }, []);

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-dark fw-bold mb-0">Collection Entries</h2>
                <button 
                    onClick={() => navigate('/agent/customers')}
                    className="btn btn-primary-custom d-flex align-items-center gap-2"
                >
                    <Plus size={18} /> New Collection
                </button>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Date</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Mode</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-5"><span className="spinner-border text-primary"></span></td></tr>
                                ) : entries.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-5 text-muted">No transactions found for today.</td></tr>
                                ) : (
                                    entries.map(entry => (
                                        <tr key={entry._id}>
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center gap-2 text-muted small">
                                                    <Clock size={14} />
                                                    {new Date(entry.collectionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="fw-bold fs-small">{new Date(entry.collectionDate).toLocaleDateString()}</div>
                                            </td>
                                            <td>
                                                <div className="fw-bold">{entry.customerId?.userId?.name || 'Unknown'}</div>
                                                <small className="text-muted">Account: {entry.rdAccountId?.planId?.name || 'RD Account'}</small>
                                            </td>
                                            <td className="fw-bold text-dark">₹{entry.amount.toLocaleString()}</td>
                                            <td><span className="badge bg-light text-dark border text-capitalize">{entry.paymentMode}</span></td>
                                            <td>
                                                {entry.status === 'confirmed' ? (
                                                    <span className="text-success d-flex align-items-center gap-1 small fw-bold">
                                                        <CheckCircle size={14} /> Confirmed
                                                    </span>
                                                ) : entry.status === 'pending' ? (
                                                    <span className="text-warning d-flex align-items-center gap-1 small fw-bold">
                                                        <Clock size={14} /> Pending
                                                    </span>
                                                ) : (
                                                    <span className="text-danger d-flex align-items-center gap-1 small fw-bold">
                                                        <XCircle size={14} /> Rejected
                                                    </span>
                                                )}
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

export default CollectionEntries;
