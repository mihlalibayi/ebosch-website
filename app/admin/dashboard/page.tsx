'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-config';
import { 
  LogOut, BarChart3, Calendar, Tag, Building2, Package, 
  ClipboardList, ImageIcon, Users, CreditCard 
} from 'lucide-react';

// Import all sections
import AdminOverview from '@/components/admin/AdminOverview';
import AdminEvents from '@/components/admin/AdminEvents';
import CategoriesManagement from '@/components/admin/CategoriesManagement';
import BusinessesManagement from '@/components/admin/BusinessesManagement';
import ProductsManagement from '@/components/admin/ProductsManagement';
import OrdersManagement from '@/components/admin/OrdersManagement';
import MembershipsManagement from '@/components/admin/MembershipsManagement';
import DonationsManagement from '@/components/admin/DonationsManagement';
import AdminPastEvents from '@/components/admin/AdminPastEvents';
import EventRequestsManagement from '@/components/admin/EventRequestsManagement';

type SectionType = 
  | 'overview' 
  | 'events' 
  | 'eventRequests'
  | 'pastGallery'
  | 'categories' 
  | 'businesses' 
  | 'products' 
  | 'orders' 
  | 'memberships' 
  | 'donations';

interface MenuItem {
  id: SectionType;
  label: string;
  icon: React.ReactNode;
  allowedEmails?: string[];
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionType>('overview');
  const router = useRouter();

  const menuItems: MenuItem[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={20} /> },
    { id: 'events', label: 'Events', icon: <Calendar size={20} /> },
    { 
      id: 'eventRequests', 
      label: 'Event Requests', 
      icon: <ClipboardList size={20} />,
      allowedEmails: ['members.ebosch@gmail.com']
    },
    { 
      id: 'pastGallery', 
      label: 'Past Gallery', 
      icon: <ImageIcon size={20} />,
      allowedEmails: ['members.ebosch@gmail.com', 'office.ebosch@gmail.com']
    },
    { id: 'categories', label: 'Categories', icon: <Tag size={20} />, allowedEmails: ['members.ebosch@gmail.com'] },
    { id: 'businesses', label: 'Businesses', icon: <Building2 size={20} />, allowedEmails: ['members.ebosch@gmail.com'] },
    { id: 'products', label: 'Products', icon: <Package size={20} />, allowedEmails: ['members.ebosch@gmail.com'] },
    { id: 'orders', label: 'Orders', icon: <ClipboardList size={20} />, allowedEmails: ['members.ebosch@gmail.com'] },
    { id: 'memberships', label: 'Memberships', icon: <Users size={20} /> },
    { id: 'donations', label: 'Donations', icon: <CreditCard size={20} />, allowedEmails: ['members.ebosch@gmail.com'] },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/admin');
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/admin');
  };

  const visibleMenuItems = menuItems.filter(item => {
    if (!item.allowedEmails) return true;
    const userEmail = user?.email?.toLowerCase();
    return item.allowedEmails.some(email => email.toLowerCase() === userEmail);
  });

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminOverview />;
      case 'events':
        return <AdminEvents />;
      case 'eventRequests':
        return <EventRequestsManagement />;
      case 'pastGallery':
        return <AdminPastEvents />;
      case 'categories':
        return <CategoriesManagement />;
      case 'businesses':
        return <BusinessesManagement />;
      case 'products':
        return <ProductsManagement />;
      case 'orders':
        return <OrdersManagement />;
      case 'memberships':
        return <MembershipsManagement user={user} />;
      case 'donations':
        return <DonationsManagement />;
      default:
        return <AdminOverview />;
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Sidebar */}
      <div
        style={{
          width: '250px',
          backgroundColor: 'white',
          boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: '#2d5016',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <img 
              src="/logo.jpg" 
              alt="e'Bosch"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0' }}>
              e'Bosch
            </p>
            <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0 0' }}>
              Admin Panel
            </p>
          </div>
        </div>

        <nav style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto'
        }}>
          {visibleMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                width: '100%',
                padding: '12px 16px',
                marginBottom: '8px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeSection === item.id ? '#f0fdf4' : 'transparent',
                color: activeSection === item.id ? '#2d5016' : '#6b7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                fontWeight: activeSection === item.id ? '600' : 'normal',
                transition: 'all 0.2s',
                borderLeft: activeSection === item.id ? '3px solid #2d5016' : '3px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{
          padding: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              fontWeight: 'normal',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fecaca';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fee2e2';
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              {user?.email}
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#2d5016',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto'
        }}>
          {renderSection()}
        </div>
      </div>
    </div>
  );
}