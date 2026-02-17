'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  status: 'pending' | 'awaiting_payment' | 'paid' | 'processing' | 'shipped' | 'delivered';
  paymentMethod: 'payfast' | 'bank_transfer';
  createdAt: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  deliveryType: string;
  deliveryAddress?: string;
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [filter, setFilter] = useState<'all' | Order['status']>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Try to load from 'orders' collection
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const ordersData = ordersSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Order[];
      setOrders(ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    } catch (error) {
      console.error('Error loading orders:', error);
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order status');
    }
  };

  const sendOrderEmail = async () => {
    if (!selectedOrder || !emailSubject || !emailBody) {
      alert('Please fill in subject and body');
      return;
    }
    
    try {
      // Call your email API endpoint (implement this on your backend)
      const response = await fetch('/api/send-order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedOrder.customerEmail,
          subject: emailSubject,
          body: emailBody,
          orderId: selectedOrder.id
        })
      });

      if (response.ok) {
        alert('Email sent successfully to ' + selectedOrder.customerEmail);
        setShowEmailModal(false);
        setEmailSubject('');
        setEmailBody('');
        setSelectedOrder(null);
      } else {
        alert('Error sending email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email: ' + error);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: '#fbbf24',
      awaiting_payment: '#f87171',
      paid: '#10b981',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#06b6d4'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status: Order['status']) => {
    const labels = {
      pending: 'Pending',
      awaiting_payment: 'Awaiting Payment',
      paid: 'Paid',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered'
    };
    return labels[status] || status;
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
          Orders Management
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
          Manage customer orders and send status updates
        </p>
      </div>

      {/* Filter Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 16px',
            backgroundColor: filter === 'all' ? '#2d5016' : '#f3f4f6',
            color: filter === 'all' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (filter !== 'all') {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
            }
          }}
          onMouseLeave={(e) => {
            if (filter !== 'all') {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }
          }}
        >
          All Orders ({orders.length})
        </button>

        {['pending', 'awaiting_payment', 'paid', 'processing', 'shipped', 'delivered'].map(status => {
          const count = orders.filter(o => o.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilter(status as Order['status'])}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === status ? getStatusColor(status as Order['status']) : '#f3f4f6',
                color: filter === status ? 'white' : '#374151',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (filter !== status) {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== status) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
            >
              {getStatusLabel(status as Order['status'])} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders List */}
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
          <p>Loading orders...</p>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <p style={{ fontSize: '16px' }}>No orders found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredOrders.map(order => (
            <div key={order.id} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Order ID</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0' }}>
                    {order.id.substring(0, 8)}...
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Customer</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0' }}>
                    {order.customerName}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>
                    {order.customerEmail}
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Total</p>
                  <p style={{ fontSize: '16px', fontWeight: '700', color: '#2d5016', margin: '0' }}>
                    R{order.total.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Status</p>
                  <select
                    value={order.status}
                    onChange={(e) => {
                      updateOrderStatus(order.id, e.target.value as Order['status']);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: getStatusColor(order.status),
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      minWidth: '140px'
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="awaiting_payment">Awaiting Payment</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowEmailModal(true);
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
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
                  📧 Email
                </button>
              </div>

              {/* Order Details */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0', fontWeight: '600' }}>Items:</p>
                {order.items.map((item, idx) => (
                  <p key={idx} style={{ fontSize: '12px', color: '#374151', margin: '4px 0' }}>
                    • {item.name} x{item.quantity} @ R{item.price.toFixed(2)}
                  </p>
                ))}
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0 0' }}>
                  Delivery: {order.deliveryType} {order.deliveryAddress && `to ${order.deliveryAddress}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && selectedOrder && (
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
            maxWidth: '600px',
            width: '90%',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
              Send Email to {selectedOrder.customerName}
            </h3>

            <input
              type="text"
              placeholder="Email Subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />

            <textarea
              placeholder="Email Body"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                marginBottom: '24px',
                fontSize: '14px',
                minHeight: '200px',
                fontFamily: 'Arial, sans-serif',
                boxSizing: 'border-box'
              }}
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setSelectedOrder(null);
                  setEmailSubject('');
                  setEmailBody('');
                }}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
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
                onClick={sendOrderEmail}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#2d5016',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a3009';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2d5016';
                }}
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
