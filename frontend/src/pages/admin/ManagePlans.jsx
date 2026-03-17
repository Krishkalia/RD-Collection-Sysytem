import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AreaChart, Plus, Trash2, Edit, Save, Users, ExternalLink } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';

const ManagePlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form State
    const [showForm, setShowForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: '', monthlyInstallment: '', tenureMonths: '', annualInterestRate: '', maturityAmount: ''
    });

    const fetchPlans = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/plans`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` }
            });
            setPlans(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPlan) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/plans/${editingPlan._id}`, formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` }
                });
                toast.success('Plan updated successfully');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/plans`, formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` }
                });
                toast.success('Plan created successfully');
            }
            setShowForm(false);
            setEditingPlan(null);
            setFormData({ name: '', monthlyInstallment: '', tenureMonths: '', annualInterestRate: '', maturityAmount: '' });
            fetchPlans();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to process request');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/plans/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` }
                });
                toast.success('Plan deleted successfully');
                fetchPlans();
            } catch (err) {
                toast.error('Failed to delete plan');
            }
        }
    };

    const startEdit = (plan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            monthlyInstallment: plan.monthlyInstallment,
            tenureMonths: plan.tenureMonths,
            annualInterestRate: plan.annualInterestRate,
            maturityAmount: plan.maturityAmount
        });
        setShowForm(true);
    };

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-dark fw-bold mb-0">Investment Plans</h2>
                <button 
                    className="btn btn-primary-custom d-flex align-items-center gap-2"
                    onClick={() => {
                        setShowForm(!showForm);
                        if(showForm) {
                            setEditingPlan(null);
                            setFormData({ name: '', monthlyInstallment: '', tenureMonths: '', annualInterestRate: '', maturityAmount: '' });
                        }
                    }}
                >
                    <Plus size={18} /> {showForm ? 'Cancel' : 'Create New Plan'}
                </button>
            </div>

            {showForm && (
                <div className="card shadow-sm border-0 mb-4 fade-in">
                    <div className="card-body p-4">
                        <h5 className="fw-bold mb-4">{editingPlan ? 'Edit Plan Details' : 'Define New Plan'}</h5>
                        <form onSubmit={handleSubmit} className="row g-3">
                            <div className="col-md-12">
                                <label className="form-label text-muted small fw-bold">Plan Name</label>
                                <input type="text" className="form-control bg-light border-0" name="name" 
                                       placeholder="e.g. Monthly Saver 24M" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label text-muted small fw-bold">Monthly Installment (₹)</label>
                                <input type="number" className="form-control bg-light border-0" name="monthlyInstallment" value={formData.monthlyInstallment} onChange={handleChange} required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label text-muted small fw-bold">Tenure (Months)</label>
                                <input type="number" className="form-control bg-light border-0" name="tenureMonths" value={formData.tenureMonths} onChange={handleChange} required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label text-muted small fw-bold">Annual Interest Rate (%)</label>
                                <input type="number" step="0.1" className="form-control bg-light border-0" name="annualInterestRate" value={formData.annualInterestRate} onChange={handleChange} required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label text-muted small fw-bold">Maturity Amount (₹) [Optional]</label>
                                <input type="number" className="form-control bg-light border-0" name="maturityAmount" value={formData.maturityAmount} onChange={handleChange} 
                                       placeholder="Auto-calculates if empty"/>
                            </div>
                            <div className="col-12 text-end mt-4">
                                <button type="submit" className="btn btn-primary-custom px-4 d-flex align-items-center gap-2 ms-auto">
                                    <Save size={18} /> {editingPlan ? 'Update Plan' : 'Save Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="row g-4">
                {loading ? (
                    <div className="col-12 text-center py-5"><span className="spinner-border text-primary"></span></div>
                ) : plans.length === 0 ? (
                    <div className="col-12 text-center py-5 text-muted">No investment plans configured.</div>
                ) : (
                    plans.map(plan => (
                        <div className="col-md-4" key={plan._id}>
                            <div className="card shadow-sm border-0 h-100 position-relative hover-shadow transition-all border-top border-4 border-primary">
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 className="fw-bold text-dark mb-0">{plan.name}</h5>
                                        <div className="d-flex gap-2">
                                            <button 
                                                className="btn btn-light btn-sm text-primary p-1" 
                                                onClick={() => startEdit(plan)}
                                                title="Edit Plan"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                className="btn btn-light btn-sm text-danger p-1" 
                                                onClick={() => handleDelete(plan._id)}
                                                title="Delete Plan"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <div className="badge bg-light text-dark px-2 py-1 border">
                                            {plan.tenureMonths} Months
                                        </div>
                                        <Link 
                                            to={`/admin/plans/${plan._id}/subscribers`}
                                            className="badge bg-primary bg-opacity-10 text-primary px-2 py-1 border-0 d-flex align-items-center gap-1 text-decoration-none hover-shadow"
                                        >
                                            <Users size={12} /> {plan.customerCount || 0} Customers
                                            <ExternalLink size={10} />
                                        </Link>
                                    </div>
                                    
                                    <div className="d-flex justify-content-between mb-2 pb-2 border-bottom border-light">
                                        <span className="text-muted small">Monthly Installment</span>
                                        <span className="fw-bold">₹{plan.monthlyInstallment.toLocaleString()}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted small">Interest Rate</span>
                                        <span className="fw-bold text-success">{plan.annualInterestRate}% p.a.</span>
                                    </div>
                                    <div className="d-flex justify-content-between mt-3 pt-3 bg-light rounded p-2">
                                        <span className="text-muted small fw-bold align-self-center">Est. Maturity Amount</span>
                                        <span className="fw-bold text-primary fs-5">₹{plan.maturityAmount?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManagePlans;
