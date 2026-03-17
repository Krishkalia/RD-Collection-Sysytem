import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Search, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MyPassbook = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = localStorage.getItem('rdToken');
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/customer/transactions`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTransactions(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const filtered = transactions.filter(tx => 
        tx.rdAccountId?.planId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.paymentMode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = () => {
        if (transactions.length === 0) return toast.error('No transactions to export');
        
        const headers = ['Date', 'Account Number', 'Plan', 'Installment #', 'Amount', 'Mode', 'Status'];
        const rows = transactions.map(tx => [
            new Date(tx.collectionDate).toLocaleDateString(),
            tx.rdAccountId?.accountNumber || 'N/A',
            tx.rdAccountId?.planId?.name || 'N/A',
            tx.installmentNumber,
            tx.amount,
            tx.paymentMode,
            tx.status
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(e => e.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `My_Passbook_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-circle text-primary">
                        <BookOpen size={24} />
                    </div>
                    <h2 className="text-dark fw-bold mb-0">Digital Passbook</h2>
                </div>
                <div className="d-flex gap-2">
                    <div className="position-relative">
                        <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                        <input 
                            type="text" 
                            className="form-control ps-5 border-0 shadow-sm" 
                            placeholder="Search plan or mode..." 
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleExport}
                        className="btn btn-outline-secondary d-flex align-items-center gap-2 shadow-sm border-0 bg-white"
                    >
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>


            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light bg-opacity-50">
                                <tr>
                                    <th className="ps-4 py-3">Transaction Date</th>
                                    <th>RD Account / Plan</th>
                                    <th>Installment #</th>
                                    <th>Amount</th>
                                    <th>Payment Mode</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-5"><span className="spinner-border text-primary"></span></td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-5 text-muted">No transaction records found.</td></tr>
                                ) : (
                                    filtered.map(tx => (
                                        <tr key={tx._id}>
                                            <td className="ps-4">
                                                <div className="fw-bold">{new Date(tx.collectionDate).toLocaleDateString()}</div>
                                                <small className="text-muted">{new Date(tx.collectionDate).toLocaleTimeString()}</small>
                                            </td>
                                            <td>
                                                <div className="fw-bold">{tx.rdAccountId?.planId?.name || 'RD Account'}</div>
                                                <small className="text-muted font-monospace">{tx.rdAccountId?.accountNumber || ''}</small>
                                            </td>
                                            <td><span className="badge bg-info bg-opacity-10 text-info fw-bold">Inst. #{tx.installmentNumber}</span></td>
                                            <td className="fw-bold text-dark">₹{tx.amount.toLocaleString()}</td>
                                            <td><span className="text-capitalize">{tx.paymentMode}</span></td>
                                            <td>
                                                <span className={`badge border px-3 py-1 rounded-pill ${tx.status === 'confirmed' ? 'bg-success-subtle text-success border-success-subtle' : 'bg-warning-subtle text-warning border-warning-subtle'}`}>
                                                    {tx.status}
                                                </span>
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

export default MyPassbook;
