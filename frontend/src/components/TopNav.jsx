import React, { useState, useEffect } from 'react';
import { Navbar, Container, Dropdown, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Bell, CheckCircle, Menu } from 'lucide-react';

const TopNav = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const getFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_API_URL}${path}`;
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/notification`);
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.isRead).length);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/notification/read-all`);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/notification/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <Navbar bg="white" expand="lg" className="border-bottom sticky-top py-2 px-3 ps-lg-4 pe-lg-4 d-flex justify-content-between">
      <div className="d-flex align-items-center gap-2">
        <button 
          className="btn btn-light d-lg-none p-2 border-0 shadow-none mobile-toggle"
          onClick={onToggleSidebar}
        >
          <Menu size={22} className="text-secondary" />
        </button>
        <h5 className="mb-0 text-dark fw-bold d-none d-sm-block">
          {user?.role === 'admin' && 'Admin Portal'}
          {user?.role === 'agent' && 'Agent Console'}
          {user?.role === 'user' && 'Customer Area'}
        </h5>
        <h6 className="mb-0 text-dark fw-bold d-sm-none">
          {user?.role === 'admin' && 'Admin'}
          {user?.role === 'agent' && 'Agent'}
          {user?.role === 'user' && 'Portal'}
        </h6>
      </div>
      
      <div className="d-flex align-items-center gap-3">
        <Dropdown align="end">
          <Dropdown.Toggle as="div" className="position-relative cursor-pointer">
            <button className="btn btn-light rounded-circle p-2 d-flex align-items-center">
              <Bell size={20} className="text-secondary" />
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                  <span className="visually-hidden">New alerts</span>
                </span>
              )}
            </button>
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow border-0 mt-3 p-0 rounded-4 overflow-hidden" style={{ width: '300px' }}>
            <div className="bg-light p-3 border-bottom d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">Notifications</h6>
              <button onClick={markAllAsRead} className="btn btn-link btn-sm p-0 text-decoration-none small">Mark all as read</button>
            </div>
            <div className="overflow-auto" style={{ maxHeight: '350px' }}>
              {notifications.length > 0 ? (
                notifications.map(n => (
                  <div 
                    key={n._id} 
                    className={`p-3 border-bottom notification-item ${!n.isRead ? 'bg-primary bg-opacity-10' : ''}`}
                    onClick={() => !n.isRead && markAsRead(n._id)}
                  >
                    <div className="d-flex gap-3">
                      <div className="pt-1">
                        <CheckCircle size={16} className={!n.isRead ? 'text-primary' : 'text-muted'} />
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between">
                          <span className="fw-bold small">{n.title}</span>
                          <small className="text-muted" style={{fontSize: '0.7rem'}}>{new Date(n.sentAt).toLocaleDateString()}</small>
                        </div>
                        <p className="mb-0 small text-secondary">{n.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted small">No notifications yet</div>
              )}
            </div>
          </Dropdown.Menu>
        </Dropdown>


        <Dropdown align="end">
          <Dropdown.Toggle variant="light" className="d-flex align-items-center border-0 gap-2 bg-transparent shadow-none" id="dropdown-basic">
            <div className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center bg-primary text-white border border-primary border-1" style={{ width: '35px', height: '35px' }}>
              {user?.profilePictureUrl ? (
                <img 
                  src={getFileUrl(user.profilePictureUrl)} 
                  alt={user?.name} 
                  className="w-100 h-100 object-fit-cover"
                />
              ) : (
                <User size={18} />
              )}
            </div>
            <span className="fw-medium text-dark d-none d-md-block">{user?.name}</span>
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow-sm border-0 mt-2 rounded-3">
            <Dropdown.Item href="#/profile" className="d-flex align-items-center gap-2 py-2">
              <User size={16} /> Profile
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={logout} className="d-flex align-items-center gap-2 py-2 text-danger">
              <LogOut size={16} /> Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </Navbar>
  );
};

export default TopNav;
