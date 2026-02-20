'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, addDoc } from 'firebase/firestore';

type Language = 'en' | 'af' | 'xh';
type DonatorType = 'individual' | 'business';
type DonationMethod = 'no-tax' | 'section18a' | null;

interface Partner {
  id: string;
  imageUrl: string;
  altText: string;
  order: number;
}

export default function Partners() {
  const [language, setLanguage] = useState<Language>('en');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);

  // Donation modal states (unchanged)
  const [showModal, setShowModal] = useState(false);
  const [donatorType, setDonatorType] = useState<DonatorType>('individual');
  const [donationMethod, setDonationMethod] = useState<DonationMethod>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: 'Mr',
    fullName: '',
    businessName: '',
    websiteUrl: '',
    email: '',
    phone: '',
  });

  // Fetch partners from Firestore
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'partners'));
        let data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Partner[];
        data.sort((a, b) => (a.order || 0) - (b.order || 0));
        setPartners(data);
      } catch (error) {
        console.error('Error fetching partners:', error);
      } finally {
        setLoadingPartners(false);
      }
    };
    fetchPartners();
  }, []);

  // Donation modal functions (unchanged)
  const resetForm = () => {
    setDonationMethod(null);
    setPaymentAmount(null);
    setUseCustom(false);
    setCustomAmount('');
    setUploadedFile(null);
    setDonatorType('individual');
    setForm({ title: 'Mr', fullName: '', businessName: '', websiteUrl: '', email: '', phone: '' });
    setSubmitted(false);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.size <= 10.6 * 1024 * 1024) {
      setUploadedFile(file);
    } else {
      alert('File too large. Max size is 10.6MB.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 10.6 * 1024 * 1024) {
      setUploadedFile(file);
    } else {
      alert('File too large. Max size is 10.6MB.');
    }
  };

  const getFinalAmount = () => {
    if (useCustom) return parseInt(customAmount) || 0;
    return paymentAmount || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'donations'), {
        donatorType,
        donationMethod,
        title: donatorType === 'individual' ? form.title : null,
        fullName: donatorType === 'individual' ? form.fullName : null,
        businessName: donatorType === 'business' ? form.businessName : null,
        websiteUrl: donatorType === 'business' ? form.websiteUrl : null,
        email: form.email,
        phone: form.phone,
        amount: donationMethod === 'no-tax' ? getFinalAmount() : null,
        proofOfPaymentFileName: uploadedFile?.name || null,
        createdAt: new Date(),
        status: 'pending',
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting donation:', error);
      alert('Error submitting. Please try again.');
    }
    setSubmitting(false);
  };

  const amountOptions = [500, 1000, 2000, 5000];

  const inputStyle: React.CSSProperties = {
    padding: '10px 14px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 'normal',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const navLinkStyle = {
    textDecoration: 'none',
    color: '#4b5563',
    fontSize: '16px',
    fontWeight: '500',
    paddingBottom: '4px',
    borderBottom: '2px solid transparent',
    transition: 'all 0.3s ease',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    (e.target as HTMLElement).style.color = '#2d5016';
    (e.target as HTMLElement).style.borderBottom = '2px solid #2d5016';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    (e.target as HTMLElement).style.color = '#4b5563';
    (e.target as HTMLElement).style.borderBottom = '2px solid transparent';
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Header (unchanged) */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: 'white', boxShadow: 'none', transition: 'box-shadow 0.3s ease'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <nav style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
              <Link href="/" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Home'}
                {language === 'af' && 'Tuis'}
                {language === 'xh' && 'Ikhaya'}
              </Link>
              <Link href="/about" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'About'}
                {language === 'af' && 'Oor'}
                {language === 'xh' && 'Malunga'}
              </Link>
              <Link href="/events" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Events'}
                {language === 'af' && 'Geleenthede'}
                {language === 'xh' && 'Iziganeko'}
              </Link>
              <Link href="/store" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && "e'Bosch Store"}
                {language === 'af' && "e'Bosch Winkel"}
                {language === 'xh' && "e'Bosch Inkolo"}
              </Link>
              <Link href="/membership" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Membership'}
                {language === 'af' && 'Lidmaatskap'}
                {language === 'xh' && 'Ubulungu'}
              </Link>
              <Link href="/publicity" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Publicity'}
                {language === 'af' && 'Publisiteit'}
                {language === 'xh' && 'Isaziso'}
              </Link>
              <Link href="/partners" style={{
                textDecoration: 'none',
                color: '#2d5016',
                fontSize: '16px',
                fontWeight: '600',
                paddingBottom: '4px',
                borderBottom: '2px solid #2d5016',
                transition: 'all 0.3s ease'
              }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '0.7'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}>
                {language === 'en' && 'Our Partners'}
                {language === 'af' && 'Ons Vennote'}
                {language === 'xh' && 'Abalingani Bethu'}
              </Link>
              <Link href="/contact" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Contact'}
                {language === 'af' && 'Kontak'}
                {language === 'xh' && 'Xhomekela'}
              </Link>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                style={{
                  padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: '6px',
                  fontSize: '15px', backgroundColor: 'white', fontWeight: '500',
                  color: '#111827', cursor: 'pointer', transition: 'all 0.3s ease'
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: '100px', paddingBottom: '80px' }}>

        {/* Title */}
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
          {language === 'en' && 'Collaborators and Contributors'}
          {language === 'af' && 'Medewerkers en Bydraers'}
          {language === 'xh' && 'Abambiswano kunye Nabanegalelo'}
        </h2>

        {/* NPO info + Donate button */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
            {language === 'en' && "The e'Bosch Heritage Project is a registered Non-Profit Organisation (Reg No. 150-564)"}
            {language === 'af' && "Die e'Bosch Erfenisprojek is 'n geregistreerde Nie-Winsgewende Organisasie (Reg Nr. 150-564)"}
            {language === 'xh' && "I-e'Bosch Heritage Project yinkampani ebhalisiweyo engenzangeniso (Reg No. 150-564)"}
          </p>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '12px 36px', backgroundColor: '#2d5016', color: 'white',
              border: 'none', borderRadius: '8px', fontSize: '15px',
              fontWeight: 'normal', cursor: 'pointer', transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1a3009'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2d5016'; }}
          >
            {language === 'en' && 'Donate'}
            {language === 'af' && 'Skenk'}
            {language === 'xh' && 'Nikela'}
          </button>
        </div>

        {/* Partner Logos - dynamic from Firestore */}
        {loadingPartners ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading partners...</div>
        ) : (
          <section style={{ marginBottom: '80px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '32px',
              alignItems: 'center',
              justifyItems: 'center',
              padding: '0 20px',
            }}>
              {partners.map((partner) => (
                <div key={partner.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '16px', borderRadius: '12px', background: '#fafafa',
                    border: '1px solid #f3f4f6', transition: 'all 0.2s',
                    width: '100%',
                    height: '160px', // fixed height for consistency
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(45,80,22,0.1)';
                    e.currentTarget.style.borderColor = '#d1fae5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#f3f4f6';
                  }}>
                  <img
                    src={partner.imageUrl}
                    alt={partner.altText}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      filter: 'grayscale(20%)',
                    }}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Donation Modal – unchanged (kept for completeness) */}
      {showModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '20px'
          }}>

          <div style={{
            backgroundColor: 'white', borderRadius: '16px', width: '100%',
            maxWidth: '860px', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
            display: 'grid', gridTemplateColumns: '1fr 1fr'
          }}>

            {/* LEFT: Section 18A info */}
            <div style={{ background: '#f0fdf4', borderRadius: '16px 0 0 16px', padding: '36px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2d5016', marginBottom: '16px' }}>
                {language === 'en' && '📋 Section 18A Tax Exemption'}
                {language === 'af' && '📋 Artikel 18A Belastingvryheid'}
                {language === 'xh' && '📋 Isigqibo Sentlawulo ye-18A'}
              </h3>
              <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7', marginBottom: '20px' }}>
                {language === 'en' && "The e'Bosch Heritage Project is a registered Non-Profit Organisation (Reg No. 150-564)."}
                {language === 'af' && "Die e'Bosch Erfenisprojek is 'n geregistreerde Nie-Winsgewende Organisasie (Reg Nr. 150-564)."}
                {language === 'xh' && "I-e'Bosch Heritage Project yinkampani ebhalisiweyo engenzangeniso (Reg No. 150-564)."}
              </p>
              <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7', marginBottom: '20px' }}>
                {language === 'en' && 'To receive a Section 18A certificate, please make a payment of R500, R1,000, R2,000, R5,000 or a custom amount to the following account:'}
                {language === 'af' && "Om 'n Artikel 18A-sertifikaat te ontvang, maak asseblief 'n betaling van R500, R1,000, R2,000, R5,000 of 'n pasgemaakte bedrag na die volgende rekening:"}
                {language === 'xh' && 'Ukufumana isatifikethi se-18A, nceda yenza inkokhelo ye-R500, R1,000, R2,000, R5,000 okanye inani elikhethiweyo kwi-akhawunti ilandelayo:'}
              </p>
              <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid #d1fae5', fontSize: '14px', color: '#111827', lineHeight: '2' }}>
                <p>
                  <strong>{language === 'en' ? 'Account Name' : language === 'af' ? 'Rekeningnaam' : 'Igama le-Akhawunti'}:</strong> Greater Stb Dev Trust
                </p>
                <p><strong>{language === 'en' ? 'Bank' : 'IBhanki'}:</strong> FNB</p>
                <p>
                  <strong>{language === 'en' ? 'Account No' : language === 'af' ? 'Rekeningnr' : 'Inombolo ye-Akhawunti'}:</strong> 620 336 383 07
                </p>
                <p>
                  <strong>{language === 'en' ? 'Reference' : language === 'af' ? 'Verwysing' : 'Inkomba'}:</strong> eBosch
                </p>
              </div>
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '16px', lineHeight: '1.6' }}>
                {language === 'en' && '💡 Please save your proof of payment — you will need to upload it in the form to request your Section 18A certificate.'}
                {language === 'af' && "💡 Stoor asseblief jou bewys van betaling — jy sal dit moet oplaai in die vorm om jou Artikel 18A-sertifikaat aan te vra."}
                {language === 'xh' && '💡 Nceda gcina ubungqina bakho be-inkokhelo — uya kufuna ukuyifaka kwifom ukucela isatifikethi sakho se-18A.'}
              </p>
            </div>

            {/* RIGHT: Donation form (unchanged) */}
            <div style={{ padding: '36px', position: 'relative' }}>

              <button onClick={closeModal}
                style={{ position: 'absolute', top: '16px', right: '20px', background: 'none', border: 'none', fontSize: '22px', color: '#9ca3af', cursor: 'pointer', lineHeight: 1 }}>
                ✕
              </button>

              {submitted ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                  <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#2d5016', marginBottom: '12px' }}>
                    {language === 'en' && 'Thank you for your contribution!'}
                    {language === 'af' && 'Baie dankie vir jou bydrae!'}
                    {language === 'xh' && 'Enkosi kakhulu ngegalelo lakho!'}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '24px' }}>
                    {language === 'en' && 'Your donation has been recorded. We will be in touch shortly.'}
                    {language === 'af' && 'Jou skenking is aangeteken. Ons sal binnekort kontak maak.'}
                    {language === 'xh' && 'Isipho sakho sibhaliswe. Siza kuqhagamshelana nawe kungekudala.'}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button onClick={resetForm}
                      style={{ padding: '10px 24px', backgroundColor: '#2d5016', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 'normal' }}>
                      {language === 'en' && 'Make Another Donation'}
                      {language === 'af' && "Maak Nog 'n Skenking"}
                      {language === 'xh' && 'Yenza Esinye Isipho'}
                    </button>
                    <button onClick={closeModal}
                      style={{ padding: '10px 24px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 'normal' }}>
                      {language === 'en' && 'Close'}
                      {language === 'af' && 'Sluit'}
                      {language === 'xh' && 'Vala'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '24px', paddingRight: '32px' }}>
                    {language === 'en' && 'Make a Donation'}
                    {language === 'af' && "Maak 'n Skenking"}
                    {language === 'xh' && 'Yenza Isipho'}
                  </h2>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Donator Type */}
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        {language === 'en' && 'Type of Donator *'}
                        {language === 'af' && 'Tipe Skenker *'}
                        {language === 'xh' && 'Uhlobo Lomnikeli *'}
                      </label>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {(['individual', 'business'] as DonatorType[]).map(type => (
                          <button key={type} type="button" onClick={() => setDonatorType(type)}
                            style={{
                              flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid',
                              borderColor: donatorType === type ? '#2d5016' : '#e5e7eb',
                              backgroundColor: donatorType === type ? '#f0fdf4' : 'white',
                              color: donatorType === type ? '#2d5016' : '#6b7280',
                              fontWeight: donatorType === type ? '600' : 'normal',
                              cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s'
                            }}>
                            {type === 'individual'
                              ? (language === 'en' ? '👤 Individual' : language === 'af' ? '👤 Individu' : '👤 Umntu Ngamnye')
                              : (language === 'en' ? '🏢 Business' : language === 'af' ? '🏢 Besigheid' : '🏢 Ishishini')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Individual fields */}
                    {donatorType === 'individual' && (
                      <>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                            {language === 'en' && 'Point of Contact (Title) *'}
                            {language === 'af' && 'Kontakpunt (Titel) *'}
                            {language === 'xh' && 'Inqanaba Lonxibelelwano (Isihloko) *'}
                          </label>
                          <select value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle}>
                            <option value="Mr">{language === 'en' ? 'Mr' : language === 'af' ? 'Mnr' : 'Mnumzane'}</option>
                            <option value="Ms">{language === 'en' ? 'Ms' : language === 'af' ? 'Me' : 'Nkosikazi'}</option>
                            <option value="Other">{language === 'en' ? 'Other' : language === 'af' ? 'Ander' : 'Enye'}</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                            {language === 'en' && 'Full Name *'}
                            {language === 'af' && 'Volle Naam *'}
                            {language === 'xh' && 'Igama Eligcweleyo *'}
                          </label>
                          <input type="text" required value={form.fullName}
                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                            placeholder={language === 'en' ? 'Full Name' : language === 'af' ? 'Volle Naam' : 'Igama Eligcweleyo'}
                            style={inputStyle} />
                        </div>
                      </>
                    )}

                    {/* Business fields */}
                    {donatorType === 'business' && (
                      <>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                            {language === 'en' && 'Name of Business *'}
                            {language === 'af' && 'Naam van Besigheid *'}
                            {language === 'xh' && 'Igama Leshishini *'}
                          </label>
                          <input type="text" required value={form.businessName}
                            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                            placeholder={language === 'en' ? 'Business Name' : language === 'af' ? 'Besigheidsnaam' : 'Igama Leshishini'}
                            style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                            {language === 'en' && 'Website URL'}
                            {language === 'af' && 'Webwerf URL'}
                            {language === 'xh' && 'URL Yomnatha'}
                            {' '}<span style={{ color: '#9ca3af', fontWeight: 'normal' }}>
                              {language === 'en' ? '(optional)' : language === 'af' ? '(opsioneel)' : '(iyakhethwa)'}
                            </span>
                          </label>
                          <input type="url" placeholder="https://..." value={form.websiteUrl}
                            onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                            style={inputStyle} />
                        </div>
                      </>
                    )}

                    {/* Email */}
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        {language === 'en' && 'Email *'}
                        {language === 'af' && 'E-pos *'}
                        {language === 'xh' && 'I-imeyile *'}
                      </label>
                      <input type="email" required placeholder="email@example.com" value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
                    </div>

                    {/* Phone */}
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        {language === 'en' && 'Phone Number'}
                        {language === 'af' && 'Telefoonnommer'}
                        {language === 'xh' && 'Inombolo Yomnxeba'}
                        {' '}<span style={{ color: '#9ca3af', fontWeight: 'normal' }}>
                          {language === 'en' ? '(optional)' : language === 'af' ? '(opsioneel)' : '(iyakhethwa)'}
                        </span>
                      </label>
                      <input type="tel" placeholder="+27 ..." value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
                    </div>

                    {/* Donation Method */}
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        {language === 'en' && 'Choose Donation Method *'}
                        {language === 'af' && 'Kies Skenkingsmetode *'}
                        {language === 'xh' && 'Khetha Indlela Yokunikela *'}
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                          {
                            value: 'no-tax',
                            label: language === 'en' ? '💳 Donate with no Tax Exemption'
                              : language === 'af' ? '💳 Skenk sonder Belastingvryheid'
                              : '💳 Nikela ngaphandle Kwentlawulo'
                          },
                          {
                            value: 'section18a',
                            label: language === 'en' ? '📋 Section 18A Exemption Certificate available on request'
                              : language === 'af' ? '📋 Artikel 18A Vryheidssertifikaat op versoek beskikbaar'
                              : '📋 Isatifikethi se-18A sifumaneka ngokucela'
                          },
                        ].map(opt => (
                          <button key={opt.value} type="button"
                            onClick={() => { setDonationMethod(opt.value as DonationMethod); setPaymentAmount(null); setUseCustom(false); setCustomAmount(''); setUploadedFile(null); }}
                            style={{
                              padding: '12px 16px', borderRadius: '8px', border: '2px solid', textAlign: 'left',
                              borderColor: donationMethod === opt.value ? '#2d5016' : '#e5e7eb',
                              backgroundColor: donationMethod === opt.value ? '#f0fdf4' : 'white',
                              color: donationMethod === opt.value ? '#2d5016' : '#374151',
                              fontWeight: donationMethod === opt.value ? '600' : 'normal',
                              cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s'
                            }}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* No Tax: payment amount */}
                    {donationMethod === 'no-tax' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                          {language === 'en' && 'Payment Amount *'}
                          {language === 'af' && 'Betalingsbedrag *'}
                          {language === 'xh' && 'Inani Lentlawulo *'}
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' }}>
                          {amountOptions.map(amt => (
                            <button key={amt} type="button"
                              onClick={() => { setPaymentAmount(amt); setUseCustom(false); setCustomAmount(''); }}
                              style={{
                                padding: '10px', borderRadius: '8px', border: '2px solid',
                                borderColor: paymentAmount === amt && !useCustom ? '#2d5016' : '#e5e7eb',
                                backgroundColor: paymentAmount === amt && !useCustom ? '#f0fdf4' : 'white',
                                color: paymentAmount === amt && !useCustom ? '#2d5016' : '#374151',
                                fontWeight: paymentAmount === amt && !useCustom ? '700' : 'normal',
                                cursor: 'pointer', fontSize: '14px'
                              }}>
                              R{amt.toLocaleString()}
                            </button>
                          ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button type="button" onClick={() => { setUseCustom(true); setPaymentAmount(null); }}
                            style={{
                              padding: '10px 16px', borderRadius: '8px', border: '2px solid',
                              borderColor: useCustom ? '#2d5016' : '#e5e7eb',
                              backgroundColor: useCustom ? '#f0fdf4' : 'white',
                              color: useCustom ? '#2d5016' : '#374151',
                              fontWeight: useCustom ? '600' : 'normal',
                              cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap'
                            }}>
                            {language === 'en' ? '+ Custom amount' : language === 'af' ? '+ Pasgemaakte bedrag' : '+ Inani elikhethiweyo'}
                          </button>
                          {useCustom && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                              <span style={{ fontSize: '15px', fontWeight: '600', color: '#374151' }}>R</span>
                              <input type="number" min="1" placeholder="0" value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value)}
                                style={{ ...inputStyle, flex: 1 }} required={useCustom} />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Section 18A: bank details + upload */}
                    {donationMethod === 'section18a' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '16px', border: '1px solid #bbf7d0', fontSize: '13px', color: '#111827', lineHeight: '2' }}>
                          <p style={{ fontWeight: '600', marginBottom: '6px' }}>
                            {language === 'en' && 'Please pay to the following account:'}
                            {language === 'af' && 'Maak asseblief betaling na die volgende rekening:'}
                            {language === 'xh' && 'Nceda yenza inkokhelo kwi-akhawunti ilandelayo:'}
                          </p>
                          <p><strong>{language === 'en' ? 'Account Name' : language === 'af' ? 'Rekeningnaam' : 'Igama le-Akhawunti'}:</strong> Greater Stb Dev Trust</p>
                          <p><strong>{language === 'en' ? 'Bank' : 'IBhanki'}:</strong> FNB</p>
                          <p><strong>{language === 'en' ? 'Account No' : language === 'af' ? 'Rekeningnr' : 'Inombolo ye-Akhawunti'}:</strong> 620 336 383 07</p>
                          <p><strong>{language === 'en' ? 'Reference' : language === 'af' ? 'Verwysing' : 'Inkomba'}:</strong> eBosch</p>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                            {language === 'en' && 'Upload Proof of Payment *'}
                            {language === 'af' && 'Laai Bewys van Betaling op *'}
                            {language === 'xh' && 'Layisha Ubungqina Bentlawulo *'}
                          </label>
                          <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleFileDrop}
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                              border: `2px dashed ${isDragging ? '#2d5016' : '#d1d5db'}`,
                              borderRadius: '8px', padding: '24px', textAlign: 'center',
                              cursor: 'pointer', backgroundColor: isDragging ? '#f0fdf4' : '#fafafa',
                              transition: 'all 0.2s'
                            }}>
                            <input ref={fileInputRef} type="file" style={{ display: 'none' }}
                              onChange={handleFileSelect} accept=".pdf,.jpg,.jpeg,.png" />
                            {uploadedFile ? (
                              <div>
                                <p style={{ color: '#2d5016', fontWeight: '600', fontSize: '14px' }}>✅ {uploadedFile.name}</p>
                                <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
                                  {language === 'en' ? 'Click to replace' : language === 'af' ? 'Klik om te vervang' : 'Cofa ukutshintsha'}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                                  {language === 'en' ? '📎 Drag and drop files here' : language === 'af' ? '📎 Sleep en los lêers hier' : '📎 Tsala kwaye ulahle iifayili apha'}
                                </p>
                                <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
                                  {language === 'en' ? 'Max. file size: 10.6MB' : language === 'af' ? 'Maks. lêergrootte: 10.6MB' : 'Ubungakanani bomxholo: 10.6MB'}
                                </p>
                                <p style={{ color: '#2d5016', fontSize: '13px', fontWeight: '600', marginTop: '8px', textDecoration: 'underline' }}>
                                  {language === 'en' ? 'Browse Files' : language === 'af' ? 'Blaai deur Lêers' : 'Khangela Iifayili'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit */}
                    {donationMethod && (
                      <button type="submit" disabled={submitting}
                        style={{
                          width: '100%', padding: '14px',
                          backgroundColor: submitting ? '#9ca3af' : '#2d5016',
                          color: 'white', border: 'none', borderRadius: '8px',
                          fontSize: '16px', fontWeight: 'normal',
                          cursor: submitting ? 'not-allowed' : 'pointer',
                          marginTop: '8px', transition: 'background-color 0.2s'
                        }}>
                        {submitting
                          ? (language === 'en' ? 'Submitting...' : language === 'af' ? 'Besig om in te dien...' : 'Iyathunyelwa...')
                          : (language === 'en' ? 'Donate' : language === 'af' ? 'Skenk' : 'Nikela')}
                      </button>
                    )}

                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}