'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';

type Language = 'en' | 'af' | 'xh';

interface Folder {
  id: string;
  nameEn: string;
  nameAf: string;
  nameXh: string;
}

interface Image {
  id: string;
  imageUrl: string;
  order: number;
}

export default function FolderDetailPage() {
  const { folderId } = useParams();
  const [language, setLanguage] = useState<Language>('en');
  const [folder, setFolder] = useState<Folder | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!folderId) return;
      try {
        const folderRef = doc(db, 'galleryFolders', folderId as string);
        const folderSnap = await getDoc(folderRef);
        if (folderSnap.exists()) {
          setFolder({ id: folderSnap.id, ...folderSnap.data() } as Folder);
        }

        const q = query(
          collection(db, 'galleryImages'),
          where('folderId', '==', folderId),
          orderBy('order', 'asc')
        );
        const imageSnap = await getDocs(q);
        const imageData = imageSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Image));
        setImages(imageData);
      } catch (error) {
        console.error('Error fetching folder:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [folderId]);

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

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>;

  return (
    <div className="min-h-screen bg-white">
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
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
              <Link href="/partners" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Our Partners'}
                {language === 'af' && 'Ons Vennote'}
                {language === 'xh' && 'Abalingani Bethu'}
              </Link>
              <Link href="/archive" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Archive'}
                {language === 'af' && 'Argief'}
                {language === 'xh' && 'Ugcino'}
              </Link>
              <Link href="/gallery" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Gallery'}
                {language === 'af' && 'Galery'}
                {language === 'xh' && 'Igalari'}
              </Link>
              <Link href="/contact" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Contact'}
                {language === 'af' && 'Kontak'}
                {language === 'xh' && 'Xhomekela'}
              </Link>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '15px', backgroundColor: 'white', fontWeight: '500', color: '#111827', cursor: 'pointer' }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.borderColor = '#2d5016'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.borderColor = '#d1d5db'; }}
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
        {/* Back to Gallery button - modern Next.js Link */}
        <div style={{ marginBottom: '40px' }}>
          <Link
            href="/gallery"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#2d5016',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '16px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a3009')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2d5016')}
          >
            <ArrowLeft size={20} />
            Back to Gallery
          </Link>
        </div>

        {/* Title removed as requested */}

        {images.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
            No images in this folder.
          </div>
        ) : (
          <div style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
          }}>
            {images.map((img) => (
              <div
                key={img.id}
                onClick={() => setLightboxSrc(img.imageUrl)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  aspectRatio: '1/1',
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
                  src={img.imageUrl}
                  alt="Gallery"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox */}
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
            alt="Enlarged"
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