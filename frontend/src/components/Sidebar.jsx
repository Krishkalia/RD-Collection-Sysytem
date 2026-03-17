import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, UserPlus, 
  FileText, Briefcase, Settings, 
  CreditCard, Wallet, AreaChart,
  UserCheck, DollarSign
} from 'lucide-react';


const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Manage Agents', path: '/admin/agents', icon: <Briefcase size={20} /> },
    { name: 'All Customers', path: '/admin/customers', icon: <Users size={20} /> },
    { name: 'RD Accounts', path: '/admin/accounts', icon: <CreditCard size={20} /> },
    { name: 'Agent Allocations', path: '/admin/allocations', icon: <UserCheck size={20} /> },
    { name: 'Commissions', path: '/admin/commissions', icon: <DollarSign size={20} /> },
    { name: 'Daily Reports', path: '/admin/reports', icon: <FileText size={20} /> },


    { name: 'Investment Plans', path: '/admin/plans', icon: <AreaChart size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const agentLinks = [
    { name: 'Dashboard', path: '/agent', icon: <LayoutDashboard size={20} /> },
    { name: 'My Customers', path: '/agent/customers', icon: <Users size={20} /> },
    { name: 'Collection Entries', path: '/agent/collections', icon: <Wallet size={20} /> },
    { name: 'Track Commission', path: '/agent/commission', icon: <CreditCard size={20} /> },
  ];

  const userLinks = [
    { name: 'Dashboard', path: '/customer', icon: <LayoutDashboard size={20} /> },
    { name: 'My Passbook', path: '/customer/passbook', icon: <FileText size={20} /> },
    { name: 'Profile', path: '/customer/profile', icon: <UserPlus size={20} /> },
  ];

  let links = [];
  if (role === 'admin') links = adminLinks;
  else if (role === 'agent') links = agentLinks;
  else if (role === 'user') links = userLinks;

  return (
    <div className="sidebar p-3 d-flex flex-column">
      <div className="d-flex align-items-center gap-2 mb-4 px-2 py-3 border-bottom border-secondary border-opacity-25">
        <div className="bg-primary rounded p-2 d-flex align-items-center justify-content-center" style={{width: 38, height: 38}}>
          <span className="text-white fw-bold fs-5">R</span>
        </div>
        <span className="fs-5 fw-bold gradient-text m-0">RD System</span>
      </div>

      <div className="flex-grow-1">
        <small className="text-secondary text-uppercase fw-bold px-3 mb-2 d-block" style={{fontSize: '0.75rem', letterSpacing: '1px'}}>Main Menu</small>
        <div className="nav flex-column gap-1">
          {links.map((link, idx) => (
            <NavLink
              key={idx}
              to={link.path}
              end={link.path.split('/').length === 2} // Exact match only for root dashboards
              className={({ isActive }) => 
                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none transition-all ${
                  isActive 
                    ? 'bg-primary bg-opacity-10 text-primary fw-medium border-start border-primary border-4' 
                    : 'text-light text-opacity-75 hover-bg-dark'
                }`
              }
              style={{ paddingLeft: '1rem', transition: 'all 0.2s ease', borderLeft: '4px solid transparent' }}
            >
              <div style={{ opacity: 0.9 }}>{link.icon}</div>
              {link.name}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
