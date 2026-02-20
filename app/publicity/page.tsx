'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

type Language = 'en' | 'af' | 'xh';

interface PublicityImage {
  id: string;
  imageUrl: string;
}

export default function Publicity() {
  const [language, setLanguage] = useState<Language>('en');
  const [images, setImages] = useState<PublicityImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const q = query(collection(db, 'publicityImages'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as PublicityImage[];
        setImages(data);
      } catch (error) {
        console.error('Error fetching publicity images:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  // Distribute into 3 columns
  const col1 = images.filter((_, i) => i % 3 === 0);
  const col2 = images.filter((_, i) => i % 3 === 1);
  const col3 = images.filter((_, i) => i % 3 === 2);

  const navLinkStyle: React.CSSProperties = {
    textDecoration: 'none',
    color: '#4b5563',
    fontSize: '16px',
    fontWeight: '500',
    paddingBottom: '4px',
    borderBottom: '2px solid transparent',
    transition: 'all 0.3s ease',
  };

  const activeNavLinkStyle: React.CSSProperties = {
    ...navLinkStyle,
    color: '#2d5016',
    fontWeight: '600',
    borderBottom: '2px solid #2d5016',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    (e.target as HTMLElement).style.color = '#2d5016';
    (e.target as HTMLElement).style.borderBottom = '2px solid #2d5016';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    (e.target as HTMLElement).style.color = '#4b5563';
    (e.target as HTMLElement).style.borderBottom = '2px solid transparent';
  };

  const mediaContent = {
    en: {
      subtitle: 'Media Releases',
      description: (
        <>
          The <strong style={{ color: '#228B22' }}>e'Bosch Heritage Project</strong> hosts a wide range of events that celebrate{' '}
          <span style={{ color: '#2E8B57' }}>community</span>, <span style={{ color: '#3CB371' }}>music</span> and{' '}
          <span style={{ color: '#32CD32' }}>cultural heritage</span> in Stellenbosch.
        </>
      ),
      tags: ['School Choir Festivals', 'Talent Showcases', 'Public Lectures', 'Leadership Courses', 'Art Exhibitions', 'Community Workshops'],
      footer: 'Each event is designed to bring people together, promote inclusion and highlight the rich diversity of local traditions. Activities are featured in media releases, social media, newspapers, magazines and other platforms.',
    },
    af: {
      subtitle: 'Media Vrylatings',
      description: (
        <>
          Die <strong style={{ color: '#228B22' }}>e'Bosch Erfenisprojek</strong> bied 'n wye reeks geleenthede aan wat{' '}
          <span style={{ color: '#2E8B57' }}>gemeenskap</span>, <span style={{ color: '#3CB371' }}>musiek</span> en{' '}
          <span style={{ color: '#32CD32' }}>kulturele erfenis</span> in Stellenbosch vier.
        </>
      ),
      tags: ['Skoolkoorfees', 'Talentvertoning', 'Openbare Lesings', 'Leierskapkursusse', 'Kunsuitstalling', 'Gemeenskapswerkswinkels'],
      footer: "Elke geleentheid is ontwerp om mense saam te bring, insluiting te bevorder en die ryk diversiteit van plaaslike tradisies uit te lig. Aktiwiteite word in mediavrylating, sosiale media, koerante, tydskrifte en ander platforms vertoon.",
    },
    xh: {
      subtitle: 'Izikhululo Zeendaba',
      description: (
        <>
          I-<strong style={{ color: '#228B22' }}>e'Bosch Heritage Project</strong> ibamba uluhlu olubanzi lweziganeko ezibhiyozela{' '}
          <span style={{ color: '#2E8B57' }}>uluntu</span>, <span style={{ color: '#3CB371' }}>umculo</span> kunye{' '}
          <span style={{ color: '#32CD32' }}>nenkcubeko yendalo</span> eStellenbosh.
        </>
      ),
      tags: ['Iifestivali Zekhwayarele', 'Iimboniso Zezakhono', 'Iifundo Zoluntu', 'Iikosi Zobunkokheli', 'Iimboniso Zobugcisa', 'Iiseminali Zeluntu'],
      footer: 'Isiganeko ngasinye sihlelelwe ukudibanisa abantu, ukukhuthaza ukubandakanywa kunye nokugqamisa ubutyebi bamasiko endawo. Imisebenzi iboniswa kwimiyalezo yeendaba, kwezentlalo, amaphephandaba, imagazini kunye nezinye iindawo.',
    },
  };

  const content = mediaContent[language];

  const MasonryColumn = ({ items }: { items: PublicityImage[] }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {items.map((photo) => (
        <div
          key={photo.id}
          onClick={() => setLightboxSrc(photo.imageUrl)}
          style={{
            cursor: 'pointer',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(45,80,22,0.2)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}
        >
          <img
            src={photo.imageUrl}
            alt="e'Bosch media coverage"
            style={{ width: '100%', height: 'auto', display: 'block' }}
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header (unchanged) */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        transition: 'box-shadow 0.3s ease',
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
              <Link href="/publicity" style={activeNavLinkStyle}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '0.7'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}>
                {language === 'en' && 'Publicity'}
                {language === 'af' && 'Publisiteit'}
                {language === 'xh' && 'Isaziso'}
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
                  padding: '8px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '15px',
                  backgroundColor: 'white',
                  fontWeight: '500',
                  color: '#111827',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
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

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '110px 48px 48px 48px' }}>

        {/* Media Releases Section (unchanged) */}
        <section style={{ marginBottom: '60px' }}>
          <div style={{
            maxWidth: '800px',
            margin: 'auto',
            padding: '30px',
            background: '#ffffff',
            textAlign: 'center',
            borderLeft: '4px solid #2d5016',
            borderRadius: '8px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}>
            <h3 style={{ color: '#006400', fontSize: '28px', marginBottom: '20px', fontWeight: '600' }}>
              {content.subtitle}
            </h3>
            <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#333', marginBottom: '20px' }}>
              {content.description}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
              {content.tags.map((tag, i) => {
                const colors = ['#006400', '#228B22', '#2E8B57', '#3CB371', '#32CD32', '#9ACD32'];
                const sizes = ['20px', '18px', '16px', '20px', '18px', '16px'];
                return (
                  <span key={i} style={{
                    color: colors[i],
                    fontSize: sizes[i],
                    fontWeight: i % 2 === 0 ? '600' : '400',
                    fontStyle: i === 2 ? 'italic' : 'normal',
                  }}>
                    {tag}
                  </span>
                );
              })}
            </div>
            <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#555' }}>
              {content.footer}
            </p>
          </div>
        </section>

        {/* Masonry Gallery - from Firestore, newest first */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading gallery...</div>
        ) : images.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No images yet.</div>
        ) : (
          <section style={{ marginBottom: '80px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              alignItems: 'start',
            }}>
              <MasonryColumn items={col1} />
              <MasonryColumn items={col2} />
              <MasonryColumn items={col3} />
            </div>
          </section>
        )}

      </main>

      {/* Lightbox (unchanged) */}
      {lightboxSrc && (
        <div
          onClick={() => setLightboxSrc(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={lightboxSrc}
            alt="Enlarged media"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            }}
          />
          <button
            onClick={() => setLightboxSrc(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '28px',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '36px',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}