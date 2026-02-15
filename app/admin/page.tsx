'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-config';
import Link from 'next/link';
import { LogIn, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div style={{ maxWidth: '500px', width: '100%' }}>
          {/* Logo Circle */}
          <div className="flex justify-center mb-12">
            <div 
              style={{
                width: '160px',
                height: '160px',
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

          {/* Title and Subtitle */}
          <div className="text-center mb-10">
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
              Welcome Back
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '6px' }}>
              e'Bosch Admin Portal
            </p>
            <p style={{ fontSize: '14px', color: '#9ca3af' }}>
              Manage your events and content
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
            padding: '32px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
            marginBottom: '20px'
          }}>
            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full transition-all"
              style={{
                padding: '14px 20px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: '#2d5016',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginBottom: '16px'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a3009')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2d5016')}
            >
              <LogIn size={20} />
              Sign in with Google
            </button>

            {/* Divider */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <div style={{ borderTop: '1px solid #e5e7eb' }}></div>
              <span style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'white',
                padding: '0 8px',
                fontSize: '14px',
                color: '#9ca3af'
              }}>
                or
              </span>
            </div>

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
            <div style={{ marginBottom: '20px' }}>
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
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: '#2d5016',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a3009')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2d5016')}
            >
              Sign In
            </button>

            {/* Info Message */}
            <div style={{
              backgroundColor: '#f3fce8',
              border: '1px solid #d1fae5',
              borderRadius: '8px',
              padding: '14px 16px',
              textAlign: 'center',
              marginTop: '20px'
            }}>
              <p style={{ fontSize: '14px', color: '#065f46', fontWeight: '500', marginBottom: '4px' }}>
                Admin Access Only
              </p>
              <p style={{ fontSize: '13px', color: '#047857' }}>
                Use: <span style={{ fontWeight: '600' }}>members.ebosch@gmail.com</span>
              </p>
            </div>
          </div>

          {/* Security Note */}
          <div style={{
            textAlign: 'center',
            fontSize: '12px',
            color: '#9ca3af',
            paddingTop: '12px'
          }}>
            <p>🔒 Secure login with Google OAuth 2.0</p>
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
    </div>
  );
}
