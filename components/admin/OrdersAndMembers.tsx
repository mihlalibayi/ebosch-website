'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { Plus, X, Edit2, Eye, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  type: 'ticket' | 'item';
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'unpaid' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  orderType: 'ebosch' | 'business';
  businessName?: string;
  deliveryInfo?: {
    type: 'pickup' | 'delivery';
    address?: string;
    fee?: number;
  };
  paymentMethod: 'payfast' | 'bank' | 'cash';
  createdAt?: any;
}

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: 'individual' | 'business';
  businessName?: string;
  status: 'active' | 'expired' | 'cancelled';
  startDate?: any;
  endDate?: any;
  amount: number;
  paymentMethod: 'payfast' | 'bank';
}

type SortBy = 'date' | 'amount' | 'status';
type SortOrder = 'asc' | 'desc';

export default function OrdersAndMembers() {
  const [activeTab, setActiveTab] = useState<'orders' | 'members'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMemberType, setFilterMemberType] = useState<string>('all');
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showEditStatus, setShowEditStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<Order['status']>('unpaid');
  const [editDeliveryInfo, setEditDeliveryInfo] = useState<Order['deliveryInfo']>();

  useEffect(() => {
    loadOrders();
    loadMembers();
  }, []);

  const loadOrders = async () => {
    try {
      const snap = await getDocs(collection(db, 'orders'));
      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() || new Date()
      })) as Order[];
      
      const sorted = sortOrders(data);
      setOrders(sorted);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadMembers = async () => {
    try {
      const snap = await getDocs(collection(db, 'memberships'));
      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        startDate: d.data().startDate?.toDate?.() || new Date(),
        endDate: d.data().endDate?.toDate?.() || new Date()
      })) as Member[];
      
      const sorted = sortMembers(data);
      setMembers(sorted);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const sortOrders = (ordersToSort: Order[]) => {
    const sorted = [...ordersToSort];
    
    if (sortBy === 'date') {
      sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (sortBy === 'amount') {
      sorted.sort((a, b) => 
        sortOrder === 'asc' ? a.totalAmount - b.totalAmount : b.totalAmount - a.totalAmount
      );
    } else if (sortBy === 'status') {
      const statusOrder = ['unpaid', 'paid', 'shipped', 'delivered', 'cancelled'];
      sorted.sort((a, b) => {
        const indexA = statusOrder.indexOf(a.status);
        const indexB = statusOrder.indexOf(b.status);
        return sortOrder === 'asc' ? indexA - indexB : indexB - indexA;
      });
    }
    
    return filterStatus === 'all' 
      ? sorted 
      : sorted.filter(o => o.status === filterStatus);
  };

  const sortMembers = (membersToSort: Member[]) => {
    const sorted = [...membersToSort];
    sorted.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    return filterMemberType === 'all'
      ? sorted
      : sorted.filter(m => m.membershipType === filterMemberType);
  };

  const handleSortOrders = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) return;

    try {
      await updateDoc(doc(db, 'orders', selectedOrder.id), { 
        status: newStatus,
        deliveryInfo: editDeliveryInfo
      });
      loadOrders();
      setShowEditStatus(false);
      setShowOrderDetails(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order');
    }
  };

  const handleUpdateMemberStatus = async (memberId: string, newMemberStatus: Member['status']) => {
    try {
      await updateDoc(doc(db, 'memberships', memberId), { status: newMemberStatus });
      loadMembers();
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Error updating member');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'unpaid': '#fee2e2',
      'paid': '#fef3c7',
      'shipped': '#dbeafe',
      'delivered': '#dcfce7',
      'cancelled': '#f3f4f6',
      'active': '#dcfce7',
      'expired': '#fee2e2'
    };
    return colors[status] || '#f3f4f6';
  };

  const getStatusColorText = (status: string) => {
    const colors: { [key: string]: string } = {
      'unpaid': '#991b1b',
      'paid': '#92400e',
      'shipped': '#0369a1',
      'delivered': '#166534',
      'cancelled': '#6b7280',
      'active': '#166534',
      'expired': '#991b1b'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
          Orders & Members
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
          Manage orders and annual memberships
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb' }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            color: activeTab === 'orders' ? '#2d5016' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'orders' ? '3px solid #2d5016' : 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: activeTab === 'orders' ? '600' : 'normal',
            transition: 'all 0.2s'
          }}
        >
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('members')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            color: activeTab === 'members' ? '#2d5016' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'members' ? '3px solid #2d5016' : 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: activeTab === 'members' ? '600' : 'normal',
            transition: 'all 0.2s'
          }}
        >
          Members ({members.length})
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Status</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
              <button
                onClick={() => handleSortOrders('date')}
                style={{
                  padding: '8px 12px',
                  backgroundColor: sortBy === 'date' ? '#f0fdf4' : '#f3f4f6',
                  color: sortBy === 'date' ? '#2d5016' : '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: sortBy === 'date' ? '600' : 'normal'
                }}
              >
                Date
              </button>
              <button
                onClick={() => handleSortOrders('amount')}
                style={{
                  padding: '8px 12px',
                  backgroundColor: sortBy === 'amount' ? '#f0fdf4' : '#f3f4f6',
                  color: sortBy === 'amount' ? '#2d5016' : '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: sortBy === 'amount' ? '600' : 'normal'
                }}
              >
                Amount
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            {orders.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center', color: '#6b7280' }}>
                No orders yet.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Order ID</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Customer</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Type</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Amount</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Status</th>
                      <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortOrders(orders).map((order, idx) => (
                      <tr
                        key={order.id}
                        style={{
                          borderBottom: '1px solid #e5e7eb',
                          backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f9fafb')}
                      >
                        <td style={{ padding: '16px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                          #{order.id.slice(0, 8)}
                        </td>
                        <td style={{ padding: '16px', fontSize: '13px', color: '#374151' }}>
                          {order.customerName}
                        </td>
                        <td style={{ padding: '16px', fontSize: '13px', color: '#374151' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            backgroundColor: order.orderType === 'ebosch' ? '#f0fdf4' : '#fef3c7',
                            color: order.orderType === 'ebosch' ? '#2d5016' : '#92400e',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            {order.orderType === 'ebosch' ? 'e\'Bosch' : order.businessName}
                          </span>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                          R{order.totalAmount.toFixed(2)}
                        </td>
                        <td style={{ padding: '16px', fontSize: '13px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            backgroundColor: getStatusColor(order.status),
                            color: getStatusColorText(order.status),
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'capitalize'
                          }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setNewStatus(order.status);
                              setEditDeliveryInfo(order.deliveryInfo);
                              setShowOrderDetails(true);
                            }}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#f0fdf4',
                              color: '#2d5016',
                              border: '1px solid #d1fae5',
                              borderRadius: '6px',
                              fontSize: '13px',
                              cursor: 'pointer',
                              fontWeight: 'normal'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dcfce7')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f0fdf4')}
                          >
                            <Eye size={14} style={{ display: 'inline', marginRight: '4px' }} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <select
              value={filterMemberType}
              onChange={(e) => setFilterMemberType(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Types</option>
              <option value="individual">Individual</option>
              <option value="business">Business</option>
            </select>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            {members.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center', color: '#6b7280' }}>
                No members yet.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Name</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Type</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Email</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Amount</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Status</th>
                      <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortMembers(members).map((member, idx) => (
                      <tr
                        key={member.id}
                        style={{
                          borderBottom: '1px solid #e5e7eb',
                          backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f9fafb')}
                      >
                        <td style={{ padding: '16px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                          {member.name}
                        </td>
                        <td style={{ padding: '16px', fontSize: '13px', color: '#374151' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            backgroundColor: member.membershipType === 'individual' ? '#f0fdf4' : '#dbeafe',
                            color: member.membershipType === 'individual' ? '#2d5016' : '#0369a1',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                            textTransform: 'capitalize'
                          }}>
                            {member.membershipType}
                          </span>
                        </td>
                        <td style={{ padding: '16px', fontSize: '13px', color: '#6b7280' }}>
                          {member.email}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                          R{member.amount.toFixed(2)}
                        </td>
                        <td style={{ padding: '16px', fontSize: '13px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            backgroundColor: getStatusColor(member.status),
                            color: getStatusColorText(member.status),
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'capitalize'
                          }}>
                            {member.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleUpdateMemberStatus(member.id, member.status === 'active' ? 'expired' : 'active')}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: member.status === 'active' ? '#fee2e2' : '#f0fdf4',
                                color: member.status === 'active' ? '#dc2626' : '#2d5016',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                fontWeight: 'normal'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = member.status === 'active' ? '#fecaca' : '#dcfce7';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = member.status === 'active' ? '#fee2e2' : '#f0fdf4';
                              }}
                            >
                              {member.status === 'active' ? 'Expire' : 'Renew'}
                            </button>
                            <button
                              onClick={() => handleUpdateMemberStatus(member.id, 'cancelled')}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                fontWeight: 'normal'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <Modal onClose={() => {
          setShowOrderDetails(false);
          setSelectedOrder(null);
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            Order #{selectedOrder.id.slice(0, 8)}
          </h3>

          <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>
              <strong>Customer:</strong> {selectedOrder.customerName}
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>
              <strong>Email:</strong> {selectedOrder.customerEmail}
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>
              <strong>Phone:</strong> {selectedOrder.customerPhone}
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
              <strong>Total:</strong> R{selectedOrder.totalAmount.toFixed(2)}
            </p>
          </div>

          {selectedOrder.orderType === 'ebosch' && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>Items</h4>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>
                    {item.productName} x {item.quantity} - R{(item.price * item.quantity).toFixed(2)}
                  </div>
                ))}
              </div>

              {selectedOrder.deliveryInfo && (
                <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>Delivery</h4>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px 0' }}>
                    <strong>Type:</strong> {selectedOrder.deliveryInfo.type}
                  </p>
                  {selectedOrder.deliveryInfo.address && (
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px 0' }}>
                      <strong>Address:</strong> {selectedOrder.deliveryInfo.address}
                    </p>
                  )}
                  {selectedOrder.deliveryInfo.fee && (
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '0' }}>
                      <strong>Fee:</strong> R{selectedOrder.deliveryInfo.fee.toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as Order['status'])}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </>
          )}

          {selectedOrder.orderType !== 'ebosch' && (
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '0' }}>
                <strong>Business Order:</strong> Business handles delivery. Admin can only update payment status.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                setShowOrderDetails(false);
                setSelectedOrder(null);
              }}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'normal'
              }}
            >
              Close
            </button>
            {selectedOrder.orderType === 'ebosch' && (
              <button
                onClick={handleUpdateOrderStatus}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  backgroundColor: '#2d5016',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'normal'
                }}
              >
                Update
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}