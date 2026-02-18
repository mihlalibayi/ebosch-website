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
  const [scrolled, setScrolled] = useState(false);
  const [selectedType, setSelectedType] = useState<MembershipOption | null>(null);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    monthlyFee: 100,
    heardFrom: '',
    heardFromOther: '',
    referredBy: '',
    referredByOther: '',
  });

  const t = translations[language];

  const membershipOptions: MembershipOption[] = [
    { id: 'individual', type: 'individual', titleKey: 'individualMonthly', price: 100, icon: '👤', benefits: ['communitySupport', 'prizeParticipation'] },
    { id: 'business-with-prize', type: 'business', titleKey: 'businessMonthly', price: 100, icon: '🏢', benefits: ['listedWebsite', 'prizeAdvertised', 'prizeParticipation'] },
    { id: 'business-no-prize', type: 'business', titleKey: 'businessMonthly', price: 200, icon: '🏢', benefits: ['listedWebsite', 'promotedSupporter', 'prizeParticipation'] },
    { id: 'social-impact', type: 'social_impact', titleKey: 'socialImpactMonthly', icon: '💰', benefits: ['communityVisibility', 'communitySupport'] }
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
        heardFrom: form.heardFrom,
        heardFromOther: form.heardFrom === 'Other' ? form.heardFromOther : '',
        referredBy: form.heardFrom === 'Introduction by team member' ? form.referredBy : '',
        referredByOther: form.heardFrom === 'Introduction by team member' && form.referredBy === 'Other' ? form.referredByOther : '',
        createdAt: new Date(),
        status: 'pending_payment'
      };
      await addDoc(collection(db, 'monthly_memberships'), membershipData);
      setShowModal(false);
      setShowNotification('Successfully registered for monthly membership!');
      setTimeout(() => setShowNotification(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing membership');
    }
  };

  const inputStyle = { padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' as const };
  const fullInputStyle = { ...inputStyle, width: '100%', boxSizing: 'border-box' as const };

  const ReferralQuestions = () => (
    <>
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'normal' as const, color: '#000000' }}>
          How did you hear about e&apos;Bosch Membership? *
        </label>
        <select
          value={form.heardFrom}
          onChange={(e) => setForm({ ...form, heardFrom: e.target.value, referredBy: '', referredByOther: '', heardFromOther: '' })}
          required
          style={fullInputStyle}
        >
          <option value="">Select an option</option>
          <option value="Email">Email</option>
          <option value="e'Bosch Event">e&apos;Bosch Event</option>
          <option value="Introduction by team member">Introduction by team member</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {form.heardFrom === 'Other' && (
        <input
          type="text"
          placeholder="Please specify *"
          value={form.heardFromOther}
          onChange={(e) => setForm({ ...form, heardFromOther: e.target.value })}
          required
          style={inputStyle}
        />
      )}

      {form.heardFrom === 'Introduction by team member' && (
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'normal' as const, color: '#000000' }}>
            If you were referred by one of our team members, who was it? *
          </label>
          <select
            value={form.referredBy}
            onChange={(e) => setForm({ ...form, referredBy: e.target.value, referredByOther: '' })}
            required
            style={fullInputStyle}
          >
            <option value="">Select a team member</option>
            <option value="Sias Mostert">Sias Mostert</option>
            <option value="Amanda Horne">Amanda Horne</option>
            <option value="William Horne">William Horne</option>
            <option value="Other">Other</option>
          </select>
          {form.referredBy === 'Other' && (
            <input
              type="text"
              placeholder="Please specify *"
              value={form.referredByOther}
              onChange={(e) => setForm({ ...form, referredByOther: e.target.value })}
              required
              style={{ ...fullInputStyle, marginTop: '8px' }}
            />
          )}
        </div>
      )}
    </>
  );

  const navLinkStyle = { textDecoration: 'none', color: '#4b5563', fontSize: '16px', fontWeight: '500', paddingBottom: '4px', borderBottom: '2px solid transparent', transition: 'all 0.3s ease' };
  const navLinkActive = { textDecoration: 'none', color: '#2d5016', fontSize: '16px', fontWeight: '600', paddingBottom: '4px', borderBottom: '2px solid #2d5016', transition: 'all 0.3s ease' };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {showNotification && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', backgroundColor: '#10b981', color: 'white', padding: '16px 24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, animation: 'slideIn 0.3s ease' }}>
          <style>{`@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
          ✓ {showNotification}
        </div>
      )}

      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: 'white', boxShadow: 'none' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <nav style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
              <Link href="/" style={navLinkStyle} onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#2d5016'; (e.target as HTMLElement).style.borderBottom = '2px solid #2d5016'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#4b5563'; (e.target as HTMLElement).style.borderBottom = '2px solid transparent'; }}>
                {language === 'en' && 'Home'}{language === 'af' && 'Tuis'}{language === 'xh' && 'Ikhaya'}
              </Link>
              <Link href="/about" style={navLinkStyle} onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#2d5016'; (e.target as HTMLElement).style.borderBottom = '2px solid #2d5016'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#4b5563'; (e.target as HTMLElement).style.borderBottom = '2px solid transparent'; }}>
                {language === 'en' && 'About'}{language === 'af' && 'Oor'}{language === 'xh' && 'Malunga'}
              </Link>
              <Link href="/events" style={navLinkStyle} onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#2d5016'; (e.target as HTMLElement).style.borderBottom = '2px solid #2d5016'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#4b5563'; (e.target as HTMLElement).style.borderBottom = '2px solid transparent'; }}>
                {language === 'en' && 'Events'}{language === 'af' && 'Geleenthede'}{language === 'xh' && 'Iziganeko'}
              </Link>
              <Link href="/store" style={navLinkStyle} onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#2d5016'; (e.target as HTMLElement).style.borderBottom = '2px solid #2d5016'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#4b5563'; (e.target as HTMLElement).style.borderBottom = '2px solid transparent'; }}>
                {language === 'en' && "e'Bosch Store"}{language === 'af' && "e'Bosch Winkel"}{language === 'xh' && "e'Bosch Inkolo"}
              </Link>
              <Link href="/membership" style={navLinkActive} onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '0.7'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}>
                {language === 'en' && 'Membership'}{language === 'af' && 'Lidmaatskap'}{language === 'xh' && 'Ubulungu'}
              </Link>
              <Link href="/contact" style={navLinkStyle} onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#2d5016'; (e.target as HTMLElement).style.borderBottom = '2px solid #2d5016'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#4b5563'; (e.target as HTMLElement).style.borderBottom = '2px solid transparent'; }}>
                {language === 'en' && 'Contact'}{language === 'af' && 'Kontak'}{language === 'xh' && 'Xhomekela'}
              </Link>
              <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '15px', backgroundColor: 'white', fontWeight: '500', color: '#111827', cursor: 'pointer' }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.borderColor = '#2d5016'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.borderColor = '#d1d5db'; }}>
                <option value="en">English</option>
                <option value="af">Afrikaans</option>
                <option value="xh">Xhosa</option>
              </select>
            </nav>
          </div>
        </div>
      </header>

      <section style={{ padding: '64px 24px', paddingTop: '100px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '24px', alignItems: 'start' }}>

            {/* Individual */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', transition: 'all 0.3s' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', textAlign: 'center' }}>👤</div>
              <h3 style={{ fontSize: '21px', fontWeight: 'normal', color: '#000000', margin: '0 0 8px 0', textAlign: 'center' }}>{t.membership.individualMonthly}</h3>
              <p style={{ fontSize: '32px', fontWeight: 'normal', color: '#2d5016', margin: '0 0 24px 0' }}>R100<span style={{ fontSize: '14px', color: '#000000', fontWeight: 'normal' }}> {t.membership.perMonth}</span></p>
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '13px', fontWeight: 'normal', color: '#000000', textTransform: 'uppercase', margin: '0 0 12px 0', letterSpacing: '0.5px' }}>{t.membership.benefits}</p>
                {['communitySupport', 'prizeParticipation'].map((benefit, idx) => (
                  <p key={idx} style={{ fontSize: '15px', color: '#000000', margin: '8px 0', display: 'flex', gap: '8px', fontWeight: 'normal' }}><span>✓</span>{t.membership[benefit as keyof typeof t.membership]}</p>
                ))}
              </div>
              <button onClick={() => { setSelectedType(membershipOptions[0]); setShowModal(true); }} style={{ width: '100%', padding: '12px 24px', backgroundColor: '#2d5016', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'normal', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1a3009'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2d5016'; }}>
                {t.membership.subscribeNow}
              </button>
            </div>

            {/* Business Two Column */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {[
                { option: membershipOptions[1], prize: true, benefits: ['listedWebsite', 'prizeAdvertised', 'prizeParticipation'], price: 'R100', prizeLabel: { en: 'With monthly prize', af: 'Met maandelikse prys', xh: 'Ngokuchopha ngenyanga' } },
                { option: membershipOptions[2], prize: false, benefits: ['listedWebsite', 'promotedSupporter', 'prizeParticipation'], price: 'R200', prizeLabel: { en: 'No monthly prize', af: 'Geen maandelikse prys', xh: 'Akukho kulandelenisa kwenyanga' } }
              ].map(({ option, benefits, price, prizeLabel }) => (
                <div key={option.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px', textAlign: 'center' }}>🏢</div>
                  <h3 style={{ fontSize: '19px', fontWeight: 'normal', color: '#000000', margin: '0 0 8px 0', textAlign: 'center' }}>{t.membership.businessMonthly}</h3>
                  <p style={{ fontSize: '13px', color: '#000000', margin: '0 0 12px 0', fontWeight: 'normal', textAlign: 'center' }}>{prizeLabel[language]}</p>
                  <p style={{ fontSize: '32px', fontWeight: 'normal', color: '#2d5016', margin: '0 0 24px 0' }}>{price}<span style={{ fontSize: '14px', color: '#000000', fontWeight: 'normal' }}> {t.membership.perMonth}</span></p>
                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 'normal', color: '#000000', textTransform: 'uppercase', margin: '0 0 12px 0', letterSpacing: '0.5px' }}>{t.membership.benefits}</p>
                    {benefits.map((benefit, idx) => (
                      <p key={idx} style={{ fontSize: '15px', color: '#000000', margin: '8px 0', display: 'flex', gap: '8px', fontWeight: 'normal' }}><span>✓</span>{t.membership[benefit as keyof typeof t.membership]}</p>
                    ))}
                  </div>
                  <button onClick={() => { setSelectedType(option); setShowModal(true); }} style={{ width: '100%', padding: '12px 24px', backgroundColor: '#2d5016', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'normal', cursor: 'pointer' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1a3009'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2d5016'; }}>
                    {t.membership.subscribeNow}
                  </button>
                </div>
              ))}
            </div>

            {/* Social Impact */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', transition: 'all 0.3s' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', textAlign: 'center' }}>💰</div>
              <h3 style={{ fontSize: '21px', fontWeight: 'normal', color: '#000000', margin: '0 0 8px 0', textAlign: 'center' }}>{t.membership.socialImpactMonthly}</h3>
              <p style={{ fontSize: '18px', fontWeight: 'normal', color: '#2d5016', margin: '0 0 24px 0' }}>R500 - R6,500 <span style={{ fontSize: '14px', color: '#000000', fontWeight: 'normal' }}>{t.membership.perMonth}</span></p>
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '13px', fontWeight: 'normal', color: '#000000', textTransform: 'uppercase', margin: '0 0 12px 0', letterSpacing: '0.5px' }}>{t.membership.benefits}</p>
                {['communityVisibility', 'communitySupport'].map((benefit, idx) => (
                  <p key={idx} style={{ fontSize: '15px', color: '#000000', margin: '8px 0', display: 'flex', gap: '8px', fontWeight: 'normal' }}><span>✓</span>{t.membership[benefit as keyof typeof t.membership]}</p>
                ))}
              </div>
              <button onClick={() => { setSelectedType(membershipOptions[3]); setShowModal(true); }} style={{ width: '100%', padding: '12px 24px', backgroundColor: '#2d5016', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'normal', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1a3009'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2d5016'; }}>
                {t.membership.subscribeNow}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && selectedType && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', maxWidth: '600px', width: '100%', boxShadow: '0 20px 25px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'normal', color: '#000000', marginBottom: '24px', marginTop: '0' }}>
              {t.membership[selectedType.titleKey as keyof typeof t.membership]}
            </h2>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Individual */}
              {selectedType.type === 'individual' && (
                <>
                  <input type="text" placeholder={`${t.membership.firstName} *`} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required style={inputStyle} />
                  <input type="text" placeholder={`${t.membership.lastName} *`} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required style={inputStyle} />
                  <input type="email" placeholder={`${t.membership.email} *`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={inputStyle} />
                  <input type="tel" placeholder={t.membership.phoneNumber} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
                  <ReferralQuestions />
                </>
              )}

              {/* Business */}
              {selectedType.type === 'business' && (
                <>
                  <input type="text" placeholder={`${t.membership.businessName} *`} value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} required style={inputStyle} />
                  <input type="email" placeholder={`${t.membership.email} *`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={inputStyle} />
                  <input type="tel" placeholder={t.membership.phoneNumber} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
                  <input type="url" placeholder={t.membership.websiteUrl} value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} style={inputStyle} />
                  <ReferralQuestions />
                </>
              )}

              {/* Social Impact */}
              {selectedType.type === 'social_impact' && (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'normal', color: '#000000' }}>{t.membership.investorType} *</label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
                        <input type="radio" name="investor_type" value="individual" checked={form.investorType === 'individual'} onChange={() => setForm({ ...form, investorType: 'individual' })} />{t.membership.individual}
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
                        <input type="radio" name="investor_type" value="business" checked={form.investorType === 'business'} onChange={() => setForm({ ...form, investorType: 'business' })} />{t.membership.business}
                      </label>
                    </div>
                  </div>
                  {form.investorType === 'individual' && (
                    <>
                      <select value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value as any })} style={inputStyle}>
                        <option>{t.membership.mr}</option><option>{t.membership.ms}</option><option>{t.membership.other}</option>
                      </select>
                      <input type="text" placeholder={`${t.membership.firstName} *`} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required style={inputStyle} />
                      <input type="text" placeholder={`${t.membership.lastName} *`} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required style={inputStyle} />
                    </>
                  )}
                  {form.investorType === 'business' && (
                    <>
                      <input type="text" placeholder={`${t.membership.businessName} *`} value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} required style={inputStyle} />
                      <input type="url" placeholder={t.membership.websiteUrl} value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} style={inputStyle} />
                    </>
                  )}
                  <input type="email" placeholder={`${t.membership.email} *`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={inputStyle} />
                  <input type="tel" placeholder={t.membership.phoneNumber} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'normal', color: '#000000' }}>{t.membership.monthlyFee} *</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="number" min="500" max="6500" value={form.monthlyFee} onChange={(e) => { const val = Math.max(500, Math.min(6500, parseInt(e.target.value) || 500)); setForm({ ...form, monthlyFee: val }); }} required style={{ flex: 1, ...inputStyle }} />
                      <span style={{ fontSize: '14px', color: '#000000', fontWeight: 'normal' }}>per month</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#000000', margin: '8px 0 0 0', fontWeight: 'normal' }}>Range: R500 - R6,500</p>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 24px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', fontWeight: 'normal', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', backgroundColor: '#2d5016', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'normal', cursor: 'pointer', fontSize: '14px' }}>{t.membership.subscribeNow}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
