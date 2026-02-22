'use client';

import Link from 'next/link';

export default function CancelPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '48px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        maxWidth: '480px',
        width: '90%'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>😕</div>
        <h1 style={{ fontSize: '28px', color: '#ef4444', marginBottom: '16px', fontWeight: 'normal' }}>
          Payment Cancelled
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px', fontWeight: 'normal' }}>
          No worries! Your payment was cancelled and you have not been charged. You can try again anytime.
        </p>
        <Link href="/membership" style={{
          padding: '12px 32px',
          backgroundColor: '#2d5016',
          color: 'white',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '14px'
        }}>
          Try Again
        </Link>
      </div>
    </div>
  );
}