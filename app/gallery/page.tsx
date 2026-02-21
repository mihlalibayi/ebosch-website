'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

type Language = 'en' | 'af' | 'xh';

interface Folder {
  id: string;
  nameEn: string;
  nameAf: string;
  nameXh: string;
  order: number;
}

interface Image {
  folderId: string;
  imageUrl: string;
  order: number;
}

export default function GalleryPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [covers, setCovers] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const folderQuery = query(collection(db, 'galleryFolders'), orderBy('order', 'asc'));
        const folderSnap = await getDocs(folderQuery);
        const folderData = folderSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Folder[];
        setFolders(folderData);

        const imageSnap = await getDocs(collection(db, 'galleryImages'));
        const images = imageSnap.docs.map(doc => doc.data() as Image);
        const coverMap = new Map<string, string>();
        folderData.forEach(folder => {
          const folderImages = images
            .filter(img => img.folderId === folder.id)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          if (folderImages.length > 0) {
            coverMap.set(folder.id, folderImages[0].imageUrl);
          }
        });
        setCovers(coverMap);
      } catch (error) {
        console.error('Error fetching gallery:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const navLinkStyle = {
    textDecoration: 'none',
    color: '#4b5563',
    fontSize: '16px',
    fontWeight: '500',
    paddingBottom: '4px',
    borderBottom: '2px solid transparent',
    transition: 'all 0.3s ease',
  };

  const activeNavLinkStyle = {
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

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading gallery...</div>;

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
              <Link href="/gallery" style={activeNavLinkStyle}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '0.7'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}>
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
        {/* Title removed as requested */}

        {folders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
            No folders yet.
          </div>
        ) : (
          <div style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
          }}>
            {folders.map((folder) => {
              const folderName = language === 'en' ? folder.nameEn : language === 'af' ? folder.nameAf : folder.nameXh;
              const coverUrl = covers.get(folder.id) || '/placeholder.jpg';
              return (
                <Link key={folder.id} href={`/gallery/${folder.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(45,80,22,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
                  }}>
                    <div style={{ aspectRatio: '1/1', overflow: 'hidden' }}>
                      <img
                        src={coverUrl}
                        alt={folderName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#2d5016', margin: 0 }}>
                        {folderName}
                      </h3>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}