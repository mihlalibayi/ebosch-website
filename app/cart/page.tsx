'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase-config';
import { collection, getDocs } from 'firebase/firestore';
import { Trash2, Plus, Minus } from 'lucide-react';
import translations from '@/app/translations.json';

type Language = 'en' | 'af' | 'xh';

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  type: 'product';
  rootCategory: string;
  businessId?: string;
  imageUrl?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

export default function Cart() {
  const [language, setLanguage] = useState<Language>('en');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Map<string, Product>>(new Map());

  useEffect(() => {
    loadCart();
    loadProducts();
  }, []);

  const loadCart = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId') || generateSessionId();
      localStorage.setItem('sessionId', sessionId);
      
      const cartData = localStorage.getItem(`cart_${sessionId}`);
      if (cartData) {
        setCartItems(JSON.parse(cartData));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading cart:', error);
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const snap = await getDocs(collection(db, 'products'));
      const productMap = new Map();
      snap.docs.forEach(doc => {
        const data = doc.data();
        productMap.set(doc.id, {
          id: doc.id,
          name: data.name,
          price: data.price,
          imageUrl: data.imageUrl
        });
      });
      setProducts(productMap);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const updated = cartItems.map(item =>
      item.productId === productId
        ? { ...item, quantity: Math.max(1, newQuantity) }
        : item
    );
    setCartItems(updated);
    saveCart(updated);
  };

  const removeItem = (productId: string) => {
    const updated = cartItems.filter(item => item.productId !== productId);
    setCartItems(updated);
    saveCart(updated);
  };

  const saveCart = (items: CartItem[]) => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      localStorage.setItem(`cart_${sessionId}`, JSON.stringify(items));
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-end">
            <nav className="flex gap-6 items-center">
              <Link href="/" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                {language === 'en' && 'Home'}
                {language === 'af' && 'Tuis'}
                {language === 'xh' && 'Ikhaya'}
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                {language === 'en' && 'About'}
                {language === 'af' && 'Oor Ons'}
                {language === 'xh' && 'Malunga Nathi'}
              </Link>
              <Link href="/events" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                {language === 'en' && 'Events'}
                {language === 'af' && 'Geleenthede'}
                {language === 'xh' && 'Iziganeko'}
              </Link>
              <Link href="/store" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                {language === 'en' && "e'Bosch Store"}
                {language === 'af' && "e'Bosch Winkel"}
                {language === 'xh' && "e'Bosch Inkolo"}
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                {language === 'en' && 'Contact'}
                {language === 'af' && 'Kontak'}
                {language === 'xh' && 'Xhomekela'}
              </Link>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="en">English</option>
                <option value="af">Afrikaans</option>
                <option value="xh">Xhosa</option>
              </select>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#111827',
          marginBottom: '32px'
        }}>
          {language === 'en' && 'Shopping Cart'}
          {language === 'af' && 'Inkopiemandjie'}
          {language === 'xh' && 'Inkokeli Yokunxiba'}
        </h1>

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
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : cartItems.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6b7280'
          }}>
            <p style={{ fontSize: '18px', marginBottom: '24px' }}>
              {language === 'en' && 'Your cart is empty'}
              {language === 'af' && 'Jou mandjie is leeg'}
              {language === 'xh' && 'Iinkokeli yakho ayinanto'}
            </p>
            <Link href="/store" style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#2d5016',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1a3009';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2d5016';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              {language === 'en' && 'Continue Shopping'}
              {language === 'af' && 'Gaan Inkopies Doen'}
              {language === 'xh' && 'Qhubeka Ukuthenga'}
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
            {/* Cart Items */}
            <div>
              {cartItems.map(item => (
                <div key={item.productId} style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '16px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  {/* Product Image */}
                  <div style={{
                    width: '120px',
                    height: '120px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }} />
                    ) : (
                      <div style={{ fontSize: '48px', color: '#9ca3af' }}>📦</div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '8px'
                    }}>
                      {item.productName}
                    </h3>
                    <p style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#2d5016',
                      marginBottom: '16px'
                    }}>
                      R{item.price.toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: 'fit-content'
                    }}>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: '#f3f4f6',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                      >
                        <Minus size={16} />
                      </button>
                      <span style={{
                        minWidth: '30px',
                        textAlign: 'center',
                        fontWeight: '600'
                      }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: '#f3f4f6',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.productId)}
                    style={{
                      padding: '8px',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fee2e2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fef2f2';
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              height: 'fit-content'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '24px'
              }}>
                {language === 'en' && 'Order Summary'}
                {language === 'af' && 'Bestellingoverzicht'}
                {language === 'xh' && 'Isishwankathelo Soku-Order'}
              </h3>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '16px',
                paddingBottom: '16px',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span style={{ color: '#6b7280' }}>
                  {language === 'en' && 'Subtotal'}
                  {language === 'af' && 'Subtotaal'}
                  {language === 'xh' && 'Isishwankathelo'}
                </span>
                <span style={{ fontWeight: '600', color: '#111827' }}>
                  R{subtotal.toFixed(2)}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '24px',
                fontSize: '16px',
                fontWeight: '700'
              }}>
                <span style={{ color: '#111827' }}>
                  {language === 'en' && 'Total'}
                  {language === 'af' && 'Totaal'}
                  {language === 'xh' && 'Inani Elipheleleyo'}
                </span>
                <span style={{ color: '#2d5016' }}>
                  R{subtotal.toFixed(2)}
                </span>
              </div>

              <Link href="/checkout" style={{
                display: 'block',
                width: '100%',
                padding: '12px',
                backgroundColor: '#2d5016',
                color: 'white',
                textAlign: 'center',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.2s',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1a3009';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2d5016';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                {language === 'en' && 'Proceed to Checkout'}
                {language === 'af' && 'Gaan Uit Skakel'}
                {language === 'xh' && 'Yiya Ku-Checkout'}
              </Link>

              <Link href="/store" style={{
                display: 'block',
                width: '100%',
                padding: '12px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                textAlign: 'center',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}>
                {language === 'en' && 'Continue Shopping'}
                {language === 'af' && 'Gaan Inkopies Doen'}
                {language === 'xh' && 'Qhubeka Ukuthenga'}
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
