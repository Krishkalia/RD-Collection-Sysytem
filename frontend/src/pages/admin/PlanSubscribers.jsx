import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Users, Calendar, Award, User, Hash } from 'lucide-react';

const PlanSubscribers = () => {
    const { id } = useParams();
    const [subscribers, setSubscribers] = useState([]);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` } };
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/plans/${id}/subscribers`, config);

                setSubscribers(res.data);
                if (res.data.length > 0) {
                    setPlan(res.data[0].planId);
                } else {
                    // If no subscribers, we still might want plan info? 
                    // Let's fetch plans to find this one if subscribers empty
                    const planRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/plans`, config);

                    const currentPlan = planRes.data.find(p => p._id === id);
                    setPlan(currentPlan);
                }
            } catch (err) {
                console.error('Failed to fetch subscribers', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>;

    return (
        <div className="fade-in">
            <div className="mb-4">
                <Link to="/admin/plans" className="btn btn-link text-muted p-0 d-flex align-items-center gap-2 text-decoration-none hover-primary">
                    <ArrowLeft size={18} /> Back to Plans
                </Link>
            </div>

            <div className="card shadow-sm border-0 mb-4 bg-primary text-white overflow-hidden">
                <div className="card-body p-4 position-relative">
                    <div className="position-relative z-1">
                        <h2 className="fw-bold mb-1">{plan?.name || 'Investment Plan'}</h2>
                        <p className="opacity-75 mb-0">Subscriber List & Performance Overview</p>
                    </div>
                    <Users size={80} className="position-absolute end-0 bottom-0 opacity-10 m-n3" />
                </div>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light rounded-top">
                        <div className="d-flex align-items-center gap-2">
                            <Users size={20} className="text-primary" />
                            <h5 className="card-title fw-bold mb-0">Active Subscribers ({subscribers.length})</h5>
                        </div>
                    </div>
                    
                    <div className="table-responsive p-3">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="text-muted small text-uppercase">
                                <tr>
                                    <th>Customer / ID</th>
                                    <th>RD Account</th>
                                    <th>Agent</th>
                                    <th>Tenure</th>
                                    <th>Progress</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscribers.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-5 text-muted">No active subscribers for this plan yet.</td></tr>
                                ) : (
                                    subscribers.map((sub) => (
                                        <tr key={sub._id}>
                                            <td>
                                                <div className="fw-bold text-dark">{sub.customerId?.userId?.name}</div>
                                                <div className="small text-muted">{sub.customerId?.phone}</div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Hash size={14} className="text-primary" />
                                                    <span className="fw-medium">{sub.accountNumber}</span>
                                                </div>
                                                <div className="small text-muted">Opened: {new Date(sub.startDate).toLocaleDateString()}</div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <User size={14} className="text-muted" />
                                                    <span>{sub.agentId?.userId?.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="small fw-medium">{sub.tenureMonths} Months</div>
                                                <div className="small text-muted">Ends: {new Date(sub.maturityDate).toLocaleDateString()}</div>
                                            </td>
                                            <td style={{ width: '150px' }}>
                                                <div className="small mb-1 d-flex justify-content-between">
                                                    <span>{Math.round((sub.totalDeposited / sub.maturityAmount) * 100)}%</span>
                                                    <span className="text-muted">₹{sub.totalDeposited}</span>
                                                </div>
                                                <div className="progress" style={{ height: '6px' }}>
                                                    <div className="progress-bar bg-primary" 
                                                         style={{ width: `${(sub.totalDeposited / sub.maturityAmount) * 100}%` }}></div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="fw-bold text-dark">₹{sub.maturityAmount?.toLocaleString()}</div>
                                                <div className="small text-success fw-medium">Maturity</div>
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

export default PlanSubscribers;
