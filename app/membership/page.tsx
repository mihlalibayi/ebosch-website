'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase-config';
import { collection, addDoc } from 'firebase/firestore';
import translations from '@/app/translations.json';

type Language = 'en' | 'af' | 'xh';

interface MembershipOption {
  id: string;
  type: 'individual' | 'business' | 'social_impact';
  titleKey: string;
  price?: number;
  benefits: string[];
  icon: string;
}

export default function MembershipPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<MembershipOption | null>(null);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    websiteUrl: '',
    businessType: '',
    businessPrize: false,
    investorType: 'individual' as 'individual' | 'business',
    title: 'Mr' as 'Mr' | 'Ms' | 'Other',
    monthlyFee: 100
  });

  const t = translations[language];

  const membershipOptions: MembershipOption[] = [
    {
      id: 'individual',
      type: 'individual',
      titleKey: 'individualMonthly',
      price: 100,
      icon: '👤',
      benefits: [
        'communityVisibility',
        'communitySupport',
        'prizeParticipation'
      ]
    },
    {
      id: 'business-with-prize',
      type: 'business',
      titleKey: 'businessMonthly',
      price: 100,
      icon: '🏢',
      benefits: [
        'listedWebsite',
        'prizeAdvertised',
        'prizeParticipation'
      ]
    },
    {
      id: 'business-no-prize',
      type: 'business',
      titleKey: 'businessMonthly',
      price: 200,
      icon: '🏢',
      benefits: [
        'listedWebsite',
        'promotedSupporter'
      ]
    },
    {
      id: 'social-impact',
      type: 'social_impact',
      titleKey: 'socialImpactMonthly',
      icon: '💰',
      benefits: [
        'communityVisibility',
        'communitySupport'
      ]
    }
  ];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType) return;

    try {
      const membershipData = {
        membershipType: selectedType.type,
        investorType: form.investorType,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        businessName: form.businessName,
        websiteUrl: form.websiteUrl,
        businessType: form.businessType,
        businessPrize: form.businessPrize,
        title: form.title,
        monthlyFee: form.monthlyFee,
        price: form.monthlyFee,
        createdAt: new Date(),
        status: 'pending_payment'
      };

      await addDoc(collection(db, 'monthly_memberships'), membershipData);

      setShowModal(false);
      setShowNotification(`Successfully registered for monthly membership!`);
      setTimeout(() => setShowNotification(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing membership');
    }
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
          <style>{`@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
          ✓ {showNotification}
        </div>
      )}

      {/* Header */}
      <header className="bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center'
          }}>
            {/* Navigation links - minimalist underline style */}
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
                {language === 'en' && "e'Bosch Store"}
                {language === 'af' && "e'Bosch Winkel"}
                {language === 'xh' && "e'Bosch Inkolo"}
              </Link>

              <Link href="/membership" style={{
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

      {/* Memberships Grid */}
      <section style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr',
            gap: '24px',
            alignItems: 'start'
          }}>
            {/* Individual Monthly */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>

              <h3 style={{
                fontSize: '21px',
                fontWeight: 'normal',
                color: '#000000',
                margin: '0 0 8px 0'
              }}>
                {t.membership.individualMonthly}
              </h3>

              <p style={{
                fontSize: '32px',
                fontWeight: 'normal',
                color: '#2d5016',
                margin: '0 0 24px 0'
              }}>
                R100
                <span style={{ fontSize: '14px', color: '#000000', fontWeight: 'normal' }}>
                  {' '}{t.membership.perMonth}
                </span>
              </p>

              <div style={{ marginBottom: '24px' }}>
                <p style={{
                  fontSize: '13px',
                  fontWeight: 'normal',
                  color: '#000000',
                  textTransform: 'uppercase',
                  margin: '0 0 12px 0',
                  letterSpacing: '0.5px'
                }}>
                  {t.membership.benefits}
                </p>
                {['communityVisibility', 'communitySupport', 'prizeParticipation'].map((benefit, idx) => (
                  <p key={idx} style={{
                    fontSize: '15px',
                    color: '#000000',
                    margin: '8px 0',
                    display: 'flex',
                    gap: '8px',
                    fontWeight: 'normal'
                  }}>
                    <span>✓</span>
                    {t.membership[benefit as keyof typeof t.membership]}
                  </p>
                ))}
              </div>

              <button
                onClick={() => {
                  const option = membershipOptions[0];
                  setSelectedType(option);
                  setShowModal(true);
                }}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  backgroundColor: '#2d5016',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'normal',
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
                {t.membership.subscribeNow}
              </button>
            </div>

            {/* Business Monthly - Two Column Layout */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px'
            }}>
              {/* Business with Prize */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>

                <h3 style={{
                  fontSize: '19px',
                  fontWeight: 'normal',
                  color: '#000000',
                  margin: '0 0 8px 0'
                }}>
                  {t.membership.businessMonthly}
                </h3>

                <p style={{
                  fontSize: '13px',
                  color: '#000000',
                  margin: '0 0 12px 0',
                  fontWeight: 'normal'
                }}>
                  {language === 'en' && 'With monthly prize'}
                  {language === 'af' && 'Met maandelikse prys'}
                  {language === 'xh' && 'Ngokuchopha ngenyanga'}
                </p>

                <p style={{
                  fontSize: '32px',
                  fontWeight: 'normal',
                  color: '#2d5016',
                  margin: '0 0 24px 0'
                }}>
                  R100
                  <span style={{ fontSize: '14px', color: '#000000', fontWeight: 'normal' }}>
                    {' '}{t.membership.perMonth}
                  </span>
                </p>

                <div style={{ marginBottom: '24px' }}>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: 'normal',
                    color: '#000000',
                    textTransform: 'uppercase',
                    margin: '0 0 12px 0',
                    letterSpacing: '0.5px'
                  }}>
                    {t.membership.benefits}
                  </p>
                  {['listedWebsite', 'prizeAdvertised', 'prizeParticipation'].map((benefit, idx) => (
                    <p key={idx} style={{
                      fontSize: '15px',
                      color: '#000000',
                      margin: '8px 0',
                      display: 'flex',
                      gap: '8px',
                      fontWeight: 'normal'
                    }}>
                      <span>✓</span>
                      {t.membership[benefit as keyof typeof t.membership]}
                    </p>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const option = membershipOptions[1];
                    setSelectedType(option);
                    setShowModal(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 24px',
                    backgroundColor: '#2d5016',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'normal',
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
                  {t.membership.subscribeNow}
                </button>
              </div>

              {/* Business without Prize */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>

                <h3 style={{
                  fontSize: '19px',
                  fontWeight: 'normal',
                  color: '#000000',
                  margin: '0 0 8px 0'
                }}>
                  {t.membership.businessMonthly}
                </h3>

                <p style={{
                  fontSize: '13px',
                  color: '#000000',
                  margin: '0 0 12px 0',
                  fontWeight: 'normal'
                }}>
                  {language === 'en' && 'No monthly prize'}
                  {language === 'af' && 'Geen maandelikse prys'}
                  {language === 'xh' && 'Akukho kulandelenisa kwenyanga'}
                </p>

                <p style={{
                  fontSize: '32px',
                  fontWeight: 'normal',
                  color: '#2d5016',
                  margin: '0 0 24px 0'
                }}>
                  R200
                  <span style={{ fontSize: '14px', color: '#000000', fontWeight: 'normal' }}>
                    {' '}{t.membership.perMonth}
                  </span>
                </p>

                <div style={{ marginBottom: '24px' }}>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: 'normal',
                    color: '#000000',
                    textTransform: 'uppercase',
                    margin: '0 0 12px 0',
                    letterSpacing: '0.5px'
                  }}>
                    {t.membership.benefits}
                  </p>
                  {['listedWebsite', 'promotedSupporter'].map((benefit, idx) => (
                    <p key={idx} style={{
                      fontSize: '15px',
                      color: '#000000',
                      margin: '8px 0',
                      display: 'flex',
                      gap: '8px',
                      fontWeight: 'normal'
                    }}>
                      <span>✓</span>
                      {t.membership[benefit as keyof typeof t.membership]}
                    </p>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const option = membershipOptions[2];
                    setSelectedType(option);
                    setShowModal(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 24px',
                    backgroundColor: '#2d5016',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'normal',
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
                  {t.membership.subscribeNow}
                </button>
              </div>
            </div>

            {/* Social Impact Investor Monthly */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>

              <h3 style={{
                fontSize: '21px',
                fontWeight: 'normal',
                color: '#000000',
                margin: '0 0 8px 0'
              }}>
                {t.membership.socialImpactMonthly}
              </h3>

              <p style={{
                fontSize: '18px',
                fontWeight: 'normal',
                color: '#2d5016',
                margin: '0 0 24px 0'
              }}>
                R500 - R6,500{' '}
                <span style={{ fontSize: '14px', color: '#000000', fontWeight: 'normal' }}>
                  {t.membership.perMonth}
                </span>
              </p>

              <div style={{ marginBottom: '24px' }}>
                <p style={{
                  fontSize: '13px',
                  fontWeight: 'normal',
                  color: '#000000',
                  textTransform: 'uppercase',
                  margin: '0 0 12px 0',
                  letterSpacing: '0.5px'
                }}>
                  {t.membership.benefits}
                </p>
                {['communityVisibility', 'communitySupport'].map((benefit, idx) => (
                  <p key={idx} style={{
                    fontSize: '15px',
                    color: '#000000',
                    margin: '8px 0',
                    display: 'flex',
                    gap: '8px',
                    fontWeight: 'normal'
                  }}>
                    <span>✓</span>
                    {t.membership[benefit as keyof typeof t.membership]}
                  </p>
                ))}
              </div>

              <button
                onClick={() => {
                  const option = membershipOptions[3];
                  setSelectedType(option);
                  setShowModal(true);
                }}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  backgroundColor: '#2d5016',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'normal',
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
                {t.membership.subscribeNow}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && selectedType && (
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
              color: '#000000',
              marginBottom: '24px',
              marginTop: '0'
            }}>
              {t.membership[selectedType.titleKey as keyof typeof t.membership]}
            </h2>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Individual Monthly */}
              {selectedType.type === 'individual' && (
                <>
                  <input
                    type="text"
                    placeholder={`${t.membership.firstName} *`}
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                    style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                  />
                  <input
                    type="text"
                    placeholder={`${t.membership.lastName} *`}
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required
                    style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                  />
                  <input
                    type="email"
                    placeholder={`${t.membership.email} *`}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                  />
                  <input
                    type="tel"
                    placeholder={t.membership.phoneNumber}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                  />
                </>
              )}

              {/* Business Monthly */}
              {selectedType.type === 'business' && (
                <>
                  <input
                    type="text"
                    placeholder={`${t.membership.businessName} *`}
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    required
                    style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                  />
                  <input
                    type="email"
                    placeholder={`${t.membership.email} *`}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                  />
                  <input
                    type="tel"
                    placeholder={t.membership.phoneNumber}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                  />
                  <input
                    type="url"
                    placeholder={t.membership.websiteUrl}
                    value={form.websiteUrl}
                    onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                  />
                </>
              )}

              {/* Social Impact Monthly */}
              {selectedType.type === 'social_impact' && (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'normal', color: '#000000' }}>
                      {t.membership.investorType} *
                    </label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
                        <input
                          type="radio"
                          name="investor_type"
                          value="individual"
                          checked={form.investorType === 'individual'}
                          onChange={(e) => setForm({ ...form, investorType: 'individual' })}
                        />
                        {t.membership.individual}
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
                        <input
                          type="radio"
                          name="investor_type"
                          value="business"
                          checked={form.investorType === 'business'}
                          onChange={(e) => setForm({ ...form, investorType: 'business' })}
                        />
                        {t.membership.business}
                      </label>
                    </div>
                  </div>

                  {form.investorType === 'individual' && (
                    <>
                      <select
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value as any })}
                        style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                      >
                        <option>{t.membership.mr}</option>
                        <option>{t.membership.ms}</option>
                        <option>{t.membership.other}</option>
                      </select>
                      <input
                        type="text"
                        placeholder={`${t.membership.firstName} *`}
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        required
                        style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                      />
                      <input
                        type="text"
                        placeholder={`${t.membership.lastName} *`}
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        required
                        style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                      />
                    </>
                  )}

                  {form.investorType === 'business' && (
                    <>
                      <input
                        type="text"
                        placeholder={`${t.membership.businessName} *`}
                        value={form.businessName}
                        onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                        required
                        style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                      />
                      <input
                        type="url"
                        placeholder={t.membership.websiteUrl}
                        value={form.websiteUrl}
                        onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                        style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                      />
                    </>
                  )}

                  <input
                    type="email"
                    placeholder={`${t.membership.email} *`}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                  />
                  <input
                    type="tel"
                    placeholder={t.membership.phoneNumber}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                  />
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'normal', color: '#000000' }}>
                      {t.membership.monthlyFee} *
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="500"
                        max="6500"
                        value={form.monthlyFee}
                        onChange={(e) => {
                          const val = Math.max(500, Math.min(6500, parseInt(e.target.value) || 500));
                          setForm({ ...form, monthlyFee: val });
                        }}
                        required
                        style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' }}
                      />
                      <span style={{ fontSize: '14px', color: '#000000', fontWeight: 'normal' }}>per month</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#000000', margin: '8px 0 0 0', fontWeight: 'normal' }}>
                      Range: R500 - R6,500
                    </p>
                  </div>
                </>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                  {t.membership.subscribeNow}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
