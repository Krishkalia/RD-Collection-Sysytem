import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserCheck, IndianRupee, Layers, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalCustomers: 0,
    todayCollection: 0,
    totalPlans: 0,
    chartData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Assuming token is stored in localStorage or similar for authenticated requests
        const token = localStorage.getItem('token'); 
        const config = {
          headers: {
            'Content-Type': 'application/json'
          }
        };
        if (token) {
          config.headers['x-auth-token'] = token; // Or 'Authorization': `Bearer ${token}`
        }

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats`, config);
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
        toast.error('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Simple SVG Line Chart logic
  const renderChart = () => {
    if (!stats.chartData || stats.chartData.length === 0) {
      return <div className="text-muted small">No collection history available yet</div>;
    }

    const maxVal = Math.max(...stats.chartData.map(d => d.total), 1000);
    const width = 600;
    const height = 200;
    const points = stats.chartData.map((d, i) => {
      const x = (i / (stats.chartData.length - 1 || 1)) * width;
      const y = height - (d.total / maxVal) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="100%" height="200" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d6efd" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0d6efd" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M 0,${height} L ${points} L ${width},${height} Z`} fill="url(#chartGradient)" />
        <polyline fill="none" stroke="#0d6efd" strokeWidth="3" points={points} />
        {stats.chartData.map((d, i) => (
          <circle key={i} cx={(i / (stats.chartData.length - 1 || 1)) * width} cy={height - (d.total / maxVal) * height} r="4" fill="#0d6efd" />
        ))}
      </svg>
    );
  };

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark fw-bold mb-0">Admin Dashboard</h2>
        <div className="text-muted small">Real-time system overview</div>
      </div>

      <div className="row g-4 mb-4">
        {[ 
          { title: 'Total Agents', value: stats.totalAgents, growth: stats.agentsGrowth, color: 'text-primary', icon: <Users size={20}/> },
          { title: 'Active Customers', value: stats.totalCustomers, growth: stats.customersGrowth, color: 'text-success', icon: <UserCheck size={20}/> },
          { title: "Today's Collection", value: `₹${(stats.todayCollection || 0).toLocaleString()}`, growth: stats.collectionGrowth, color: 'text-warning', icon: <IndianRupee size={20}/> },
          { title: 'Total Plans', value: stats.totalPlans, growth: stats.plansGrowth, color: 'text-info', icon: <Layers size={20}/> },
        ].map((stat, idx) => (
          <div className="col-md-3" key={idx}>
            <div className="stat-card">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 className="text-muted mb-0">{stat.title}</h6>
                <div className={`p-2 rounded-3 bg-light ${stat.color}`}>{stat.icon}</div>
              </div>
              <h3 className={`fw-bold mb-0`}>{loading ? '...' : stat.value}</h3>
              <div className={`small mt-2 ${stat.growth >= 0 ? 'text-success' : 'text-danger'}`}>
                <TrendingUp size={14} className={`me-1 ${stat.growth < 0 ? 'rotate-180' : ''}`} /> 
                <span className="fw-medium">{stat.growth >= 0 ? '+' : ''}{stat.growth}%</span> vs last month
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="row g-4">
        <div className="col-md-8">
          <div className="card shadow-sm border-0 h-100 rounded-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title fw-bold mb-0">Collection Overview</h5>
                <select className="form-select form-select-sm border-0 bg-light" style={{ width: '120px' }}>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
              <div className="bg-light bg-opacity-50 p-3 rounded-4" style={{ height: '240px' }}>
                {loading ? (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="spinner-border text-primary" role="status"></div>
                  </div>
                ) : renderChart()}
              </div>
              <div className="mt-4 d-flex gap-4">
                <div className="small d-flex align-items-center gap-2">
                  <div className="rounded-circle bg-primary" style={{ width: 10, height: 10 }}></div>
                  <span>Total Daily Collection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100 rounded-4">
            <div className="card-body p-4">
              <h5 className="card-title fw-bold mb-4">Recent Alerts</h5>
              <div className="list-group list-group-flush">
                {stats.recentNotifications && stats.recentNotifications.length > 0 ? (
                  stats.recentNotifications.map((notif, idx) => (
                    <div key={notif._id} className={`list-group-item px-0 py-3 border-0 ${idx > 0 ? 'border-top' : ''}`}>
                      <div className="d-flex w-100 justify-content-between mb-1">
                        <h6 className={`mb-0 fw-bold small ${
                            notif.type === 'payment' ? 'text-success' : 
                            notif.type === 'system' ? 'text-danger' : 'text-primary'
                        }`}>{notif.title}</h6>
                        <small className="text-muted">{new Date(notif.sentAt).toLocaleDateString()}</small>
                      </div>
                      <p className="mb-0 text-muted extra-small">{notif.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-muted small">No recent alerts found.</div>
                )}
              </div>
              <button onClick={() => window.location.href='#/notifications'} className="btn btn-light w-100 mt-3 btn-sm text-primary fw-bold">View All Notifications</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
