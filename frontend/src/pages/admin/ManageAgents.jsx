import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Search, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';

const ManageAgents = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    
    // Form State
    const [showForm, setShowForm] = useState(false);
    const [editingAgent, setEditingAgent] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', address: '', commissionRate: ''
    });

    const fetchAgents = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/agents`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` }
            });
            setAgents(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAgent) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/agents/${editingAgent._id}`, formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` }
                });
                toast.success('Agent updated successfully');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/agents`, formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` }
                });
                toast.success('Agent created successfully');
            }
            setShowForm(false);
            setEditingAgent(null);
            setFormData({ name: '', email: '', password: '', phone: '', address: '', commissionRate: '' });
            fetchAgents();
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to process request';
            toast.error(errorMessage);
        }
    };

    const handleToggleStatus = async (agent) => {
        const newStatus = agent.status === 'active' ? 'inactive' : 'active';
        
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${newStatus === 'active' ? 'reactivate' : 'deactivate'} this agent?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, change it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/agents/${agent._id}/status`, { status: newStatus }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` }
                });
                toast.success(`Agent ${newStatus === 'active' ? 'reactivated' : 'deactivated'} successfully`);
                fetchAgents();
            } catch (err) {
                toast.error('Failed to update status');
            }
        }
    };

    const startEdit = (agent) => {
        setEditingAgent(agent);
        setFormData({
            name: agent.userId.name,
            email: agent.userId.email,
            phone: agent.phone,
            address: agent.address,
            commissionRate: agent.commissionRate,
            password: '' // Don't show password
        });
        setShowForm(true);
    };

    const filteredAgents = agents.filter(agent => 
        agent.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.phone?.includes(searchTerm)
    );


    return (
        <div className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-dark fw-bold mb-0">Manage Agents</h2>
                <button 
                    className="btn btn-primary-custom d-flex align-items-center gap-2"
                    onClick={() => {
                        setShowForm(!showForm);
                        if(showForm) {
                            setEditingAgent(null);
                            setFormData({ name: '', email: '', password: '', phone: '', address: '', commissionRate: '' });
                        }
                    }}
                >
                    <UserPlus size={18} /> {showForm ? 'Cancel' : 'Create New Agent'}
                </button>
            </div>

            {showForm && (
                <div className="card shadow-sm border-0 mb-4 fade-in">
                    <div className="card-body p-4">
                        <h5 className="fw-bold mb-4">{editingAgent ? 'Edit Agent Details' : 'Register New Agent'}</h5>
                        <form onSubmit={handleSubmit} className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label text-muted small fw-bold">Full Name</label>
                                <input type="text" className="form-control bg-light border-0" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-muted small fw-bold">Email Address (Login ID)</label>
                                <input type="email" className="form-control bg-light border-0" name="email" value={formData.email} onChange={handleChange} required disabled={!!editingAgent} />
                            </div>
                            {!editingAgent && (
                                <div className="col-md-4">
                                    <label className="form-label text-muted small fw-bold">Temporary Password</label>
                                    <input type="password" className="form-control bg-light border-0" name="password" value={formData.password} onChange={handleChange} required />
                                </div>
                            )}
                            <div className={`col-md-${editingAgent ? '6' : '4'}`}>
                                <label className="form-label text-muted small fw-bold">Phone Number</label>
                                <input type="text" className="form-control bg-light border-0" name="phone" value={formData.phone} onChange={handleChange} required />
                            </div>
                            <div className={`col-md-${editingAgent ? '6' : '4'}`}>
                                <label className="form-label text-muted small fw-bold">Commission Rate (%)</label>
                                <input type="number" step="0.1" className="form-control bg-light border-0" name="commissionRate" value={formData.commissionRate} onChange={handleChange} required />
                            </div>
                            <div className="col-12">
                                <label className="form-label text-muted small fw-bold">Home Address</label>
                                <textarea className="form-control bg-light border-0" rows="2" name="address" value={formData.address} onChange={handleChange} required></textarea>
                            </div>
                            <div className="col-12 text-end mt-4">
                                <button type="submit" className="btn btn-primary-custom px-4">{editingAgent ? 'Update Agent' : 'Register Agent'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light rounded-top">
                        <h5 className="card-title fw-bold mb-0">Agent Directory</h5>
                        <div className="position-relative" style={{ width: '250px' }}>
                            <input 
                                type="text" 
                                className="form-control pe-5" 
                                placeholder="Search agents..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search size={16} className="text-muted position-absolute top-50 translate-middle-y" style={{ right: '15px' }} />
                        </div>
                    </div>

                    
                    <div className="table-responsive p-3">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="text-muted small text-uppercase">
                                <tr>
                                    <th>Agent Name</th>
                                    <th>Contact Info</th>
                                    <th>Commission</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-4"><span className="spinner-border text-primary"></span></td></tr>
                                ) : filteredAgents.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-4 text-muted">No agents found matching your search.</td></tr>
                                ) : (
                                    filteredAgents.map((agent) => (
                                        <tr key={agent._id} className={agent.status === 'inactive' ? 'opacity-50' : ''}>
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{width:40, height:40}}>
                                                        {agent.userId?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{agent.userId?.name}</div>
                                                        <div className="small text-muted">ID: {agent._id.substring(agent._id.length-6).toUpperCase()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="small">{agent.userId?.email}</div>
                                                <div className="small text-muted">{agent.phone}</div>
                                            </td>
                                            <td className="fw-medium text-success">{agent.commissionRate}%</td>
                                            <td>
                                                <span className={`badge px-2 py-1 border ${
                                                    agent.status === 'active' ? 'bg-success-subtle text-success border-success-subtle' : 'bg-danger-subtle text-danger border-danger-subtle'
                                                }`}>
                                                    {agent.status?.charAt(0).toUpperCase() + agent.status?.slice(1)}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <button 
                                                    className="btn btn-light btn-sm me-2 text-primary hover-bg-light"
                                                    onClick={() => startEdit(agent)}
                                                    title="Edit Details"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    className={`btn btn-sm ${agent.status === 'active' ? 'btn-light text-danger' : 'btn-light text-success'} hover-bg-light`}
                                                    onClick={() => handleToggleStatus(agent)}
                                                    title={agent.status === 'active' ? 'Deactivate' : 'Reactivate'}
                                                >
                                                    {agent.status === 'active' ? <XCircle size={16} /> : <CheckCircle size={16} />}
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
        </div>
    );
};

export default ManageAgents;
