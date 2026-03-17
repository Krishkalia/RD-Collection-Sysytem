import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, DollarSign, Award, Calendar } from 'lucide-react';

const MyCommission = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const [commissions, setCommissions] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('rdToken');
                const [statsRes, commRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/api/agent/stats`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/commission/my`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                setStats(statsRes.data);
                setCommissions(commRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const commissionRate = stats?.commissionRate || 2;
    const rank = stats?.rank || 'Bronze';
    const estCommission = stats ? (stats.monthCollection * commissionRate / 100) : 0;


    return (
        <div className="fade-in">
            <h2 className="text-dark fw-bold mb-4">Track Commission</h2>

            {loading ? (
                <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>
            ) : (
                <>
                    <div className="row g-4 mb-5">
                        <div className="col-md-4">
                            <div className="card shadow-sm border-0 border-top border-4 border-success">
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="text-muted mb-0">Monthly Collections</h6>
                                        <div className="bg-success bg-opacity-10 p-2 rounded">
                                            <TrendingUp size={20} className="text-success" />
                                        </div>
                                    </div>
                                    <h3 className="fw-bold mb-1">₹{(stats?.monthCollection || 0).toLocaleString()}</h3>
                                    <small className="text-muted">For {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card shadow-sm border-0 border-top border-4 border-primary">
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="text-muted mb-0">Est. Commission</h6>
                                        <div className="bg-primary bg-opacity-10 p-2 rounded">
                                            <DollarSign size={20} className="text-primary" />
                                        </div>
                                    </div>
                                    <h3 className="fw-bold mb-1">₹{estCommission.toLocaleString()}</h3>
                                    <small className="text-muted">Based on {commissionRate}% base rate</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card shadow-sm border-0 border-top border-4 border-warning">
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="text-muted mb-0">Agent Rank</h6>
                                        <div className="bg-warning bg-opacity-10 p-2 rounded">
                                            <Award size={20} className="text-warning" />
                                        </div>
                                    </div>
                                    <h3 className="fw-bold mb-1">{rank}</h3>
    <small className="text-muted">Rank based on commission rate</small>

                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4">Commission History</h5>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Month/Year</th>
                                            <th>Amount</th>
                                            <th>Rate</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {commissions.length > 0 ? commissions.map(c => (
                                            <tr key={c._id}>
                                                <td>{new Date(c.year, c.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</td>
                                                <td className="fw-bold">₹{(c.commissionAmount || 0).toLocaleString()}</td>
                                                <td>{c.commissionRate}%</td>
                                                <td>
                                                    <span className={`badge ${c.paidStatus === 'paid' ? 'bg-success' : 'bg-warning'} rounded-pill`}>
                                                        {c.paidStatus}
                                                    </span>
                                                </td>
                                            </tr>

                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-4 text-muted">No commission records found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MyCommission;
