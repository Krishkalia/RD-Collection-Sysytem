import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/agent/customers`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` }
                });
                setCustomers(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    const filteredCustomers = customers.filter(c => 
        c.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-dark fw-bold mb-0">My Customers</h2>
                <div className="position-relative" style={{ width: '300px' }}>
                    <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                    <input 
                        type="text" 
                        className="form-control ps-5 py-2 border-0 shadow-sm" 
                        placeholder="Search by name or phone..." 
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>
            ) : filteredCustomers.length === 0 ? (
                <div className="card shadow-sm border-0 text-center py-5">
                    <p className="text-muted mb-0">No customers found assigned to you.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {filteredCustomers.map(customer => (
                        <div className="col-md-6 col-lg-4" key={customer._id}>
                            <div className="card shadow-sm border-0 h-100 hover-shadow transition-all border-start border-4 border-primary">
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        <div className="bg-primary bg-opacity-10 p-2 rounded-circle">
                                            <User size={24} className="text-primary" />
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-0">{customer.userId.name}</h5>
                                            <small className="text-muted">{customer.phone}</small>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-3 small">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="text-muted">KYC Status:</span>
                                            <span className={`badge ${customer.kycStatus === 'verified' ? 'bg-success' : 'bg-warning'}`}>
                                                {customer.kycStatus === 'verified' ? 'Verified' : 'Pending'}
                                            </span>
                                        </div>
                                        <div className="text-muted text-truncate">
                                            Address: {customer.address}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => navigate(`/agent/collections/new?customerId=${customer._id}`)}
                                        className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
                                    >
                                        Record Payment <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCustomers;
