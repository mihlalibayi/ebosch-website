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
    monthlyMembers: 0,
    referralSummary: { sias: 0, amanda: 0, william: 0, other: 0 },
    otherReferralNames: [] as string[],
    membershipByType: { individual: 0, business: 0, socialImpact: 0 },
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
      let monthlyMembers = 0;
      let referralSummary = { sias: 0, amanda: 0, william: 0, other: 0 };
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

      let membershipByType = { individual: 0, business: 0, socialImpact: 0 };
      let otherReferralNames: string[] = [];
      try {
        const monthlySnap = await getDocs(collection(db, 'monthly_memberships'));
        monthlyMembers = monthlySnap.size;

        // Build referral summary and member type counts across all collections
        const allDocs: any[] = [];
        monthlySnap.docs.forEach(d => allDocs.push(d.data()));

        const annualSnap2 = await getDocs(collection(db, 'annual_memberships'));
        annualSnap2.docs.forEach(d => allDocs.push(d.data()));

        const socialSnap2 = await getDocs(collection(db, 'social_impact_members'));
        socialSnap2.docs.forEach(d => allDocs.push({ ...d.data(), membershipType: 'social_impact' }));

        const allReferrals = allDocs.map(d => d.referredBy || '');
        otherReferralNames = allDocs
          .filter(d => d.referredBy === 'Other' && d.referredByOther)
          .map(d => d.referredByOther as string)
          .filter((v, i, a) => a.indexOf(v) === i); // unique names

        referralSummary = {
          sias: allReferrals.filter(r => r === 'Sias Mostert').length,
          amanda: allReferrals.filter(r => r === 'Amanda Horne').length,
          william: allReferrals.filter(r => r === 'William Horne').length,
          other: allReferrals.filter(r => r === 'Other').length,
        };

        membershipByType = {
          individual: allDocs.filter(d => d.membershipType === 'individual').length,
          business: allDocs.filter(d => d.membershipType === 'business').length,
          socialImpact: allDocs.filter(d => d.membershipType === 'social_impact').length,
        };
      } catch (e) {
        monthlyMembers = 0;
      }

      setMetrics({
        events,
        categories,
        businesses,
        products,
        storeViews: storeViewsMetrics,
        orders,
        memberships,
        monthlyMembers,
        referralSummary,
        otherReferralNames,
        membershipByType,
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

      {/* Membership Breakdown */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px', marginTop: 0 }}>
          Members by Type <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 'normal' }}>(annual + monthly combined)</span>
        </h2>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          {[
            { label: 'Individual', count: metrics.membershipByType.individual, color: '#0369a1', bg: '#dbeafe' },
            { label: 'Business', count: metrics.membershipByType.business, color: '#92400e', bg: '#fef3c7' },
            { label: 'Social Impact Investor', count: metrics.membershipByType.socialImpact, color: '#6b21a8', bg: '#f3e8ff' },
            { label: 'Total', count: metrics.membershipByType.individual + metrics.membershipByType.business + metrics.membershipByType.socialImpact, color: '#2d5016', bg: '#dcfce7' },
          ].map(({ label, count, color, bg }) => (
            <div key={label} style={{ backgroundColor: bg, borderRadius: '8px', padding: '16px 24px', minWidth: '120px' }}>
              <p style={{ fontSize: '12px', color: color, margin: '0 0 4px 0', fontWeight: 'normal' }}>{label}</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: color, margin: '0' }}>{count}</p>
            </div>
          ))}
        </div>
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

      {/* Referral Summary */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px', marginTop: 0 }}>
          Referrals by Team Member
        </h2>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          {[
            { name: 'Sias Mostert', count: metrics.referralSummary.sias },
            { name: 'Amanda Horne', count: metrics.referralSummary.amanda },
            { name: 'William Horne', count: metrics.referralSummary.william },
          ].map(({ name, count }) => (
            <div key={name}>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>{name}</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#2d5016', margin: '0' }}>{count}</p>
            </div>
          ))}
          <div>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Other / Unknown</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#2d5016', margin: '0 0 6px 0' }}>{metrics.referralSummary.other}</p>
            {metrics.otherReferralNames.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {metrics.otherReferralNames.map((name, i) => (
                  <span key={i} style={{ fontSize: '12px', color: '#6b7280', backgroundColor: '#f3f4f6', borderRadius: '4px', padding: '2px 8px' }}>{name}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {metrics.categories === 0 && (
        <div style={{
          textAlign: 'center',
          marginTop: '32px'
        }}>
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
        </div>
      )}
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