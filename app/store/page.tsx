'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase-config';
import { collection, getDocs } from 'firebase/firestore';
import translations from '@/app/translations.json';

type Language = 'en' | 'af' | 'xh';

interface SubSubCategory {
  id: string;
  name: string;
  imageUrl?: string;
}

interface SubCategory {
  id: string;
  name: string;
  imageUrl?: string;
  subSubcategories?: SubSubCategory[];
}

interface Category {
  id: string;
  name: string;
  type: 'root';
  imageUrl?: string;
  subcategories?: SubCategory[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'ticket' | 'item';
  rootCategory: string;
  subcategory: string;
  subSubcategory?: string;
  imageUrl?: string;
  stock: number;
  outOfStock: boolean;
  deliveryType: 'pickup' | 'delivery' | 'digital' | 'instant';
  deliveryFee?: number;
  date?: string;
  isFreeEvent: boolean;
}

export default function Store() {
  const [language, setLanguage] = useState<Language>('en');
  const t = translations[language];

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);

      // Load categories
      const categoriesSnap = await getDocs(collection(db, 'categories'));
      const categoriesData = categoriesSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Category[];
      setCategories(categoriesData);

      // Load products
      const productsSnap = await getDocs(collection(db, 'products'));
      const productsData = productsSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Product[];
      setProducts(productsData);

      setLoading(false);
    } catch (error) {
      console.error('Error loading store data:', error);
      setLoading(false);
    }
  };

  const getLanguageName = (key: string): string => {
    const categoryNames: { [key: string]: { [lang: string]: string } } = {
      'ebosch': { en: "e'BOSCH", af: "e'BOSCH", xh: "e'BOSCH" },
      'local_businesses': { en: 'Local Businesses', af: 'Plaaslike Besighede', xh: 'Inkolo Zasekhaya' },
      'community_businesses': { en: 'Community Businesses', af: 'Gemeenskapbesighede', xh: 'Inkolo Yoluntu' },
      'services': { en: 'Services', af: 'Dienste', xh: 'Iinkonzo' }
    };
    return categoryNames[key]?.[language] || key;
  };

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  const displayProducts = selectedSubcategory
    ? products.filter(p => p.subcategory === selectedSubcategory && !p.outOfStock)
    : [];

  const handleAddToCart = (product: Product) => {
    try {
      const sessionId = localStorage.getItem('sessionId') || generateSessionId();
      localStorage.setItem('sessionId', sessionId);

      const cartData = localStorage.getItem(`cart_${sessionId}`) || '[]';
      const cart = JSON.parse(cartData);

      const existingItem = cart.find((item: any) => item.productId === product.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: 1,
          type: 'product',
          rootCategory: product.rootCategory,
          businessId: null,
          imageUrl: product.imageUrl
        });
      }

      localStorage.setItem(`cart_${sessionId}`, JSON.stringify(cart));

      // Show notification
      setShowNotification(product.name);
      setTimeout(() => setShowNotification(null), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Notification */}
      {showNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#10b981',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease'
        }}>
          <style>{`
            @keyframes slideIn {
              from { transform: translateX(400px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
          ✓ {showNotification} added to cart!
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Navigation */}
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
              <Link href="/store" className="text-green-600 font-medium">
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

              <Link href="/cart" style={{
                padding: '8px 16px',
                backgroundColor: '#2d5016',
                color: 'white',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1a3009';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2d5016';
              }}>
                🛒 {language === 'en' ? 'Cart' : language === 'af' ? 'Mandjie' : 'Inkokeli'}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Subtitle with spacing */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ color: '#111827', fontSize: '16px', margin: '0' }}>
            {language === 'en' && 'Discover products, services, and local businesses'}
            {language === 'af' && 'Ontdek produkte, dienste en plaaslike besighede'}
            {language === 'xh' && 'Kunqoba imveliso, iinkonzo, kunye nenkolo zasekhaya'}
          </p>
        </div>

        {/* Category/Subcategory Navigation */}
        <div style={{ marginBottom: '48px' }}>
          {/* Root Categories Grid - Only show if no category selected */}
          {!selectedCategory ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '24px',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSelectedSubcategory(null);
                  }}
                  style={{
                    padding: '0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    const img = e.currentTarget.querySelector('div');
                    if (img) {
                      img.style.transform = 'scale(1.05)';
                      img.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    const img = e.currentTarget.querySelector('div');
                    if (img) {
                      img.style.transform = 'scale(1)';
                      img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                    }
                  }}
                >
                  <div style={{
                    width: '100%',
                    aspectRatio: '1',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={getLanguageName(category.id)}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{ color: '#9ca3af', fontSize: '64px' }}>📁</div>
                    )}
                  </div>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#111827',
                    margin: '0',
                    lineHeight: '1.4'
                  }}>
                    {getLanguageName(category.id)}
                  </p>
                </button>
              ))}
            </div>
          ) : !selectedSubcategory ? (
            /* Subcategories Grid */
            <div>
              {/* Back Button */}
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                }}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '24px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
              >
                ← {language === 'en' ? 'Back to Categories' : language === 'af' ? 'Terug na Kategorieë' : 'Buya kumiDwebo'}
              </button>

              {/* Category Title */}
              <h2 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#111827',
                textAlign: 'center',
                marginBottom: '32px'
              }}>
                {getLanguageName(selectedCategory)}
              </h2>

              {/* Subcategories */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '24px',
                maxWidth: '1000px',
                margin: '0 auto'
              }}>
                {selectedCategoryData?.subcategories?.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubcategory(sub.id)}
                    style={{
                      padding: '0',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => {
                      const img = e.currentTarget.querySelector('div');
                      if (img) {
                        img.style.transform = 'scale(1.05)';
                        img.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      const img = e.currentTarget.querySelector('div');
                      if (img) {
                        img.style.transform = 'scale(1)';
                        img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                      }
                    }}
                  >
                    <div style={{
                      width: '100%',
                      aspectRatio: '1',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                      {sub.imageUrl ? (
                        <img
                          src={sub.imageUrl}
                          alt={sub.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div style={{ color: '#9ca3af', fontSize: '48px' }}>📁</div>
                      )}
                    </div>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: '0'
                    }}>
                      {sub.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Back Button when viewing products in subcategory */
            <div style={{ marginBottom: '32px' }}>
              <button
                onClick={() => setSelectedSubcategory(null)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
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
                ← {language === 'en' ? 'Back to Subcategories' : language === 'af' ? 'Terug na Subkategorieë' : 'Buya kuSubmiDwebo'}
              </button>
            </div>
          )}
        </div>

        {/* Products Grid */}
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
            <p style={{ color: '#6b7280' }}>
              {language === 'en' ? 'Loading store...' :
               language === 'af' ? 'Winkel word gelaai...' :
               'Inkolo iyajwayeleka...'}
            </p>
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : selectedSubcategory && displayProducts.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '24px'
          }}>
            {displayProducts.map(product => (
              <div
                key={product.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Product Image */}
                <div style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#f3f4f6',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{ color: '#9ca3af', fontSize: '48px' }}>📦</div>
                  )}
                </div>

                {/* Product Info */}
                <div style={{ padding: '16px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    backgroundColor: product.type === 'ticket' ? '#dbeafe' : '#fef3c7',
                    color: product.type === 'ticket' ? '#0369a1' : '#92400e',
                    fontSize: '12px',
                    fontWeight: '600',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}>
                    {product.type === 'ticket' ? 
                      (language === 'en' ? 'Ticket' : language === 'af' ? 'Kaartjie' : 'Itikiti') :
                      (language === 'en' ? 'Item' : language === 'af' ? 'Item' : 'Isicatshulwa')}
                  </span>

                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {product.name}
                  </h3>

                  <p style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    marginBottom: '12px',
                    lineHeight: '1.4',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {product.description}
                  </p>

                  {product.date && (
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
                      📅 {product.date}
                    </p>
                  )}

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#2d5016'
                    }}>
                      {product.isFreeEvent ? 
                        (language === 'en' ? 'FREE' : language === 'af' ? 'LIBRE' : 'KWALUHLAZA') :
                        `R${product.price.toFixed(2)}`}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#2d5016',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1a3009';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#2d5016';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      {language === 'en' ? 'Add' : language === 'af' ? 'Voeg by' : 'Ungeza'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}
