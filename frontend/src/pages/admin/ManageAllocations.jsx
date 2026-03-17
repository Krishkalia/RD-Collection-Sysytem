import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCheck, Users, Briefcase, Plus, RefreshCw, Power, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';


const ManageAllocations = () => {
  const [allocations, setAllocations] = useState([]);
  const [agents, setAgents] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newAllocation, setNewAllocation] = useState({ agentId: '', customerId: '' });


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [allocRes, agentRes, custRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/allocation`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/agents`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/customers`)
      ]);
      setAllocations(allocRes.data);
      setAgents(agentRes.data);
      setCustomers(custRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    const allocation = allocations.find(a => a._id === id);
    const newStatusText = allocation.isActive ? 'deactivate' : 'activate';

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${newStatusText} this allocation?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: allocation.isActive ? '#d33' : '#3085d6',
      cancelButtonColor: '#999',
      confirmButtonText: `Yes, ${newStatusText} it!`
    });

    if (result.isConfirmed) {
      try {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/allocation/${id}/toggle`);
        setAllocations(allocations.map(a => a._id === id ? { ...a, isActive: !a.isActive } : a));
        toast.success(`Allocation ${newStatusText}d successfully`);
      } catch (err) {
        toast.error('Failed to update allocation');
      }
    }
  };

  const filteredAllocations = allocations.filter(alloc => 
    alloc.agentId?.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alloc.customerId?.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/allocation`, newAllocation);
      setAllocations([res.data, ...allocations]);
      setShowModal(false);
      setNewAllocation({ agentId: '', customerId: '' });
      toast.success('Allocation created successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create allocation');
    }
  };

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 className="text-dark fw-bold mb-1">Agent Allocations</h2>
            <p className="text-muted small mb-0">Manage which agent handles which customer's collections</p>
        </div>
        <div className="d-flex gap-3 align-items-center">
            <div className="position-relative">
                <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input 
                    type="text" 
                    className="form-control ps-5 bg-white border shadow-sm rounded-pill" 
                    placeholder="Search allocations..." 
                    style={{width: '250px'}}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button onClick={() => setShowModal(true)} className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2">
                <Plus size={18} /> New Allocation
            </button>
        </div>

      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-uppercase small fw-bold text-muted">
                <th className="ps-4">Agent Name</th>
                <th>Assigned Customer</th>
                <th>Status</th>
                <th>Created At</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5"><span className="spinner-border text-primary"></span></td></tr>
              ) : filteredAllocations.length > 0 ? (
                filteredAllocations.map(alloc => (
                  <tr key={alloc._id}>
                    <td className="ps-4">
                        <div className="d-flex align-items-center gap-2">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2"><Briefcase size={14} /></div>
                            <span className="fw-bold">{alloc.agentId?.userId?.name}</span>
                        </div>
                    </td>
                    <td>
                        <div className="d-flex align-items-center gap-2">
                            <div className="bg-success bg-opacity-10 text-success rounded-circle p-2"><Users size={14} /></div>
                            <span className="fw-medium">{alloc.customerId?.userId?.name}</span>
                        </div>
                    </td>
                    <td>
                      <span className={`badge rounded-pill ${alloc.isActive ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                        {alloc.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-muted">{new Date(alloc.createdAt).toLocaleDateString()}</td>
                    <td className="text-end pe-4">
                      <button 
                        onClick={() => handleToggle(alloc._id)}
                        className={`btn btn-sm rounded-pill px-3 ${alloc.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                      >
                        <Power size={14} className="me-1" /> {alloc.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted">No allocations found matching your search.</td></tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* Basic Modal Implementation */}
      {showModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 rounded-4 shadow">
                    <div className="modal-header border-0 pb-0">
                        <h5 className="fw-bold">New Allocation</h5>
                        <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Select Agent</label>
                                <select 
                                    className="form-select bg-light border-0" 
                                    required
                                    value={newAllocation.agentId}
                                    onChange={(e) => setNewAllocation({...newAllocation, agentId: e.target.value})}
                                >
                                    <option value="">Choose Agent...</option>
                                    {agents.map(a => <option key={a._id} value={a._id}>{a.userId?.name}</option>)}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Select Customer</label>
                                <select 
                                    className="form-select bg-light border-0" 
                                    required
                                    value={newAllocation.customerId}
                                    onChange={(e) => setNewAllocation({...newAllocation, customerId: e.target.value})}
                                >
                                    <option value="">Choose Customer...</option>
                                    {customers.map(c => <option key={c._id} value={c._id}>{c.userId?.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer border-0 pt-0">
                            <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary rounded-pill px-4">Create Allocation</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ManageAllocations;
