import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Target, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AgentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/agent/stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load agent dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statItems = [
    { title: 'My Customers', value: stats?.assignedCustomers || 0, color: 'text-primary', icon: <Users /> },
    { title: 'Collected Today', value: `₹${stats?.todayCollection?.toLocaleString() || 0}`, color: 'text-success', icon: <CheckCircle /> },
    { title: 'Month to Date', value: `₹${stats?.monthCollection?.toLocaleString() || 0}`, color: 'text-info', icon: <Target /> },
    { 
      title: 'Est. Commission', 
      value: `₹${((stats?.monthCollection || 0) * (stats?.commissionRate || 2) / 100).toLocaleString()}`, 
      color: 'text-warning', 
      icon: <Clock /> 
    },
  ];


  return (
    <div className="fade-in">
      <h2 className="mb-4 text-dark fw-bold">Agent Dashboard</h2>
      
      {loading ? (
        <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            {statItems.map((stat, idx) => (
              <div className="col-md-3" key={idx}>
                <div className="stat-card p-4 border-0 shadow-sm rounded-4 bg-white hover-shadow transition-all border-bottom border-4" 
                     style={{ borderBottomColor: `var(--bs-${stat.color.split('-')[1]})` }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className={`p-2 rounded-3 bg-opacity-10 bg-${stat.color.split('-')[1]} ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                  <h6 className="text-muted mb-1 small fw-bold">{stat.title}</h6>
                  <h3 className={`fw-bold mb-0 ${stat.color}`}>{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card shadow-sm border-0 rounded-4">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">Quick Actions</h5>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <button onClick={() => navigate('/agent/customers')} className="btn btn-primary-custom w-100 py-3 rounded-3 d-flex align-items-center justify-content-center gap-2">
                        <Users size={20} /> New Collection
                      </button>
                    </div>
                    <div className="col-md-6">
                      <button onClick={() => navigate('/agent/collections')} className="btn btn-outline-primary w-100 py-3 rounded-3 d-flex align-items-center justify-content-center gap-2">
                        <Clock size={20} /> View History
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="card shadow-sm border-0 rounded-4 h-100 bg-primary text-white overflow-hidden position-relative">
                <div className="card-body p-4 position-relative z-index-1">
                  <h5 className="fw-bold mb-3">Monthly Goal</h5>
                  <p className="small mb-4 text-white-50">You've reached 65% of your ₹50k collection goal. Keep it up!</p>
                  <div className="progress mb-3 bg-white bg-opacity-20" style={{ height: '8px' }}>
                    <div className="progress-bar bg-white" style={{ width: '65%' }}></div>
                  </div>
                  <div className="d-flex justify-content-between small fw-bold">
                    <span>₹32,500</span>
                    <span>₹50,000</span>
                  </div>
                </div>
                <Users size={120} className="position-absolute bottom-0 end-0 opacity-10 mb-n4 me-n4" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AgentDashboard;
