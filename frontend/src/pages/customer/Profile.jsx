import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { User, Shield, MapPin, Phone, Mail, Calendar } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ phone: '', address: '' });
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });

    useEffect(() => {

        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/customer/accounts`);
                const data = res.data[0]; // For demo, use first account's customer data
                if (data) {
                    setProfile(data.customerId);
                    setFormData({
                        phone: data.customerId.phone,
                        address: data.customerId.address
                    });
                }
            } catch (err) {
                console.error('Failed to fetch profile', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/customer/profile`, formData);
            setProfile({ ...profile, ...formData });
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/change-password`, passwords);
            setPasswords({ oldPassword: '', newPassword: '' });
            alert('Password updated successfully!');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to update password.');
        }
    };

    if (loading) return <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>;


    return (
        <div className="fade-in">
            <h2 className="text-dark fw-bold mb-4">My Profile</h2>
            
            <div className="row g-4">
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 text-center p-4 rounded-4">
                        <div className="position-relative d-inline-block mx-auto mb-3">
                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style={{width: 100, height: 100, fontSize: '2.5rem'}}>
                                {profile?.userId?.name?.charAt(0)}
                            </div>
                            <div className="position-absolute bottom-0 end-0 bg-success border border-white border-4 rounded-circle" style={{width: 25, height: 25}}></div>
                        </div>
                        <h4 className="fw-bold mb-1">{profile?.userId?.name}</h4>
                        <p className="text-muted small mb-3">Customer ID: {profile?._id?.substring(0, 8).toUpperCase()}</p>
                        <span className={`badge px-4 py-2 rounded-pill ${profile?.kycStatus === 'verified' ? 'bg-success' : 'bg-warning'}`}>
                            {profile?.kycStatus === 'verified' ? 'KYC Verified' : 'KYC Pending'}
                        </span>
                    </div>
                </div>

                <div className="col-lg-8">
                    {/* Personal Info Card (Existing) */}
                    <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
                        <div className="card-body p-0">
                            <div className="bg-primary p-4 text-white d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold">Personal Information</h5>
                                {!isEditing ? (
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="btn btn-sm btn-light rounded-pill px-3 fw-bold text-primary"
                                    >
                                        Edit Profile
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setIsEditing(false)}
                                        className="btn btn-sm btn-outline-light rounded-pill px-3"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                            <div className="p-4">
                                <form onSubmit={handleSave}>
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="text-muted"><Mail size={18} /></div>
                                                <div>
                                                    <small className="text-muted d-block">Email Address</small>
                                                    <span className="fw-bold">{profile?.userId?.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="text-muted"><Calendar size={18} /></div>
                                                <div>
                                                    <small className="text-muted d-block">Date of Birth</small>
                                                    <span className="fw-bold">{profile?.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="text-muted"><Phone size={18} /></div>
                                                <div className="flex-grow-1">
                                                    <small className="text-muted d-block">Phone Number</small>
                                                    {isEditing ? (
                                                        <input 
                                                            name="phone"
                                                            className="form-control form-control-sm mt-1"
                                                            value={formData.phone}
                                                            onChange={handleChange}
                                                        />
                                                    ) : (
                                                        <span className="fw-bold">{profile?.phone}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="text-muted"><Shield size={18} /></div>
                                                <div>
                                                    <small className="text-muted d-block">Authentication</small>
                                                    <span className="fw-bold">Security Active</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="text-muted"><MapPin size={18} /></div>
                                                <div className="flex-grow-1">
                                                    <small className="text-muted d-block">Residence Address</small>
                                                    {isEditing ? (
                                                        <textarea 
                                                            name="address"
                                                            className="form-control form-control-sm mt-1"
                                                            rows="2"
                                                            value={formData.address}
                                                            onChange={handleChange}
                                                        />
                                                    ) : (
                                                        <span className="fw-bold">{profile?.address}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {isEditing && (
                                        <div className="text-end mt-4">
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary rounded-pill px-4"
                                                disabled={saving}
                                            >
                                                {saving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Change Password Card */}
                    <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
                        <div className="card-header bg-white border-0 p-4 pb-0">
                            <h5 className="fw-bold mb-0">Security & Password</h5>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handlePasswordChange}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Old Password</label>
                                        <input 
                                            type="password" 
                                            className="form-control bg-light border-0" 
                                            value={passwords.oldPassword}
                                            onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">New Password</label>
                                        <input 
                                            type="password" 
                                            className="form-control bg-light border-0" 
                                            value={passwords.newPassword}
                                            onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="col-12 text-end">
                                        <button type="submit" className="btn btn-outline-primary rounded-pill px-4 btn-sm fw-bold">Update Password</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* KYC Document Section */}
                    <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                        <div className="card-header bg-white border-0 p-4 pb-0">
                            <h5 className="fw-bold mb-0">KYC Documents</h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between p-3 border rounded-3 border-dashed">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-light p-2 rounded"><MapPin className="text-muted" size={24} /></div>
                                    <div>
                                        <span className="d-block fw-bold">ID Proof / Address Proof</span>
                                        <small className="text-muted">Status: {profile?.kycStatus?.toUpperCase() || 'NOT UPLOADED'}</small>
                                    </div>
                                </div>
                                <button className="btn btn-primary btn-sm rounded-pill px-3">Upload New</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
