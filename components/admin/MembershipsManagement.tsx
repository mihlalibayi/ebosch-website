'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

interface Membership {
  id: string;
  productName: string;
  customerName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  businessName?: string;
  websiteUrl?: string;
  businessRegistration?: string;
  businessType?: string;
  title?: string;
  investorType?: string;
  annualFee?: number;
  price: number;
  status: 'active' | 'expired' | 'pending_payment' | 'paused' | 'cancelled';
  membershipType: 'individual' | 'business' | 'social_impact';
  expiryDate?: string;
  renewalDate?: string;
  createdAt: any;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  isMonthly?: boolean;
}

export default function MembershipsManagement() {
  const [activeTab, setActiveTab] = useState<'annual' | 'monthly'>('annual');
  const [members, setMembers] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Membership | null>(null);

  useEffect(() => {
    loadMemberships();
  }, [activeTab]);

  const loadMemberships = async () => {
    try {
      setLoading(true);
      let allMembers: Membership[] = [];

      if (activeTab === 'annual') {
        // Load from annual_memberships collection
        const annualSnap = await getDocs(collection(db, 'annual_memberships'));
        const annualData = annualSnap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          isMonthly: false,
          createdAt: d.data().createdAt?.toDate?.() || new Date()
        })) as Membership[];

        // Load from social_impact_members collection
        const socialSnap = await getDocs(collection(db, 'social_impact_members'));
        const socialData = socialSnap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          isMonthly: false,
          createdAt: d.data().createdAt?.toDate?.() || new Date()
        })) as Membership[];

        allMembers = [...annualData, ...socialData];
      } else {
        // Load from monthly_memberships collection (future)
        const monthlySnap = await getDocs(collection(db, 'monthly_memberships'));
        allMembers = monthlySnap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          isMonthly: true,
          createdAt: d.data().createdAt?.toDate?.() || new Date()
        })) as Membership[];
      }

      setMembers(allMembers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    } catch (error) {
      console.error('Error loading memberships:', error);
      setLoading(false);
    }
  };

  const updateStatus = async (memberId: string, newStatus: string) => {
    try {
      const member = members.find(m => m.id === memberId);
      if (!member) return;

      const collection_name = activeTab === 'annual' 
        ? (member.membershipType === 'social_impact' ? 'social_impact_members' : 'annual_memberships')
        : 'monthly_memberships';

      await updateDoc(doc(db, collection_name, memberId), { status: newStatus });
      loadMemberships();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  const renewMembership = async (memberId: string) => {
    try {
      const member = members.find(m => m.id === memberId);
      if (!member) return;

      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      const collection_name = member.membershipType === 'social_impact' ? 'social_impact_members' : 'annual_memberships';
      await updateDoc(doc(db, collection_name, memberId), {
        status: 'active',
        expiryDate: expiryDate.toISOString(),
        renewalDate: new Date().toISOString()
      });
      loadMemberships();
      alert('Membership renewed successfully');
    } catch (error) {
      console.error('Error renewing:', error);
      alert('Error renewing membership');
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

  const getMemberDetails = (member: Membership) => {
    const details = [];

    if (member.membershipType === 'individual') {
      details.push({ label: 'Name', value: `${member.firstName} ${member.lastName}` });
      details.push({ label: 'Email', value: member.email });
      if (member.phone) details.push({ label: 'Phone', value: member.phone });
      if (member.address) details.push({ label: 'Address', value: member.address });
    } else if (member.membershipType === 'business') {
      details.push({ label: 'Business Name', value: member.businessName });
      details.push({ label: 'Email', value: member.email });
      if (member.phone) details.push({ label: 'Phone', value: member.phone });
      if (member.websiteUrl) details.push({ label: 'Website', value: member.websiteUrl });
      if (member.businessRegistration) details.push({ label: 'Business Registration', value: member.businessRegistration });
      if (member.businessType) details.push({ label: 'Business Type', value: member.businessType });
    } else if (member.membershipType === 'social_impact') {
      if (member.investorType === 'individual') {
        if (member.title) details.push({ label: 'Title', value: member.title });
        details.push({ label: 'Name', value: `${member.firstName} ${member.lastName}` });
      } else {
        details.push({ label: 'Business Name', value: member.businessName });
        if (member.websiteUrl) details.push({ label: 'Website', value: member.websiteUrl });
      }
      details.push({ label: 'Email', value: member.email });
      if (member.phone) details.push({ label: 'Phone', value: member.phone });
      details.push({ label: 'Annual Fee', value: `R${member.annualFee || member.price}` });
    }

    return details;
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'normal', color: '#111827', margin: '0 0 8px 0' }}>
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
      ) : members.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '60px 24px',
          textAlign: 'center',
          color: '#6b7280',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <p style={{ fontSize: '16px', margin: '0' }}>
            No {activeTab === 'annual' ? 'annual' : 'monthly'} memberships yet
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {members.map(member => (
            <div key={member.id} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              border: '1px solid #e5e7eb'
            }}>
              {/* Header Row */}
              <div style={{
                padding: '20px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                gap: '16px',
                alignItems: 'center',
                borderBottom: expandedMember === member.id ? '1px solid #e5e7eb' : 'none',
                backgroundColor: expandedMember === member.id ? '#f9fafb' : 'white',
                cursor: 'pointer'
              }}
              onClick={() => setExpandedMember(expandedMember === member.id ? null : member.id)}>
                {/* Member Name */}
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Member</p>
                  <p style={{ fontSize: '14px', fontWeight: 'normal', color: '#111827', margin: '0' }}>
                    {member.firstName && member.lastName 
                      ? `${member.firstName} ${member.lastName}` 
                      : member.businessName || 'N/A'}
                  </p>
                </div>

                {/* Membership Type */}
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Type</p>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    backgroundColor: member.membershipType === 'individual' ? '#dbeafe' : member.membershipType === 'business' ? '#fef3c7' : '#f3e8ff',
                    color: member.membershipType === 'individual' ? '#0369a1' : member.membershipType === 'business' ? '#92400e' : '#6b21a8',
                    fontSize: '12px',
                    fontWeight: 'normal',
                    borderRadius: '4px'
                  }}>
                    {member.membershipType === 'individual' ? 'Individual' : member.membershipType === 'business' ? 'Business' : 'Social Impact'}
                  </span>
                </div>

                {/* Email */}
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Email</p>
                  <p style={{ fontSize: '12px', fontWeight: 'normal', color: '#111827', margin: '0', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {member.email}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Status</p>
                  <select
                    value={member.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateStatus(member.id, e.target.value);
                    }}
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
                    {activeTab === 'annual' ? (
                      <>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="pending_payment">Pending Payment</option>
                      </>
                    ) : (
                      <>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="cancelled">Cancelled</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (activeTab === 'annual') {
                      renewMembership(member.id);
                    } else {
                      setSelectedMember(member);
                      setShowPaymentModal(true);
                    }
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: activeTab === 'annual' ? '#10b981' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'normal',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {activeTab === 'annual' ? '🔄 Renew' : '💰 Payment'}
                </button>
              </div>

              {/* Expanded Details */}
              {expandedMember === member.id && (
                <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 'normal', color: '#111827', margin: '0 0 16px 0' }}>
                    Member Details
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {getMemberDetails(member).map((detail, idx) => (
                      <div key={idx}>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: 'normal' }}>
                          {detail.label}
                        </p>
                        <p style={{ fontSize: '14px', color: '#111827', margin: '0', fontWeight: 'normal' }}>
                          {detail.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Dates */}
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                    {activeTab === 'annual' && member.expiryDate && (
                      <>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: 'normal' }}>
                          Expiry Date
                        </p>
                        <p style={{ fontSize: '14px', color: '#111827', margin: '0 0 12px 0', fontWeight: 'normal' }}>
                          {new Date(member.expiryDate).toLocaleDateString()}
                        </p>
                      </>
                    )}
                    {activeTab === 'monthly' && (
                      <>
                        {member.lastPaymentDate && (
                          <>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: 'normal' }}>
                              Last Payment
                            </p>
                            <p style={{ fontSize: '14px', color: '#111827', margin: '0 0 12px 0', fontWeight: 'normal' }}>
                              {new Date(member.lastPaymentDate).toLocaleDateString()}
                            </p>
                          </>
                        )}
                        {member.nextPaymentDate && (
                          <>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: 'normal' }}>
                              Next Payment Due
                            </p>
                            <p style={{ fontSize: '14px', color: '#111827', margin: '0', fontWeight: 'normal' }}>
                              {new Date(member.nextPaymentDate).toLocaleDateString()}
                            </p>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
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
            <h3 style={{ fontSize: '20px', fontWeight: 'normal', color: '#111827', marginBottom: '24px', marginTop: '0' }}>
              Mark Payment Received
            </h3>

            <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #d1fae5' }}>
              <p style={{ fontSize: '14px', color: '#111827', margin: '0 0 8px 0', fontWeight: 'normal' }}>
                <strong>Member:</strong> {selectedMember.firstName && selectedMember.lastName ? `${selectedMember.firstName} ${selectedMember.lastName}` : selectedMember.businessName}
              </p>
              <p style={{ fontSize: '14px', color: '#111827', margin: '0', fontWeight: 'normal' }}>
                <strong>Payment Date:</strong> {new Date().toLocaleDateString()}
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
                  cursor: 'pointer'
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
                  cursor: 'pointer'
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
