'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, onSnapshot, setDoc, doc } from 'firebase/firestore';

interface StoreView {
  timestamp: any;
  sessionId: string;
}

export default function AdminOverview() {
  const [metrics, setMetrics] = useState({
    events: 0,
    categories: 0,
    businesses: 0,
    products: 0,
    storeViews: { today: 0, week: 0, month: 0, quarter: 0, year: 0 },
    orders: { total: 0, thisMonth: 0 },
    memberships: { total: 0, thisMonth: 0 },
    revenue: { total: 0, thisMonth: 0 }
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllMetrics();
    setupRealtimeListeners();
  }, []);

  const loadAllMetrics = async () => {
    try {
      const eventsSnap = await getDocs(collection(db, 'events'));
      const events = eventsSnap.size;

      let categories = 0;
      try {
        const categoriesSnap = await getDocs(collection(db, 'categories'));
        categories = categoriesSnap.size;
      } catch (e) {
        categories = 0;
      }

      let businesses = 0;
      try {
        const businessesSnap = await getDocs(collection(db, 'businesses'));
        businesses = businessesSnap.size;
      } catch (e) {
        businesses = 0;
      }

      let products = 0;
      try {
        const productsSnap = await getDocs(collection(db, 'products'));
        products = productsSnap.size;
      } catch (e) {
        products = 0;
      }

      let storeViewsMetrics = { today: 0, week: 0, month: 0, quarter: 0, year: 0 };
      try {
        const viewsSnap = await getDocs(collection(db, 'store_analytics'));
        const views = viewsSnap.docs.map(d => ({
          timestamp: d.data().timestamp?.toDate?.() || new Date(d.data().timestamp),
          sessionId: d.data().sessionId
        })) as StoreView[];

        const now = new Date();
        storeViewsMetrics = calculateViewMetrics(views, now);
      } catch (e) {
        storeViewsMetrics = { today: 0, week: 0, month: 0, quarter: 0, year: 0 };
      }

      let orders = { total: 0, thisMonth: 0 };
      let revenue = { total: 0, thisMonth: 0 };
      try {
        const ordersSnap = await getDocs(collection(db, 'store_orders'));
        const ordersData = ordersSnap.docs.map(d => ({
          totalPrice: d.data().totalPrice || 0,
          createdAt: d.data().createdAt?.toDate?.() || new Date(d.data().createdAt)
        }));

        const now = new Date();
        orders = {
          total: ordersData.length,
          thisMonth: ordersData.filter(o => {
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return new Date(o.createdAt) >= monthAgo;
          }).length
        };

        revenue = {
          total: ordersData.reduce((sum, o) => sum + o.totalPrice, 0),
          thisMonth: ordersData
            .filter(o => {
              const monthAgo = new Date(now);
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return new Date(o.createdAt) >= monthAgo;
            })
            .reduce((sum, o) => sum + o.totalPrice, 0)
        };
      } catch (e) {
        orders = { total: 0, thisMonth: 0 };
        revenue = { total: 0, thisMonth: 0 };
      }

      let memberships = { total: 0, thisMonth: 0 };
      try {
        const membersSnap = await getDocs(collection(db, 'annual_memberships'));
        const memberData = membersSnap.docs.map(d => ({
          createdAt: d.data().createdAt?.toDate?.() || new Date(d.data().createdAt)
        }));

        const now = new Date();
        memberships = {
          total: memberData.length,
          thisMonth: memberData.filter(m => {
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return new Date(m.createdAt) >= monthAgo;
          }).length
        };
      } catch (e) {
        memberships = { total: 0, thisMonth: 0 };
      }

      setMetrics({
        events,
        categories,
        businesses,
        products,
        storeViews: storeViewsMetrics,
        orders,
        memberships,
        revenue
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading metrics:', error);
      setLoading(false);
    }
  };

  const setupRealtimeListeners = () => {
    try {
      onSnapshot(collection(db, 'events'), () => loadAllMetrics());
    } catch (e) {}

    try {
      onSnapshot(collection(db, 'store_orders'), () => loadAllMetrics());
    } catch (e) {}

    try {
      onSnapshot(collection(db, 'store_analytics'), () => loadAllMetrics());
    } catch (e) {}

    try {
      onSnapshot(collection(db, 'annual_memberships'), () => loadAllMetrics());
    } catch (e) {}
  };

  const calculateViewMetrics = (views: StoreView[], now: Date) => {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const quarterAgo = new Date(now);
    quarterAgo.setMonth(quarterAgo.getMonth() - 3);

    const yearAgo = new Date(now);
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    return {
      today: views.filter(v => new Date(v.timestamp) >= today).length,
      week: views.filter(v => new Date(v.timestamp) >= weekAgo).length,
      month: views.filter(v => new Date(v.timestamp) >= monthAgo).length,
      quarter: views.filter(v => new Date(v.timestamp) >= quarterAgo).length,
      year: views.filter(v => new Date(v.timestamp) >= yearAgo).length
    };
  };

  const initializeCategories = async () => {
    try {
      const rootCategories = [
        { id: 'ebosch', name: "e'BOSCH", subcategories: [] },
        { id: 'local_businesses', name: 'LOCAL BUSINESSES', subcategories: [] },
        { id: 'community_businesses', name: 'COMMUNITY BUSINESSES', subcategories: [] },
        { id: 'services', name: 'SERVICES', subcategories: [] }
      ];

      for (const category of rootCategories) {
        await setDoc(doc(db, 'categories', category.id), {
          name: category.name,
          type: 'root',
          subcategories: category.subcategories
        });
      }

      alert('Root categories initialized successfully!');
      loadAllMetrics();
    } catch (error) {
      console.error('Error initializing categories:', error);
      alert('Error initializing categories');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #2d5016',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280' }}>Loading dashboard...</p>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
          Dashboard Overview
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
          Real-time metrics and analytics
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <StatCard label="Events" value={metrics.events} icon="📅" color="#2d5016" />
        <StatCard label="Categories" value={metrics.categories} icon="🏷️" color="#2d5016" />
        <StatCard label="Businesses" value={metrics.businesses} icon="🏢" color="#2d5016" />
        <StatCard label="Products" value={metrics.products} icon="📦" color="#2d5016" />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
            Store Views
          </h2>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Today</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#2d5016', margin: '0' }}>
                {metrics.storeViews.today}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>This Week</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#2d5016', margin: '0' }}>
                {metrics.storeViews.week}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>This Month</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#2d5016', margin: '0' }}>
                {metrics.storeViews.month}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>This Quarter</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#2d5016', margin: '0' }}>
                {metrics.storeViews.quarter}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>This Year</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#2d5016', margin: '0' }}>
                {metrics.storeViews.year}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
            Sales This Month
          </h3>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Total Orders</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#2d5016', margin: '0' }}>
              {metrics.orders.thisMonth}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Total Revenue</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#2d5016', margin: '0' }}>
              R {metrics.revenue.thisMonth.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: '#f3fce8',
        border: '1px solid #d1fae5',
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center',
        color: '#065f46',
        fontSize: '14px'
      }}>
        <p style={{ margin: '0 0 12px 0' }}>
          💡 As you create businesses, categories, and products in the admin panel, they will appear here in real-time!
        </p>
        {metrics.categories === 0 && (
          <button
            onClick={initializeCategories}
            style={{
              padding: '10px 16px',
              backgroundColor: '#065f46',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 'normal',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#047857';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#065f46';
            }}
          >
            Initialize Root Categories
          </button>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      transition: 'all 0.2s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0', fontWeight: 'normal' }}>
            {label}
          </p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: color, margin: '0' }}>
            {value}
          </p>
        </div>
        <span style={{ fontSize: '32px' }}>{icon}</span>
      </div>
    </div>
  );
}