'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { Mail, Calendar, DollarSign } from 'lucide-react';

interface AnnualMembership {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  membershipType: 'individual' | 'business';
  price: number;
  status: 'active' | 'expired' | 'pending_payment';
  purchaseDate: string;
  expiryDate: string;
  renewalDate?: string;
  createdAt?: any;
}

interface MonthlyMembership {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  membershipType: 'individual' | 'business';
  businessName?: string;
  businessPrize?: boolean;
  price: number;
  status: 'active' | 'paused' | 'cancelled';
  subscriptionDate: string;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  createdAt?: any;
}

export default function MembershipsManagement() {
  const [activeTab, setActiveTab] = useState<'annual' | 'monthly'>('annual');
  const [annualMembers, setAnnualMembers] = useState<AnnualMembership[]>([]);
  const [monthlyMembers, setMonthlyMembers] = useState<MonthlyMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadMemberships();
  }, []);

  const loadMemberships = async () => {
    try {
      setLoading(true);

      // Load annual memberships
      const annualSnap = await getDocs(collection(db, 'annual_memberships'));
      const annualData = annualSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() || new Date()
      })) as AnnualMembership[];
      setAnnualMembers(annualData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

      // Load monthly memberships
      const monthlySnap = await getDocs(collection(db, 'monthly_memberships'));
      const monthlyData = monthlySnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() || new Date()
      })) as MonthlyMembership[];
      setMonthlyMembers(monthlyData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

      setLoading(false);
    } catch (error) {
      console.error('Error loading memberships:', error);
      setLoading(false);
    }
  };

  const updateAnnualStatus = async (memberId: string, newStatus: 'active' | 'expired' | 'pending_payment') => {
    try {
      await updateDoc(doc(db, 'annual_memberships', memberId), { status: newStatus });
      loadMemberships();
    } catch (error) {
      console.error('Error updating membership:', error);
      alert('Error updating membership');
    }
  };

  const renewAnnualMembership = async (memberId: string) => {
    try {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      await updateDoc(doc(db, 'annual_memberships', memberId), {
        status: 'active',
        expiryDate: expiryDate.toISOString(),
        renewalDate: new Date().toISOString()
      });
      loadMemberships();
      alert('Membership renewed successfully');
    } catch (error) {
      console.error('Error renewing membership:', error);
      alert('Error renewing membership');
    }
  };

  const updateMonthlyStatus = async (memberId: string, newStatus: 'active' | 'paused' | 'cancelled') => {
    try {
      await updateDoc(doc(db, 'monthly_memberships', memberId), { status: newStatus });
      loadMemberships();
    } catch (error) {
      console.error('Error updating membership:', error);
      alert('Error updating membership');
    }
  };

  const markPaymentReceived = async (memberId: string) => {
    try {
      const nextPaymentDate = new Date();
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

      await updateDoc(doc(db, 'monthly_memberships', memberId), {
        status: 'active',
        lastPaymentDate: new Date().toISOString(),
        nextPaymentDate: nextPaymentDate.toISOString()
      });
      loadMemberships();
      setShowPaymentModal(false);
      setSelectedMember(null);
      alert('Payment marked as received');
    } catch (error) {
      console.error('Error marking payment:', error);
      alert('Error marking payment');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      active: '#10b981',
      expired: '#ef4444',
      pending_payment: '#f59e0b',
      paused: '#8b5cf6',
      cancelled: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
          Memberships Management
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
          Manage annual and monthly memberships
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '0'
      }}>
        <button
          onClick={() => setActiveTab('annual')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeTab === 'annual' ? '#2d5016' : 'transparent',
            color: activeTab === 'annual' ? 'white' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'annual' ? '3px solid #2d5016' : 'none',
            cursor: 'pointer',
            fontWeight: 'normal',
            fontSize: '15px',
            transition: 'all 0.2s',
            marginBottom: '-2px'
          }}
        >
          📅 Annual Memberships
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeTab === 'monthly' ? '#2d5016' : 'transparent',
            color: activeTab === 'monthly' ? 'white' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'monthly' ? '3px solid #2d5016' : 'none',
            cursor: 'pointer',
            fontWeight: 'normal',
            fontSize: '15px',
            transition: 'all 0.2s',
            marginBottom: '-2px'
          }}
        >
          🔄 Monthly Memberships
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #2d5016',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>Loading memberships...</p>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : activeTab === 'annual' ? (
        /* Annual Memberships */
        annualMembers.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '60px 24px',
            textAlign: 'center',
            color: '#6b7280',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <p style={{ fontSize: '16px', margin: '0' }}>No annual memberships yet</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {annualMembers.map(member => (
              <div key={member.id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '16px', alignItems: 'center' }}>
                  {/* Member Info */}
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Member</p>
                    <p style={{ fontSize: '14px', fontWeight: 'normal', color: '#111827', margin: '0' }}>
                      {member.customerName}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>
                      {member.customerEmail}
                    </p>
                  </div>

                  {/* Membership Type */}
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Type</p>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      backgroundColor: member.membershipType === 'individual' ? '#dbeafe' : '#fef3c7',
                      color: member.membershipType === 'individual' ? '#0369a1' : '#92400e',
                      fontSize: '12px',
                      fontWeight: 'normal',
                      borderRadius: '4px'
                    }}>
                      {member.membershipType === 'individual' ? 'Individual' : 'Business'}
                    </span>
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Expiry Date</p>
                    <p style={{ fontSize: '14px', fontWeight: 'normal', color: '#111827', margin: '0' }}>
                      {new Date(member.expiryDate).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Status</p>
                    <select
                      value={member.status}
                      onChange={(e) => updateAnnualStatus(member.id, e.target.value as any)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: getStatusColor(member.status),
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'normal',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="pending_payment">Pending Payment</option>
                    </select>
                  </div>

                  {/* Renew Button */}
                  <button
                    onClick={() => renewAnnualMembership(member.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'normal',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#059669';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#10b981';
                    }}
                  >
                    🔄 Renew
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Monthly Memberships */
        monthlyMembers.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '60px 24px',
            textAlign: 'center',
            color: '#6b7280',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <p style={{ fontSize: '16px', margin: '0' }}>No monthly memberships yet</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {monthlyMembers.map(member => (
              <div key={member.id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '16px', alignItems: 'center' }}>
                  {/* Member Info */}
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Member</p>
                    <p style={{ fontSize: '14px', fontWeight: 'normal', color: '#111827', margin: '0' }}>
                      {member.customerName}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>
                      {member.customerEmail}
                    </p>
                  </div>

                  {/* Last Payment */}
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Last Payment</p>
                    <p style={{ fontSize: '14px', fontWeight: 'normal', color: '#111827', margin: '0' }}>
                      {member.lastPaymentDate ? new Date(member.lastPaymentDate).toLocaleDateString() : 'No payment yet'}
                    </p>
                  </div>

                  {/* Next Payment Date */}
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Next Payment</p>
                    <p style={{ fontSize: '14px', fontWeight: 'normal', color: '#111827', margin: '0' }}>
                      {member.nextPaymentDate ? new Date(member.nextPaymentDate).toLocaleDateString() : '-'}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Status</p>
                    <select
                      value={member.status}
                      onChange={(e) => updateMonthlyStatus(member.id, e.target.value as any)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: getStatusColor(member.status),
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'normal',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setSelectedMember(member);
                        setShowPaymentModal(true);
                      }}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'normal',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1e40af';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#3b82f6';
                      }}
                    >
                      💰 Payment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedMember && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px', marginTop: '0' }}>
              Mark Payment Received
            </h3>

            <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #d1fae5' }}>
              <p style={{ fontSize: '14px', color: '#111827', margin: '0 0 8px 0', fontWeight: 'normal' }}>
                <strong>Member:</strong> {selectedMember.customerName}
              </p>
              <p style={{ fontSize: '14px', color: '#111827', margin: '0 0 8px 0', fontWeight: 'normal' }}>
                <strong>Type:</strong> {selectedMember.membershipType === 'individual' ? 'Individual - R100' : `Business - R${selectedMember.price}`}
              </p>
              <p style={{ fontSize: '14px', color: '#111827', margin: '0', fontWeight: 'normal' }}>
                <strong>Payment Date:</strong> Today ({new Date().toLocaleDateString()})
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedMember(null);
                }}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => markPaymentReceived(selectedMember.id)}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#10b981';
                }}
              >
                ✓ Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
