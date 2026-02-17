'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-config';
import { LogOut, BarChart3, Calendar, Tag, Building2, Package, ClipboardList, Settings } from 'lucide-react';

// Import all sections
import AdminOverview from '@/components/admin/AdminOverview';
import AdminEvents from '@/components/admin/AdminEvents';
import CategoriesManagement from '@/components/admin/CategoriesManagement';
import BusinessesManagement from '@/components/admin/BusinessesManagement';
import ProductsManagement from '@/components/admin/ProductsManagement';
import OrdersManagement from '@/components/admin/OrdersManagement';
import MembershipsManagement from '@/components/admin/MembershipsManagement';

type SectionType = 'overview' | 'events' | 'categories' | 'businesses' | 'products' | 'orders' | 'memberships';

interface MenuItem {
  id: SectionType;
  label: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 size={20} /> },
  { id: 'events', label: 'Events', icon: <Calendar size={20} /> },
  { id: 'categories', label: 'Categories', icon: <Tag size={20} /> },
  { id: 'businesses', label: 'Businesses', icon: <Building2 size={20} /> },
  { id: 'products', label: 'Products', icon: <Package size={20} /> },
  { id: 'orders', label: 'Orders', icon: <ClipboardList size={20} /> },
  { id: 'memberships', label: 'Memberships', icon: <ClipboardList size={20} /> },
];

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<SectionType>('overview');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser || currentUser.email !== 'members.ebosch@gmail.com') {
        router.push('/admin');
      } else {
        setUser(currentUser);
      }
    });
    return unsubscribe;
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/admin');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminOverview />;
      case 'events':
        return <AdminEvents />;
      case 'categories':
        return <CategoriesManagement />;
      case 'businesses':
        return <BusinessesManagement />;
      case 'products':
        return <ProductsManagement />;
      case 'orders':
        return <OrdersManagement />;
      case 'memberships':
        return <MembershipsManagement />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Sidebar - Always Visible */}
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
        {/* Sidebar Header */}
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

        {/* Menu Items */}
        <nav style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto'
        }}>
          {menuItems.map((item) => (
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

        {/* Logout Button */}
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
        {/* Top Bar */}
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

        {/* Content Area */}
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
