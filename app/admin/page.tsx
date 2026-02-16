'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase-config';
import Link from 'next/link';
import { LogIn, ArrowLeft, X } from 'lucide-react';

export default function AdminLogin() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Check if user email is members.ebosch@gmail.com
        if (currentUser.email === 'members.ebosch@gmail.com') {
          setUser(currentUser);
          router.push('/admin/dashboard');
        } else {
          setError('Access denied. Only members.ebosch@gmail.com can access this panel.');
          signOut(auth);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError('Failed to sign in. Please try again.');
      console.error(err);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      setForgotMessage('Please enter your email address.');
      return;
    }

    setForgotLoading(true);
    setForgotMessage('');

    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      setForgotMessage('Password reset email sent! Check your inbox.');
      setForgotEmail('');
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotMessage('');
      }, 3000);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setForgotMessage('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setForgotMessage('Please enter a valid email address.');
      } else {
        setForgotMessage('Error sending reset email. Please try again.');
      }
      console.error(err);
    } finally {
      setForgotLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fafb' }}>
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafb' }}>
      {/* Header with Back Link */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="max-w-7xl mx-auto px-4 py-5">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              color: '#2d5016',
              backgroundColor: '#f0fdf4',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dcfce7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f0fdf4';
            }}
          >
            <ArrowLeft size={18} />
            Back to website
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div style={{ maxWidth: '500px', width: '100%' }}>
          {/* Logo Circle */}
          <div className="flex justify-center mb-6">
            <div 
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 50px rgba(45, 80, 22, 0.15)',
                padding: '8px',
                overflow: 'hidden',
              }}
            >
              <img 
                src="/logo.jpg" 
                alt="e'Bosch Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                }}
              />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              e'Bosch Admin Portal
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          {/* Sign In Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
            marginBottom: '16px'
          }}>
            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#2d5016',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a3009')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2d5016')}
            >
              <LogIn size={18} />
              Sign in with Google
            </button>

            {/* Admin Access Box */}
            <div style={{
              backgroundColor: '#f3fce8',
              border: '1px solid #d1fae5',
              borderRadius: '8px',
              padding: '12px 16px',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              <p style={{ fontSize: '13px', color: '#065f46', fontWeight: 'normal', marginBottom: '4px' }}>
                Admin Access Only
              </p>
              <p style={{ fontSize: '12px', color: '#047857' }}>
                Use: <span style={{ fontWeight: 'normal' }}>members.ebosch@gmail.com</span>
              </p>
            </div>

            {/* Divider */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <div style={{ borderTop: '2px solid #2d5016' }}></div>
              <span style={{
                position: 'absolute',
                top: '-14px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'white',
                padding: '0 8px',
                fontSize: '13px',
                color: '#2d5016',
                fontWeight: '500'
              }}>
                or
              </span>
            </div>

            {/* Email Input */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#2d5016')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#2d5016')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
              />
            </div>

            {/* Sign In Button */}
            <button
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#2d5016',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '12px'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a3009')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2d5016')}
            >
              Sign In
            </button>

            {/* Forgot Password Link */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setShowForgotPassword(true)}
                style={{
                  fontSize: '12px',
                  color: '#1e40af',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '4px 0'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#1e3a8a')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#1e40af')}
              >
                Forgot password?
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #e5e7eb',
        backgroundColor: 'white',
        textAlign: 'center',
        padding: '20px',
        fontSize: '13px',
        color: '#9ca3af'
      }}>
        <p>e'Bosch Event Management System • Admin Portal</p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={{
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
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setForgotMessage('');
                setForgotEmail('');
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
            >
              <X size={24} />
            </button>

            {/* Title */}
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '8px'
            }}>
              Reset Password
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '20px'
            }}>
              Enter your email and we'll send you a link to reset your password.
            </p>

            {/* Email Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Enter your email"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#2d5016')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
              />
            </div>

            {/* Message */}
            {forgotMessage && (
              <div style={{
                backgroundColor: forgotMessage.includes('sent') ? '#dcfce7' : '#fee2e2',
                border: `1px solid ${forgotMessage.includes('sent') ? '#86efac' : '#fecaca'}`,
                color: forgotMessage.includes('sent') ? '#166534' : '#991b1b',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '13px'
              }}>
                {forgotMessage}
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotMessage('');
                  setForgotEmail('');
                }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                disabled={forgotLoading}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: forgotLoading ? '#9ca3af' : '#2d5016',
                  color: 'white',
                  border: 'none',
                  cursor: forgotLoading ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!forgotLoading) e.currentTarget.style.backgroundColor = '#1a3009';
                }}
                onMouseLeave={(e) => {
                  if (!forgotLoading) e.currentTarget.style.backgroundColor = '#2d5016';
                }}
              >
                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
