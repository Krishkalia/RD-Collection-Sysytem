import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CreditCard, Save, X } from 'lucide-react';

const NewTransaction = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const customerId = searchParams.get('customerId');

    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [formData, setFormData] = useState({
        amount: '',
        paymentMode: 'cash',
        remarks: ''
    });

    useEffect(() => {
        if (customerId) {
            const fetchAccounts = async () => {
                try {
                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/agent/customer/${customerId}/accounts`, {

                        headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` }
                    });
                    setAccounts(res.data);
                    if (res.data.length > 0) setSelectedAccount(res.data[0]._id);
                } catch (err) {
                    console.error(err);
                }
            };
            fetchAccounts();
        }
    }, [customerId]);

    const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/agent/collections`, {
                rdAccountId: selectedAccount,
                ...formData
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` }
            });
            alert('Collection recorded successfully!');
            navigate('/agent/collections');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to record transaction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card shadow border-0 overflow-hidden">
                <div className="bg-primary p-4 text-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">Record Collection</h5>
                    <CreditCard size={24} className="opacity-50" />
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="form-label text-muted small fw-bold">Select RD Account</label>
                            <select 
                                className="form-select bg-light border-0 py-2" 
                                value={selectedAccount} 
                                onChange={(e) => setSelectedAccount(e.target.value)}
                                required
                            >
                                <option value="">Select an account...</option>
                                {accounts.map(acc => (
                                    <option key={acc._id} value={acc._id}>
                                        [{acc.accountNumber}] {acc.planId.name} — ₹{acc.installmentAmount}/mo
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="form-label text-muted small fw-bold">Amount Collected (₹)</label>
                            <input 
                                type="number" 
                                className="form-control bg-light border-0 py-2 fs-5 fw-bold" 
                                name="amount" 
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="0.00"
                                required 
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label text-muted small fw-bold">Payment Mode</label>
                            <div className="d-flex gap-2">
                                {['cash', 'upi', 'online'].map(mode => (
                                    <label key={mode} className={`flex-grow-1 p-3 border rounded text-center cursor-pointer transition-all ${formData.paymentMode === mode ? 'border-primary bg-primary bg-opacity-10 text-primary fw-bold' : 'bg-light border-0'}`}>
                                        <input 
                                            type="radio" 
                                            name="paymentMode" 
                                            value={mode} 
                                            checked={formData.paymentMode === mode}
                                            onChange={handleChange}
                                            className="d-none"
                                        />
                                        <span className="text-capitalize">{mode}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label text-muted small fw-bold">Remarks</label>
                            <textarea 
                                className="form-control bg-light border-0" 
                                name="remarks" 
                                rows="3"
                                value={formData.remarks}
                                onChange={handleChange}
                                placeholder="Optional notes about the transaction..."
                            ></textarea>
                        </div>

                        <div className="d-flex gap-2 mt-5">
                            <button type="button" onClick={() => navigate(-1)} className="btn btn-light flex-grow-1 py-2 fw-bold d-flex align-items-center justify-content-center gap-2">
                                <X size={18} /> Cancel
                            </button>
                            <button type="submit" disabled={loading} className="btn btn-primary-custom flex-grow-1 py-2 fw-bold d-flex align-items-center justify-content-center gap-2">
                                {loading ? <span className="spinner-border spinner-border-sm"></span> : <><Save size={18} /> Save Entry</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewTransaction;
