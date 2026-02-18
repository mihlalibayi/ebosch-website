'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, onSnapshot, setDoc, doc } from 'firebase/firestore';

interface StoreView {
  timestamp: any;
  sessionId: string;
}

interface OrderDoc {
  totalPrice: number;
  createdAt: any;
  items?: { rootCategory?: string; price?: number; quantity?: number }[];
  rootCategory?: string;
}

const YEARS = [2026, 2027];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function AdminOverview() {
  const now = new Date();

  const [metrics, setMetrics] = useState({
    events: 0,
    categories: 0,
    businesses: 0,
    products: 0,
    storeViews: { today: 0, week: 0, month: 0, quarter: 0 },
    storeViewsByYear: {} as Record<number, number>,
    orders: { total: 0, thisMonth: 0 },
    memberships: { total: 0, thisMonth: 0 },
    monthlyMembers: 0,
    referralSummary: { amanda: 0, william: 0, other: 0 },
    otherReferralNames: [] as string[],
    membershipByType: { individual: 0, business: 0, socialImpact: 0 },
    revenue: { total: 0, thisMonth: 0 },
    allOrders: [] as OrderDoc[],
  });

  const [loading, setLoading] = useState(true);
  const [salesMonth, setSalesMonth] = useState(now.getMonth());
  const [salesYear, setSalesYear] = useState(now.getFullYear());
  const [viewsYear, setViewsYear] = useState(now.getFullYear());

  useEffect(() => {
    loadAllMetrics();
    setupRealtimeListeners();
  }, []);

  const loadAllMetrics = async () => {
    try {
      const eventsSnap = await getDocs(collection(db, 'events'));
      const events = eventsSnap.size;

      let categories = 0;
      try { const s = await getDocs(collection(db, 'categories')); categories = s.size; } catch (e) {}
      let businesses = 0;
      try { const s = await getDocs(collection(db, 'businesses')); businesses = s.size; } catch (e) {}
      let products = 0;
      try { const s = await getDocs(collection(db, 'products')); products = s.size; } catch (e) {}

      // Store views
      let storeViewsMetrics = { today: 0, week: 0, month: 0, quarter: 0 };
      let storeViewsByYear: Record<number, number> = {};
      try {
        const viewsSnap = await getDocs(collection(db, 'store_analytics'));
        const views = viewsSnap.docs.map(d => ({
          timestamp: d.data().timestamp?.toDate?.() || new Date(d.data().timestamp),
          sessionId: d.data().sessionId
        })) as StoreView[];
        const n = new Date();
        storeViewsMetrics = calculateViewMetrics(views, n);
        views.forEach(v => {
          const yr = new Date(v.timestamp).getFullYear();
          storeViewsByYear[yr] = (storeViewsByYear[yr] || 0) + 1;
        });
      } catch (e) {}

      // Orders
      let orders = { total: 0, thisMonth: 0 };
      let revenue = { total: 0, thisMonth: 0 };
      let allOrders: OrderDoc[] = [];
      try {
        const ordersSnap = await getDocs(collection(db, 'store_orders'));
        allOrders = ordersSnap.docs.map(d => ({
          totalPrice: d.data().totalPrice || 0,
          createdAt: d.data().createdAt?.toDate?.() || new Date(d.data().createdAt),
          items: d.data().items || [],
          rootCategory: d.data().rootCategory || '',
        }));
        const n = new Date();
        const monthStart = new Date(n.getFullYear(), n.getMonth(), 1);
        orders = {
          total: allOrders.length,
          thisMonth: allOrders.filter(o => new Date(o.createdAt) >= monthStart).length
        };
        revenue = {
          total: allOrders.reduce((s, o) => s + o.totalPrice, 0),
          thisMonth: allOrders.filter(o => new Date(o.createdAt) >= monthStart).reduce((s, o) => s + o.totalPrice, 0)
        };
      } catch (e) {}

      // Memberships
      let memberships = { total: 0, thisMonth: 0 };
      let monthlyMembers = 0;
      let referralSummary = { amanda: 0, william: 0, other: 0 };
      let membershipByType = { individual: 0, business: 0, socialImpact: 0 };
      let otherReferralNames: string[] = [];

      try {
        const membersSnap = await getDocs(collection(db, 'annual_memberships'));
        const memberData = membersSnap.docs.map(d => ({ createdAt: d.data().createdAt?.toDate?.() || new Date() }));
        const n = new Date();
        const monthStart = new Date(n.getFullYear(), n.getMonth(), 1);
        memberships = {
          total: memberData.length,
          thisMonth: memberData.filter(m => new Date(m.createdAt) >= monthStart).length
        };
      } catch (e) {}

      try {
        const monthlySnap = await getDocs(collection(db, 'monthly_memberships'));
        monthlyMembers = monthlySnap.size;
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
          .filter((v, i, a) => a.indexOf(v) === i);

        referralSummary = {
          amanda: allReferrals.filter(r => r === 'Amanda Horne').length,
          william: allReferrals.filter(r => r === 'William Horne').length,
          other: allReferrals.filter(r => r === 'Other').length,
        };

        membershipByType = {
          individual: allDocs.filter(d => d.membershipType === 'individual').length,
          business: allDocs.filter(d => d.membershipType === 'business').length,
          socialImpact: allDocs.filter(d => d.membershipType === 'social_impact').length,
        };
      } catch (e) {}

      setMetrics({ events, categories, businesses, products, storeViews: storeViewsMetrics, storeViewsByYear, orders, memberships, monthlyMembers, referralSummary, otherReferralNames, membershipByType, revenue, allOrders });
      setLoading(false);
    } catch (error) {
      console.error('Error loading metrics:', error);
      setLoading(false);
    }
  };

  const setupRealtimeListeners = () => {
    try { onSnapshot(collection(db, 'events'), () => loadAllMetrics()); } catch (e) {}
    try { onSnapshot(collection(db, 'store_orders'), () => loadAllMetrics()); } catch (e) {}
    try { onSnapshot(collection(db, 'store_analytics'), () => loadAllMetrics()); } catch (e) {}
    try { onSnapshot(collection(db, 'annual_memberships'), () => loadAllMetrics()); } catch (e) {}
  };

  const calculateViewMetrics = (views: StoreView[], now: Date) => {
    const today = new Date(now); today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now); monthAgo.setMonth(monthAgo.getMonth() - 1);
    const quarterAgo = new Date(now); quarterAgo.setMonth(quarterAgo.getMonth() - 3);
    return {
      today: views.filter(v => new Date(v.timestamp) >= today).length,
      week: views.filter(v => new Date(v.timestamp) >= weekAgo).length,
      month: views.filter(v => new Date(v.timestamp) >= monthAgo).length,
      quarter: views.filter(v => new Date(v.timestamp) >= quarterAgo).length,
    };
  };

  const getSalesForPeriod = () => {
    const periodOrders = metrics.allOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getFullYear() === salesYear && d.getMonth() === salesMonth;
    });

    const total = periodOrders.length;
    const revenue = periodOrders.reduce((s, o) => s + o.totalPrice, 0);

    const cats: Record<string, { orders: number; revenue: number }> = {
      ebosch: { orders: 0, revenue: 0 },
      local_businesses: { orders: 0, revenue: 0 },
      community_businesses: { orders: 0, revenue: 0 },
      other: { orders: 0, revenue: 0 },
    };

    periodOrders.forEach(o => {
      if (o.items && o.items.length > 0) {
        o.items.forEach(item => {
          const cat = (item.rootCategory || o.rootCategory || '').toLowerCase();
          const itemRevenue = (item.price || 0) * (item.quantity || 1);
          if (cat.includes('ebosch')) { cats.ebosch.orders++; cats.ebosch.revenue += itemRevenue; }
          else if (cat.includes('local')) { cats.local_businesses.orders++; cats.local_businesses.revenue += itemRevenue; }
          else if (cat.includes('community')) { cats.community_businesses.orders++; cats.community_businesses.revenue += itemRevenue; }
          else { cats.other.orders++; cats.other.revenue += itemRevenue; }
        });
      } else {
        const cat = (o.rootCategory || '').toLowerCase();
        if (cat.includes('ebosch')) { cats.ebosch.orders++; cats.ebosch.revenue += o.totalPrice; }
        else if (cat.includes('local')) { cats.local_businesses.orders++; cats.local_businesses.revenue += o.totalPrice; }
        else if (cat.includes('community')) { cats.community_businesses.orders++; cats.community_businesses.revenue += o.totalPrice; }
        else { cats.other.orders++; cats.other.revenue += o.totalPrice; }
      }
    });

    return { total, revenue, categories: cats };
  };

  const initializeCategories = async () => {
    try {
      const rootCats = [
        { id: 'ebosch', name: "e'BOSCH" },
        { id: 'local_businesses', name: 'LOCAL BUSINESSES' },
        { id: 'community_businesses', name: 'COMMUNITY BUSINESSES' },
        { id: 'services', name: 'SERVICES' }
      ];
      for (const c of rootCats) {
        await setDoc(doc(db, 'categories', c.id), { name: c.name, type: 'root', subcategories: [] });
      }
      alert('Root categories initialized successfully!');
      loadAllMetrics();
    } catch (error) {
      alert('Error initializing categories');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTop: '4px solid #2d5016', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#6b7280' }}>Loading dashboard...</p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const salesData = getSalesForPeriod();
  const isCurrentMonth = salesMonth === now.getMonth() && salesYear === now.getFullYear();

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>Dashboard Overview</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>Real-time metrics and analytics</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Events" value={metrics.events} icon="📅" color="#2d5016" />
        <StatCard label="Categories" value={metrics.categories} icon="🏷️" color="#2d5016" />
        <StatCard label="Businesses" value={metrics.businesses} icon="🏢" color="#2d5016" />
        <StatCard label="Products" value={metrics.products} icon="📦" color="#2d5016" />
      </div>

      {/* Membership Breakdown + Progress */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '20px', marginTop: 0 }}>
          Members by Type <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 'normal' }}>(annual + monthly combined)</span>
        </h2>
        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'Individual', count: metrics.membershipByType.individual, color: '#0369a1', bg: '#dbeafe' },
              { label: 'Business', count: metrics.membershipByType.business, color: '#92400e', bg: '#fef3c7' },
              { label: 'Social Impact Investor', count: metrics.membershipByType.socialImpact, color: '#6b21a8', bg: '#f3e8ff' },
              { label: 'Total', count: metrics.membershipByType.individual + metrics.membershipByType.business + metrics.membershipByType.socialImpact, color: '#2d5016', bg: '#dcfce7' },
            ].map(({ label, count, color, bg }) => (
              <div key={label} style={{ backgroundColor: bg, borderRadius: '8px', padding: '16px 20px', minWidth: '110px' }}>
                <p style={{ fontSize: '12px', color: color, margin: '0 0 4px 0', fontWeight: 'normal' }}>{label}</p>
                <p style={{ fontSize: '28px', fontWeight: '700', color: color, margin: '0' }}>{count}</p>
              </div>
            ))}
          </div>
          <div style={{ width: '1px', backgroundColor: '#e5e7eb', alignSelf: 'stretch', minHeight: '80px' }} />
          {(() => {
            const total = metrics.membershipByType.individual + metrics.membershipByType.business + metrics.membershipByType.socialImpact;
            const target = 500;
            const pct = Math.min((total / target) * 100, 100);
            return (
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#111827', margin: 0 }}>Target: 500 Members</p>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{total} / {target}</p>
                </div>
                <div style={{ backgroundColor: '#e5e7eb', borderRadius: '999px', height: '12px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#2d5016', borderRadius: '999px', transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{pct.toFixed(1)}% reached</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{target - total} remaining</p>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Store Views + Sales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '32px' }}>

        {/* Store Views */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>Store Views</h2>
            <select value={viewsYear} onChange={(e) => setViewsYear(Number(e.target.value))}
              style={{ padding: '4px 10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', backgroundColor: 'white', cursor: 'pointer' }}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
            {[
              { label: 'Today', value: metrics.storeViews.today },
              { label: 'This Week', value: metrics.storeViews.week },
              { label: 'This Month', value: metrics.storeViews.month },
              { label: 'This Quarter', value: metrics.storeViews.quarter },
            ].map(({ label, value }) => (
              <div key={label} style={{ backgroundColor: '#f0fdf4', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <p style={{ fontSize: '10px', color: '#4b7c2a', margin: '0 0 4px 0', fontWeight: 'normal', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#2d5016', margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>
          <div style={{ backgroundColor: '#2d5016', borderRadius: '8px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '13px', color: 'white', margin: 0, fontWeight: 'normal' }}>{viewsYear} Total Views</p>
            <p style={{ fontSize: '22px', fontWeight: '700', color: 'white', margin: 0 }}>{metrics.storeViewsByYear[viewsYear] || 0}</p>
          </div>
        </div>

        {/* Sales with month/year selector */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
              Sales {isCurrentMonth ? '· This Month' : `· ${MONTHS[salesMonth]} ${salesYear}`}
            </h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              <select value={salesMonth} onChange={(e) => setSalesMonth(Number(e.target.value))}
                style={{ padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', backgroundColor: 'white', cursor: 'pointer' }}>
                {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
              <select value={salesYear} onChange={(e) => setSalesYear(Number(e.target.value))}
                style={{ padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', backgroundColor: 'white', cursor: 'pointer' }}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: '#f0fdf4', borderRadius: '8px', padding: '12px' }}>
              <p style={{ fontSize: '11px', color: '#4b7c2a', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 'normal' }}>Total Orders</p>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#2d5016', margin: 0 }}>{salesData.total}</p>
            </div>
            <div style={{ backgroundColor: '#f0fdf4', borderRadius: '8px', padding: '12px' }}>
              <p style={{ fontSize: '11px', color: '#4b7c2a', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 'normal' }}>Total Revenue</p>
              <p style={{ fontSize: '22px', fontWeight: '700', color: '#2d5016', margin: 0 }}>R {salesData.revenue.toLocaleString()}</p>
            </div>
          </div>

          <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 8px 0', fontWeight: 'normal', textTransform: 'uppercase', letterSpacing: '0.4px' }}>By Category</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { label: "e'Bosch", key: 'ebosch' as const, color: '#2d5016', bg: '#dcfce7' },
              { label: 'Local Businesses', key: 'local_businesses' as const, color: '#0369a1', bg: '#dbeafe' },
              { label: 'Community Businesses', key: 'community_businesses' as const, color: '#92400e', bg: '#fef3c7' },
            ].map(({ label, key, color, bg }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: bg, borderRadius: '6px', padding: '8px 12px' }}>
                <p style={{ fontSize: '13px', color: color, margin: 0, fontWeight: 'normal' }}>{label}</p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <p style={{ fontSize: '13px', color: color, margin: 0, fontWeight: 'normal' }}>{salesData.categories[key].orders} orders</p>
                  <p style={{ fontSize: '13px', color: color, margin: 0, fontWeight: '600' }}>R {salesData.categories[key].revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Referral Summary */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 20px 0' }}>Referrals by Team Member</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          {[
            { name: 'Amanda Horne', count: metrics.referralSummary.amanda, initials: 'AH' },
            { name: 'William Horne', count: metrics.referralSummary.william, initials: 'WH' },
          ].map(({ name, count, initials }) => (
            <div key={name} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#2d5016', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', flexShrink: 0 }}>
                {initials}
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 2px 0', fontWeight: 'normal' }}>{name}</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#2d5016', margin: 0, lineHeight: 1 }}>{count}</p>
                <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0 0', fontWeight: 'normal' }}>referral{count !== 1 ? 's' : ''}</p>
              </div>
            </div>
          ))}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#6b7280', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', flexShrink: 0 }}>?</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 2px 0', fontWeight: 'normal' }}>Other / Unknown</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#6b7280', margin: 0, lineHeight: 1 }}>{metrics.referralSummary.other}</p>
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0 0', fontWeight: 'normal' }}>referral{metrics.referralSummary.other !== 1 ? 's' : ''}</p>
              {metrics.otherReferralNames.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                  {metrics.otherReferralNames.map((name, i) => (
                    <span key={i} style={{ fontSize: '11px', color: '#374151', backgroundColor: '#f3f4f6', borderRadius: '4px', padding: '2px 8px' }}>{name}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {metrics.categories === 0 && (
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button onClick={initializeCategories}
            style={{ padding: '10px 16px', backgroundColor: '#065f46', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', fontWeight: 'normal' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#047857'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#065f46'; }}>
            Initialize Root Categories
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0', fontWeight: 'normal' }}>{label}</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: color, margin: '0' }}>{value}</p>
        </div>
        <span style={{ fontSize: '32px' }}>{icon}</span>
      </div>
    </div>
  );
}
