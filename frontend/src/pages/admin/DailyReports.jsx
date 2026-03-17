import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Download, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DailyReports = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` } };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/reports/daily?date=${date}`, config);
      setReportData(res.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (reportData.length === 0) return toast.error('No data to export');
    
    const headers = ['Agent Name', 'Entries Count', 'Total Collected'];
    const rows = reportData.map(item => [
      item.agentName,
      item.entriesCount,
      item.totalAmount
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Daily_Report_${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchReport();
  }, [date]);

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-dark fw-bold mb-0">Daily Collection Reports</h2>
          <p className="text-muted small">Overview of collections by agents for a specific day</p>
        </div>
        <div className="d-flex gap-2">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0"><Calendar size={18} className="text-primary"/></span>
            <input 
              type="date" 
              className="form-control border-start-0 ps-0" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <button 
            onClick={handleExport}
            className="btn btn-outline-primary d-flex align-items-center gap-2"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>


      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-primary text-white h-100">
            <div className="card-body">
              <h6 className="opacity-75 mb-2">Total Day's Collection</h6>
              <h3 className="fw-bold mb-0">₹{reportData.reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h6 className="text-muted mb-2">Total Transactions</h6>
              <h3 className="fw-bold mb-0">{reportData.reduce((acc, curr) => acc + curr.entriesCount, 0)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h6 className="text-muted mb-2">Active Agents Today</h6>
              <h3 className="fw-bold mb-0">{reportData.length}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive p-3">
            <table className="table table-hover align-middle mb-0">
              <thead className="text-muted small text-uppercase">
                <tr>
                  <th>Agent Name</th>
                  <th>Entries Count</th>
                  <th>Total Collected</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-4"><span className="spinner-border text-primary"></span></td></tr>
                ) : reportData.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-4 text-muted">No collections recorded for this date.</td></tr>
                ) : (
                  reportData.map((item, idx) => (
                    <tr key={idx}>
                      <td className="fw-bold text-dark">{item.agentName}</td>
                      <td>{item.entriesCount}</td>
                      <td className="text-success fw-bold">₹{item.totalAmount.toLocaleString()}</td>
                      <td className="text-end">
                        <button className="btn btn-light btn-sm text-primary">View Details</button>
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

export default DailyReports;
