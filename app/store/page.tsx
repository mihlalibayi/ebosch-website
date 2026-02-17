'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, addDoc } from 'firebase/firestore';
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
  isMembership?: boolean;
  membershipType?: 'individual' | 'business' | 'social_impact';
}

export default function Store() {
  const [language, setLanguage] = useState<Language>('en');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Membership form state
  const [membershipForm, setMembershipForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    businessName: '',
    websiteUrl: '',
    businessType: '',
    businessRegistration: '',
    investorType: 'individual' as 'individual' | 'business',
    title: 'Mr' as 'Mr' | 'Ms' | 'Other',
    annualFee: 5000
  });

  const t = translations[language];

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Load categories from Firebase
      const categoriesSnap = await getDocs(collection(db, 'categories'));
      const categoriesData = categoriesSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Category[];
      setCategories(categoriesData);

      // Load products from Firebase
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

  const handleMembershipClick = (product: Product) => {
    setSelectedProduct(product);
    setShowMembershipModal(true);
    setMembershipForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      businessName: '',
      websiteUrl: '',
      businessType: '',
      businessRegistration: '',
      investorType: 'individual',
      title: 'Mr',
      annualFee: 5000
    });
  };

  const handleMembershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) return;

    try {
      const membershipData = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        membershipType: selectedProduct.membershipType,
        ...membershipForm,
        price: selectedProduct.membershipType === 'social_impact' ? membershipForm.annualFee : selectedProduct.price,
        createdAt: new Date(),
        status: 'pending_payment'
      };

      if (selectedProduct.membershipType === 'social_impact') {
        await addDoc(collection(db, 'social_impact_members'), membershipData);
      } else if (selectedProduct.membershipType === 'individual') {
        await addDoc(collection(db, 'annual_memberships'), membershipData);
      } else if (selectedProduct.membershipType === 'business') {
        await addDoc(collection(db, 'annual_memberships'), membershipData);
      }

      setShowMembershipModal(false);
      setShowNotification(`${selectedProduct.name} membership registered!`);
      setTimeout(() => setShowNotification(null), 3000);
    } catch (error) {
      console.error('Error submitting membership:', error);
      alert('Error processing membership');
    }
  };

  const displayProducts = selectedSubcategory
    ? products.filter(p => p.subcategory === selectedSubcategory && !p.outOfStock)
    : [];

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

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
          <style>{`@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
          ✓ {showNotification}
        </div>
      )}

      {/* Header */}
      <header className="bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {/* Cart on the left */}
            <Link href="/cart" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 20px',
              backgroundColor: '#2d5016',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.opacity = '1';
            }}>
              🛒 {language === 'en' ? 'Cart' : language === 'af' ? 'Mandjie' : 'Inkokeli'}
            </Link>

            {/* Navigation on the right */}
            <nav style={{
              display: 'flex',
              gap: '40px',
              alignItems: 'center'
            }}>
              <Link href="/" style={{
                textDecoration: 'none',
                color: '#888888',
                fontSize: '14px',
                fontWeight: '500',
                paddingBottom: '4px',
                borderBottom: '2px solid transparent',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = '#2d5016';
                (e.target as HTMLElement).style.borderBottom = '2px solid #2d5016';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = '#888888';
                (e.target as HTMLElement).style.borderBottom = '2px solid transparent';
              }}>
                {language === 'en' && 'Home'}
                {language === 'af' && 'Tuis'}
                {language === 'xh' && 'Ikhaya'}
              </Link>

              <Link href="/about" style={{
                textDecoration: 'none',
                color: '#888888',
                fontSize: '14px',
                fontWeight: '500',
                paddingBottom: '4px',
                borderBottom: '2px solid transparent',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = '#2d5016';
                (e.target as HTMLElement).style.borderBottom = '2px solid #2d5016';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = '#888888';
                (e.target as HTMLElement).style.borderBottom = '2px solid transparent';
              }}>
                {language === 'en' && 'About'}
                {language === 'af' && 'Oor'}
                {language === 'xh' && 'Malunga'}
              </Link>

              <Link href="/events" style={{
                textDecoration: 'none',
                color: '#888888',
                fontSize: '14px',
                fontWeight: '500',
                paddingBottom: '4px',
                borderBottom: '2px solid transparent',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = '#2d5016';
                (e.target as HTMLElement).style.borderBottom = '2px solid #2d5016';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = '#888888';
                (e.target as HTMLElement).style.borderBottom = '2px solid transparent';
              }}>
                {language === 'en' && 'Events'}
                {language === 'af' && 'Geleenthede'}
                {language === 'xh' && 'Iziganeko'}
              </Link>

              <Link href="/store" style={{
                textDecoration: 'none',
                color: '#2d5016',
                fontSize: '14px',
                fontWeight: '600',
                paddingBottom: '4px',
                borderBottom: '2px solid #2d5016',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.opacity = '0.7';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.opacity = '1';
              }}>
                {language === 'en' && "e'Bosch Store"}
                {language === 'af' && "e'Bosch Winkel"}
                {language === 'xh' && "e'Bosch Inkolo"}
              </Link>

              <Link href="/membership" style={{
                textDecoration: 'none',
                color: '#888888',
                fontSize: '14px',
                fontWeight: '500',
                paddingBottom: '4px',
                borderBottom: '2px solid transparent',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = '#2d5016';
                (e.target as HTMLElement).style.borderBottom = '2px solid #2d5016';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = '#888888';
                (e.target as HTMLElement).style.borderBottom = '2px solid transparent';
              }}>
                {language === 'en' && 'Membership'}
                {language === 'af' && 'Lidmaatskap'}
                {language === 'xh' && 'Ubulungu'}
              </Link>

              <Link href="/contact" style={{
                textDecoration: 'none',
                color: '#888888',
                fontSize: '14px',
                fontWeight: '500',
                paddingBottom: '4px',
                borderBottom: '2px solid transparent',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = '#2d5016';
                (e.target as HTMLElement).style.borderBottom = '2px solid #2d5016';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = '#888888';
                (e.target as HTMLElement).style.borderBottom = '2px solid transparent';
              }}>
                {language === 'en' && 'Contact'}
                {language === 'af' && 'Kontak'}
                {language === 'xh' && 'Xhomekela'}
              </Link>

              {/* Language selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                style={{
                  padding: '8px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  backgroundColor: 'white',
                  fontWeight: '500',
                  color: '#111827',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.borderColor = '#2d5016';
                  (e.target as HTMLElement).style.boxShadow = '0 0 0 2px rgba(45, 80, 22, 0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.borderColor = '#d1d5db';
                  (e.target as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <option value="en">English</option>
                <option value="af">Afrikaans</option>
                <option value="xh">Xhosa</option>
              </select>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        </div>

        {/* Category Navigation */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p>Loading store...</p>
          </div>
        ) : !selectedCategory ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: '100%',
                  aspectRatio: '1',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {category.imageUrl ? (
                    <img src={category.imageUrl} alt={category.name} style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }} />
                  ) : (
                    <div style={{ fontSize: '64px' }}>📁</div>
                  )}
                </div>
                <p style={{
                  fontSize: '17px',
                  fontWeight: 'bold',
                  color: '#111827',
                  margin: '0'
                }}>
                  {category.name}
                </p>
              </button>
            ))}
          </div>
        ) : !selectedSubcategory ? (
          <div>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                padding: '10px 16px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'normal',
                cursor: 'pointer',
                marginBottom: '24px'
              }}
            >
              ← Back
            </button>
            <h2 style={{
              fontSize: '22px',
              fontWeight: 'normal',
              color: '#111827',
              textAlign: 'center',
              marginBottom: '32px'
            }}>
              {selectedCategoryData?.name}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              {selectedCategoryData?.subcategories?.map((sub: SubCategory) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategory(sub.id)}
                  style={{
                    padding: '0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <div style={{
                    width: '100%',
                    aspectRatio: '1',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '12px',
                    marginBottom: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {sub.imageUrl ? (
                      <img src={sub.imageUrl} alt={sub.name} style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }} />
                    ) : (
                      <div style={{ fontSize: '48px' }}>📁</div>
                    )}
                  </div>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 'normal',
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
          <>
            <button
              onClick={() => setSelectedSubcategory(null)}
              style={{
                padding: '10px 16px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'normal',
                cursor: 'pointer',
                marginBottom: '32px'
              }}
            >
              ← Back
            </button>
            {displayProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                No products available
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '24px'
              }}>
                {displayProducts.map(product => (
                  <div key={product.id} style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s'
                  }}>
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
                        <img src={product.imageUrl} alt={product.name} style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }} />
                      ) : (
                        <div style={{ fontSize: '48px' }}>📦</div>
                      )}
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: 'normal',
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
                        lineHeight: '1.4'
                      }}>
                        {product.description}
                      </p>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          fontSize: '18px',
                          fontWeight: 'normal',
                          color: '#2d5016'
                        }}>
                          {product.isFreeEvent ? 'FREE' : `R${product.price.toFixed(2)}`}
                        </span>
                        <button
                          onClick={() => {
                            if (product.isMembership) {
                              handleMembershipClick(product);
                            }
                          }}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#2d5016',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 'normal',
                            cursor: 'pointer'
                          }}
                        >
                          {language === 'en' ? 'Add' : language === 'af' ? 'Voeg by' : 'Ungeza'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Membership Modal */}
      {showMembershipModal && selectedProduct && (
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
          zIndex: 1000,
          overflowY: 'auto',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'normal',
              color: '#111827',
              marginBottom: '24px',
              marginTop: '0'
            }}>
              {selectedProduct.name}
            </h2>

            <form onSubmit={handleMembershipSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Individual Annual */}
              {selectedProduct.membershipType === 'individual' && (
                <>
                  <input
                    type="text"
                    placeholder="First Name *"
                    value={membershipForm.firstName}
                    onChange={(e) => setMembershipForm({ ...membershipForm, firstName: e.target.value })}
                    required
                    style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                  />
                  <input
                    type="text"
                    placeholder="Last Name *"
                    value={membershipForm.lastName}
                    onChange={(e) => setMembershipForm({ ...membershipForm, lastName: e.target.value })}
                    required
                    style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={membershipForm.email}
                    onChange={(e) => setMembershipForm({ ...membershipForm, email: e.target.value })}
                    required
                    style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={membershipForm.phone}
                    onChange={(e) => setMembershipForm({ ...membershipForm, phone: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={membershipForm.address}
                    onChange={(e) => setMembershipForm({ ...membershipForm, address: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                  />
                </>
              )}

              {/* Business Annual */}
              {selectedProduct.membershipType === 'business' && (
                <>
                  <input
                    type="text"
                    placeholder="Business Name *"
                    value={membershipForm.businessName}
                    onChange={(e) => setMembershipForm({ ...membershipForm, businessName: e.target.value })}
                    required
                    style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={membershipForm.email}
                    onChange={(e) => setMembershipForm({ ...membershipForm, email: e.target.value })}
                    required
                    style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={membershipForm.phone}
                    onChange={(e) => setMembershipForm({ ...membershipForm, phone: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                  />
                  <input
                    type="url"
                    placeholder="Website URL"
                    value={membershipForm.websiteUrl}
                    onChange={(e) => setMembershipForm({ ...membershipForm, websiteUrl: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                  />
                </>
              )}

              {/* Social Impact Investor */}
              {selectedProduct.membershipType === 'social_impact' && (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'normal', fontSize: '14px', color: '#000000' }}>Investor Type *</label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal' }}>
                        <input
                          type="radio"
                          name="investor_type"
                          value="individual"
                          checked={membershipForm.investorType === 'individual'}
                          onChange={(e) => setMembershipForm({ ...membershipForm, investorType: 'individual' })}
                        />
                        Individual
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal' }}>
                        <input
                          type="radio"
                          name="investor_type"
                          value="business"
                          checked={membershipForm.investorType === 'business'}
                          onChange={(e) => setMembershipForm({ ...membershipForm, investorType: 'business' })}
                        />
                        Business
                      </label>
                    </div>
                  </div>

                  {membershipForm.investorType === 'individual' && (
                    <>
                      <select
                        value={membershipForm.title}
                        onChange={(e) => setMembershipForm({ ...membershipForm, title: e.target.value as any })}
                        style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                      >
                        <option>Mr</option>
                        <option>Ms</option>
                        <option>Other</option>
                      </select>
                      <input
                        type="text"
                        placeholder="First Name *"
                        value={membershipForm.firstName}
                        onChange={(e) => setMembershipForm({ ...membershipForm, firstName: e.target.value })}
                        required
                        style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                      />
                      <input
                        type="text"
                        placeholder="Last Name *"
                        value={membershipForm.lastName}
                        onChange={(e) => setMembershipForm({ ...membershipForm, lastName: e.target.value })}
                        required
                        style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                      />
                    </>
                  )}

                  {membershipForm.investorType === 'business' && (
                    <>
                      <input
                        type="text"
                        placeholder="Business Name *"
                        value={membershipForm.businessName}
                        onChange={(e) => setMembershipForm({ ...membershipForm, businessName: e.target.value })}
                        required
                        style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                      />
                      <input
                        type="url"
                        placeholder="Website URL"
                        value={membershipForm.websiteUrl}
                        onChange={(e) => setMembershipForm({ ...membershipForm, websiteUrl: e.target.value })}
                        style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                      />
                    </>
                  )}

                  <input
                    type="email"
                    placeholder="Email *"
                    value={membershipForm.email}
                    onChange={(e) => setMembershipForm({ ...membershipForm, email: e.target.value })}
                    required
                    style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={membershipForm.phone}
                    onChange={(e) => setMembershipForm({ ...membershipForm, phone: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                  />
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'normal', fontSize: '14px', color: '#000000' }}>Annual Fee (ZAR) *</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="5000"
                        max="65000"
                        value={membershipForm.annualFee}
                        onChange={(e) => {
                          const val = Math.max(5000, Math.min(65000, parseInt(e.target.value) || 5000));
                          setMembershipForm({ ...membershipForm, annualFee: val });
                        }}
                        required
                        style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                      />
                      <span style={{ fontSize: '14px', color: '#000000', fontWeight: 'normal' }}>per year</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#000000', margin: '8px 0 0 0', fontWeight: 'normal' }}>
                      Range: R5,000 - R65,000
                    </p>
                  </div>
                </>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setShowMembershipModal(false)}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'normal',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#2d5016',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'normal',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Proceed to Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
