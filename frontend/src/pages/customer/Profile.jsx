import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { User, Shield, MapPin, Phone, Mail, Calendar, Camera, Upload, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ phone: '', address: '' });
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
    const [uploading, setUploading] = useState({ photo: false, aadhar: false, pan: false, dl: false });

    useEffect(() => {

        const fetchProfile = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('rdToken')}` } };
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/customer/accounts`, config);
                const data = res.data[0]; 
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
            toast.success('Profile updated successfully!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/change-password`, passwords);
            setPasswords({ oldPassword: '', newPassword: '' });
            toast.success('Password updated successfully!');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Failed to update password.');
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(prev => ({ ...prev, photo: true }));
        const formDataUpload = new FormData();
        formDataUpload.append('profilePhoto', file);

        try {
            const config = { headers: { 
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('rdToken')}`
            } };
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/customer/profile-photo`, formDataUpload, config);
            setProfile({ ...profile, profilePictureUrl: res.data.imageUrl });
            toast.success('Profile photo updated!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(prev => ({ ...prev, photo: false }));
        }
    };

    const handleKycUpload = async (e, docType) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(prev => ({ ...prev, [docType === 'adharCard' ? 'aadhar' : docType === 'panCard' ? 'pan' : 'dl']: true }));
        const formDataUpload = new FormData();
        formDataUpload.append('document', file);
        formDataUpload.append('docType', docType);

        try {
            const config = { headers: { 
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('rdToken')}`
            } };
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/customer/kyc-upload`, formDataUpload, config);
            setProfile(res.data.customer);
            toast.success(`${docType.replace('Card', '')} uploaded! Status set to pending.`);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(prev => ({ ...prev, [docType === 'adharCard' ? 'aadhar' : docType === 'panCard' ? 'pan' : 'dl']: false }));
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
                            <div className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center bg-light border border-primary border-2" style={{width: 120, height: 120}}>
                                {profile?.profilePictureUrl ? (
                                    <img 
                                        src={`${import.meta.env.VITE_API_URL}${profile.profilePictureUrl}`} 
                                        alt="Profile" 
                                        className="w-100 h-100 object-fit-cover"
                                    />
                                ) : (
                                    <span className="text-primary fw-bold" style={{fontSize: '3rem'}}>{profile?.userId?.name?.charAt(0)}</span>
                                )}
                                {uploading.photo && (
                                    <div className="position-absolute translate-middle top-50 start-50">
                                        <div className="spinner-border spinner-border-sm text-primary"></div>
                                    </div>
                                )}
                            </div>
                            <label className="position-absolute bottom-0 end-0 bg-primary text-white p-2 rounded-circle cursor-pointer shadow-sm hover-scale mb-0" style={{width: 38, height: 38}}>
                                <Camera size={18} />
                                <input type="file" className="d-none" onChange={handlePhotoUpload} accept="image/*" />
                            </label>
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

                    <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
                        <div className="card-header bg-white border-0 p-4 pb-0">
                            <h5 className="fw-bold mb-0">Documents & KYC Verification</h5>
                        </div>
                        <div className="card-body p-4 pt-2">
                            <div className="row g-3">
                                {[
                                    { id: 'adharCard', label: 'Aadhaar Card', value: profile?.adharCard, key: 'aadhar' },
                                    { id: 'panCard', label: 'PAN Card', value: profile?.panCard, key: 'pan' },
                                    { id: 'drivingLicence', label: 'Driving Licence', value: profile?.drivingLicence, key: 'dl' }
                                ].map((doc) => (
                                    <div key={doc.id} className="col-12">
                                        <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3 border">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-white p-2 rounded shadow-sm">
                                                    {doc.value ? <CheckCircle className="text-success" size={20} /> : <Shield className="text-muted" size={20} />}
                                                </div>
                                                <div>
                                                    <span className="d-block fw-bold small">{doc.label}</span>
                                                    {doc.value ? (
                                                        <a href={`${import.meta.env.VITE_API_URL}${doc.value}`} target="_blank" rel="noreferrer" className="text-primary small text-decoration-none hover-underline">View Document</a>
                                                    ) : (
                                                        <small className="text-secondary">Not uploaded yet</small>
                                                    )}
                                                </div>
                                            </div>
                                            <label className="btn btn-sm btn-white border shadow-sm rounded-pill px-3 mb-0 transition-all hover-bg-primary hover-text-white cursor-pointer d-flex align-items-center gap-2">
                                               {uploading[doc.key] ? <span className="spinner-border spinner-border-sm"></span> : <><Upload size={14} /> Upload</>}
                                               <input type="file" className="d-none" onChange={(e) => handleKycUpload(e, doc.id)} accept="image/*,application/pdf" />
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
