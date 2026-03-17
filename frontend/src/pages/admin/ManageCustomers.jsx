import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Search, Trash2, Edit, CheckCircle, XCircle, FileText, Eye, ShieldCheck, ShieldAlert } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';

const ManageCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Registration / Edit Form State
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', dob: '', address: ''
    });

    // RD Account Form State
    const [showAccountForm, setShowAccountForm] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [selectedCustomerName, setSelectedCustomerName] = useState('');
    const [plans, setPlans] = useState([]);
    const [agents, setAgents] = useState([]);
    const [accountData, setAccountData] = useState({
        planId: '', agentId: '', installmentAmount: '', startDate: new Date().toISOString().split('T')[0]
    });

    // KYC Review State
    const [showKycModal, setShowKycModal] = useState(false);
    const [selectedKycCustomer, setSelectedKycCustomer] = useState(null);

    const getFileUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${import.meta.env.VITE_API_URL}${path}`;
    };

    const fetchInitialData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` } };
            const [custRes, planRes, agentRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/admin/customers`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/api/admin/plans`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/api/admin/agents`, config)
            ]);

            setCustomers(custRes.data);
            setPlans(planRes.data);
            setAgents(agentRes.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` } };
            if (editingCustomer) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/customers/${editingCustomer._id}`, formData, config);
                toast.success('Customer updated successfully');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/customers`, formData, config);
                toast.success('Customer registered successfully');
            }

            setShowForm(false);
            setEditingCustomer(null);
            setFormData({ name: '', email: '', password: '', phone: '', dob: '', address: '' });
            fetchInitialData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to process request');
        }
    };

    const handleToggleStatus = async (customer) => {
        const newStatus = customer.userId?.status === 'active' ? 'inactive' : 'active';
        
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${newStatus === 'active' ? 'reactivate' : 'deactivate'} this customer?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, change it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/customers/${customer._id}/status`, 
                    { status: newStatus },
                    { headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` } }
                );
                toast.success(`Customer ${newStatus === 'active' ? 'reactivated' : 'deactivated'} successfully`);
                fetchInitialData();
            } catch (err) {
                toast.error('Failed to update status');
            }
        }
    };

    const handleOpenAccount = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/accounts/open`, {
                ...accountData,
                customerId: selectedCustomerId
            }, { headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` } });

            setShowAccountForm(false);
            toast.success('RD Account opened successfully!');
            fetchInitialData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to open account');
        }
    };

    const handleVerifyKYC = async (id, status) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/customers/${id}/verify-kyc`, 
                { status },
                { headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` } }
            );
            fetchInitialData();
            toast.success(`KYC marked as ${status}`);
        } catch (err) {
            toast.error('Failed to update KYC status');
        }
    };

    const startEdit = (customer) => {

        setEditingCustomer(customer);
        setFormData({
            name: customer.userId.name,
            email: customer.userId.email,
            phone: customer.phone,
            dob: customer.dob ? new Date(customer.dob).toISOString().split('T')[0] : '',
            address: customer.address,
            password: '' // Hide password
        });
        setShowForm(true);
        setShowAccountForm(false);
    };

    const filteredCustomers = customers.filter(c => 
        c.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-dark fw-bold mb-0">Manage Customers</h2>
                <button 
                    className="btn btn-primary-custom d-flex align-items-center gap-2"
                    onClick={() => {
                        setShowForm(!showForm);
                        if(showForm) {
                            setEditingCustomer(null);
                            setFormData({ name: '', email: '', password: '', phone: '', dob: '', address: '' });
                        }
                    }}
                >
                    <UserPlus size={18} /> {showForm ? 'Cancel' : 'Register New Customer'}
                </button>
            </div>

            {showForm && (
                <div className="card shadow-sm border-0 mb-4 fade-in">
                    <div className="card-body p-4">
                        <h5 className="fw-bold mb-4">{editingCustomer ? 'Edit Customer' : 'New Customer Registration'}</h5>
                        <form onSubmit={handleSubmit} className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label text-muted small fw-bold">Full Name</label>
                                <input type="text" className="form-control bg-light border-0" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-muted small fw-bold">Email Address</label>
                                <input type="email" className="form-control bg-light border-0" name="email" value={formData.email} onChange={handleChange} required disabled={!!editingCustomer} />
                            </div>
                            {!editingCustomer && (
                                <div className="col-md-4">
                                    <label className="form-label text-muted small fw-bold">Password</label>
                                    <input type="password" className="form-control bg-light border-0" name="password" onChange={handleChange} required />
                                </div>
                            )}
                            <div className={`col-md-${editingCustomer ? '6' : '4'}`}>
                                <label className="form-label text-muted small fw-bold">Phone Number</label>
                                <input type="text" className="form-control bg-light border-0" name="phone" value={formData.phone} onChange={handleChange} required />
                            </div>
                            <div className={`col-md-${editingCustomer ? '6' : '4'}`}>
                                <label className="form-label text-muted small fw-bold">Date of Birth</label>
                                <input type="date" className="form-control bg-light border-0" name="dob" value={formData.dob} onChange={handleChange} required />
                            </div>
                            <div className="col-12">
                                <label className="form-label text-muted small fw-bold">Address</label>
                                <textarea className="form-control bg-light border-0" rows="2" name="address" value={formData.address} onChange={handleChange} required></textarea>
                            </div>
                            <div className="col-12 text-end mt-4">
                                <button type="submit" className="btn btn-primary-custom px-4">{editingCustomer ? 'Update Customer' : 'Register Customer'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAccountForm && (
                <div className="card shadow-sm border-0 mb-4 border-start border-4 border-success fade-in">
                    <div className="card-body p-4">
                        <h5 className="fw-bold mb-4 text-success">Open New RD Account for {selectedCustomerName}</h5>
                        <form onSubmit={handleOpenAccount} className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label text-muted small fw-bold">Select Plan</label>
                                <select className="form-select bg-light border-0" 
                                        onChange={(e) => {
                                            const plan = plans.find(p => p._id === e.target.value);
                                            setAccountData({...accountData, planId: e.target.value, installmentAmount: plan?.monthlyInstallment || ''});
                                        }} required>
                                    <option value="">Choose Plan...</option>
                                    {plans.map(p => <option key={p._id} value={p._id}>{p.name} (₹{p.monthlyInstallment})</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label text-muted small fw-bold">Select Collection Agent</label>
                                <select className="form-select bg-light border-0" 
                                        onChange={(e) => setAccountData({...accountData, agentId: e.target.value})} required>
                                    <option value="">Choose Agent...</option>
                                    {agents.map(a => <option key={a._id} value={a._id}>{a.userId?.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label text-muted small fw-bold">Installment Amount (₹)</label>
                                <input type="number" className="form-control bg-light border-0" 
                                       value={accountData.installmentAmount}
                                       onChange={(e) => setAccountData({...accountData, installmentAmount: e.target.value})} required />
                            </div>
                            <div className="col-12 text-end mt-4">
                                <button type="button" className="btn btn-light me-2" onClick={() => setShowAccountForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-success px-4">Initialize Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light rounded-top">
                        <h5 className="card-title fw-bold mb-0">Customer Directory</h5>
                        <div className="position-relative" style={{ width: '250px' }}>
                            <input type="text" className="form-control pe-5" placeholder="Search by name or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            <Search size={16} className="text-muted position-absolute top-50 translate-middle-y" style={{ right: '15px' }} />
                        </div>
                    </div>
                    
                    <div className="table-responsive p-3">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="text-muted small text-uppercase">
                                <tr>
                                    <th>Customer Name</th>
                                    <th>Contact info</th>
                                    <th>KYC Status</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-4"><span className="spinner-border text-primary"></span></td></tr>
                                ) : filteredCustomers.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-4 text-muted">No customers found.</td></tr>
                                ) : (
                                    filteredCustomers.map((customer) => (
                                        <tr key={customer._id} className={customer.userId?.status === 'inactive' ? 'opacity-50' : ''}>
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{width:40, height:40}}>
                                                        {customer.userId?.name?.charAt(0) || 'C'}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{customer.userId?.name}</div>
                                                        <div className="small text-muted">{customer.phone}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="small">{customer.userId?.email}</div>
                                                <div className="small text-muted">{customer.address}</div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className={`badge px-2 py-1 border ${
                                                        customer.kycStatus === 'verified' ? 'bg-success-subtle text-success border-success-subtle' : 
                                                        customer.kycStatus === 'rejected' ? 'bg-danger-subtle text-danger border-danger-subtle' : 
                                                        'bg-warning-subtle text-warning border-warning-subtle'
                                                    }`}>
                                                        {customer.kycStatus?.charAt(0).toUpperCase() + customer.kycStatus?.slice(1)}
                                                    </span>
                                                    <button 
                                                        className="btn btn-sm btn-light p-1 rounded-circle" 
                                                        onClick={() => {
                                                            setSelectedKycCustomer(customer);
                                                            setShowKycModal(true);
                                                        }}
                                                        title="Review Documents"
                                                    >
                                                        <Eye size={14} className="text-primary" />
                                                    </button>
                                                </div>

                                            </td>
                                            <td>
                                                <span className={`badge px-2 py-1 border ${
                                                    customer.userId?.status === 'active' ? 'bg-success-subtle text-success border-success-subtle' : 'bg-danger-subtle text-danger border-danger-subtle'
                                                }`}>
                                                    {customer.userId?.status?.charAt(0).toUpperCase() + customer.userId?.status?.slice(1)}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <button 
                                                    className="btn btn-outline-success btn-sm me-2" 
                                                    onClick={() => {
                                                        setSelectedCustomerId(customer._id);
                                                        setSelectedCustomerName(customer.userId.name);
                                                        setShowAccountForm(true);
                                                        setShowForm(false);
                                                    }}
                                                    disabled={customer.userId?.status !== 'active'}
                                                    title={customer.userId?.status === 'active' ? "Open RD Account" : "Reactivate customer to open account"}
                                                >
                                                    <CheckCircle size={16} /> Open Account
                                                </button>
                                                <button 
                                                    className="btn btn-light btn-sm text-primary me-2 hover-bg-light"
                                                    onClick={() => startEdit(customer)}
                                                    title="Edit Details"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    className={`btn btn-sm ${customer.userId?.status === 'active' ? 'btn-light text-danger' : 'btn-light text-success'} hover-bg-light`}
                                                    onClick={() => handleToggleStatus(customer)}
                                                    title={customer.userId?.status === 'active' ? 'Deactivate' : 'Reactivate'}
                                                >
                                                    {customer.userId?.status === 'active' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* KYC Verification Modal */}
            {showKycModal && selectedKycCustomer && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header border-bottom-0 p-4">
                                <h5 className="modal-title fw-bold">KYC Document Review</h5>
                                <button type="button" className="btn-close" onClick={() => setShowKycModal(false)}></button>
                            </div>
                            <div className="modal-body p-4 pt-0">
                                <div className="p-3 bg-light rounded-3 mb-4 d-flex align-items-center gap-3">
                                    <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-circle fw-bold">
                                        {selectedKycCustomer.userId.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="fw-bold">{selectedKycCustomer.userId.name}</div>
                                        <div className="small text-muted">Customer ID: {selectedKycCustomer._id}</div>
                                    </div>
                                </div>

                                <div className="row g-4">
                                    {[
                                        { id: 'adharCard', label: 'Aadhaar Card', value: selectedKycCustomer.adharCard },
                                        { id: 'panCard', label: 'PAN Card', value: selectedKycCustomer.panCard },
                                        { id: 'drivingLicence', label: 'Driving Licence', value: selectedKycCustomer.drivingLicence }
                                    ].map((doc) => (
                                        <div key={doc.id} className="col-md-4">
                                            <div className="card h-100 border-0 shadow-sm bg-light text-center p-3 rounded-4">
                                                <div className="mb-2">
                                                    <FileText size={32} className={doc.value ? 'text-primary' : 'text-muted opacity-50'} />
                                                </div>
                                                <div className="fw-bold small mb-2">{doc.label}</div>
                                                {doc.value ? (
                                                    <div className="d-grid gap-2">
                                                        <a 
                                                            href={getFileUrl(doc.value)} 
                                                            target="_blank" 
                                                            rel="noreferrer" 
                                                            className="btn btn-sm btn-outline-primary rounded-pill py-1"
                                                        >
                                                            View Full
                                                        </a>
                                                        {doc.value.match(/\.(jpg|jpeg|png)$/i) && (
                                                            <div className="mt-2 rounded-3 overflow-hidden border" style={{ height: '80px' }}>
                                                                <img src={getFileUrl(doc.value)} alt="Preview" className="w-100 h-100 object-fit-cover" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="badge bg-secondary-subtle text-secondary rounded-pill">Not Uploaded</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-footer border-top-0 p-4 gap-2">
                                <button 
                                    className="btn btn-danger-custom rounded-pill px-4 d-flex align-items-center gap-2"
                                    onClick={() => {
                                        handleVerifyKYC(selectedKycCustomer._id, 'rejected');
                                        setShowKycModal(false);
                                    }}
                                >
                                    <ShieldAlert size={18} /> Reject KYC
                                </button>
                                <button 
                                    className="btn btn-success rounded-pill px-4 d-flex align-items-center gap-2"
                                    onClick={() => {
                                        handleVerifyKYC(selectedKycCustomer._id, 'verified');
                                        setShowKycModal(false);
                                    }}
                                >
                                    <ShieldCheck size={18} /> Approve KYC
                                </button>
                                <button className="btn btn-light rounded-pill px-4" onClick={() => setShowKycModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCustomers;
