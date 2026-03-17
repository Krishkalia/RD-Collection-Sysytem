import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings as SettingsIcon, Bell, Lock, Globe, Shield } from 'lucide-react';

const Settings = () => {
  const [config, setConfig] = useState({
    orgName: 'STITCH RD Collection System',
    supportEmail: 'support@stitch.com',
    currency: 'INR (₹)',
    timezone: 'GMT +5:30 (India)',
    autoCommission: true,
    kycRequired: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/setting`);
        if (Object.keys(res.data).length > 0) {
          setConfig(prev => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig({
      ...config,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/setting/batch`, config);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in">
      <h2 className="text-dark fw-bold mb-4">System Settings</h2>

      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="list-group shadow-sm rounded-4 border-0">
            <button className="list-group-item list-group-item-action active border-0 py-3 d-flex align-items-center gap-3">
              <SettingsIcon size={18} /> General Configuration
            </button>
            <button className="list-group-item list-group-item-action border-0 py-3 d-flex align-items-center gap-3">
              <Bell size={18} /> Notifications
            </button>
            <button className="list-group-item list-group-item-action border-0 py-3 d-flex align-items-center gap-3">
              <Lock size={18} /> Security & Access
            </button>
            <button className="list-group-item list-group-item-action border-0 py-3 d-flex align-items-center gap-3">
              <Globe size={18} /> Regional & Currency
            </button>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">General Configuration</h5>
              
              <div className="mb-4">
                <label className="form-label text-muted small fw-bold">Organization Name</label>
                <input 
                  type="text" 
                  name="orgName"
                  className="form-control bg-light border-0" 
                  value={config.orgName} 
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-muted small fw-bold">Support Email</label>
                <input 
                  type="email" 
                  name="supportEmail"
                  className="form-control bg-light border-0" 
                  value={config.supportEmail} 
                  onChange={handleChange}
                />
              </div>

              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-bold">System Currency</label>
                  <select 
                    name="currency"
                    className="form-select bg-light border-0"
                    value={config.currency}
                    onChange={handleChange}
                  >
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-bold">Timezone</label>
                  <select 
                    name="timezone"
                    className="form-select bg-light border-0"
                    value={config.timezone}
                    onChange={handleChange}
                  >
                    <option>GMT +5:30 (India)</option>
                    <option>GMT +0:00 (UTC)</option>
                  </select>
                </div>
              </div>

              <div className="form-check form-switch mb-4">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  name="autoCommission"
                  checked={config.autoCommission} 
                  onChange={handleChange}
                />
                <label className="form-check-label fw-medium ms-2">Enable Automatic Agent Commissions</label>
              </div>

              <div className="form-check form-switch mb-4">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  name="kycRequired"
                  checked={config.kycRequired} 
                  onChange={handleChange}
                />
                <label className="form-check-label fw-medium ms-2">KYC Verification Required for Payouts</label>
              </div>

              <div className="text-end mt-4">
                <button 
                  className="btn btn-primary-custom px-5"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
