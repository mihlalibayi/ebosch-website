'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Search, ChevronDown, ShoppingCart, MapPin, Phone, Globe, Star } from 'lucide-react';
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
  time?: string;
  venue?: string;
  isFreeEvent: boolean;
  payWhatYouWant: boolean;
  minimumAmount?: number;
}

interface Business {
  id: string;
  name: string;
  description: string;
  email?: string;
  phone?: string;
  address: string;
  website: string;
  logoUrl?: string;
  rootCategory: string;
  status: 'active' | 'inactive';
}

export default function Store() {
  const [language, setLanguage] = useState<Language>('en');
  const t = translations[language];

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'products' | 'businesses'>('products');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

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

      // Load businesses
      const businessesSnap = await getDocs(collection(db, 'businesses'));
      const businessesData = businessesSnap.docs
        .map(d => ({
          id: d.id,
          ...d.data()
        }))
        .filter(b => (b as Business).status === 'active') as Business[];
      setBusinesses(businessesData);

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

  const filteredProducts = products.filter(p => {
    const matchesCategory = !selectedCategory || p.rootCategory === selectedCategory;
    const matchesSubcategory = !selectedSubcategory || p.subcategory === selectedSubcategory;
    const matchesSearch = !searchTerm || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSubcategory && matchesSearch && !p.outOfStock;
  });

  const filteredBusinesses = businesses.filter(b => {
    const matchesCategory = !selectedCategory || b.rootCategory === selectedCategory;
    const matchesSearch = !searchTerm ||
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);
  const selectedSubcategoryData = selectedCategoryData?.subcategories?.find(s => s.id === selectedSubcategory);

  const emptyStateText = {
    en: {
      noProducts: 'No products available in this category',
      noBusinesses: 'No businesses available in this category',
      selectCategory: 'Select a category to get started'
    },
    af: {
      noProducts: 'Geen produkte beskikbaar in hierdie kategorie',
      noBusinesses: 'Geen besighede beskikbaar in hierdie kategorie',
      selectCategory: 'Kies \'n kategorie om aan die gang te kom'
    },
    xh: {
      noProducts: 'Azintsi zemibuzo efumanekayo kwi-kategori',
      noBusinesses: 'Azintsi zizakwenza efumanekayo kwi-kategori',
      selectCategory: 'Khetha i-kategori ukuqala'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
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
            </nav>
          </div>

          {/* Page Title */}
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
              {language === 'en' && "e'Bosch Store"}
              {language === 'af' && "e'Bosch Winkel"}
              {language === 'xh' && "e'Bosch Inkolo"}
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px', margin: '0' }}>
              {language === 'en' && 'Discover products, services, and local businesses'}
              {language === 'af' && 'Ontdek produkte, dienste en plaaslike besighede'}
              {language === 'xh' && 'Kunqoba imveliso, iinkonzo, kunye nenkolo zasekhaya'}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            position: 'relative',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <Search style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              width: '20px',
              height: '20px'
            }} />
            <input
              type="text"
              placeholder={
                language === 'en' ? 'Search products and businesses...' :
                language === 'af' ? 'Soek produkte en besighede...' :
                'Khangela imveliso kunye nenkolo...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#2d5016')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>
        </div>

        {/* View Toggle */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            padding: '4px',
            gap: '4px'
          }}>
            <button
              onClick={() => setViewMode('products')}
              style={{
                padding: '10px 24px',
                backgroundColor: viewMode === 'products' ? '#2d5016' : 'transparent',
                color: viewMode === 'products' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'products') {
                  e.currentTarget.style.backgroundColor = '#f0fdf4';
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'products') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {language === 'en' && 'Products'}
              {language === 'af' && 'Produkte'}
              {language === 'xh' && 'Imveliso'}
            </button>
            <button
              onClick={() => setViewMode('businesses')}
              style={{
                padding: '10px 24px',
                backgroundColor: viewMode === 'businesses' ? '#2d5016' : 'transparent',
                color: viewMode === 'businesses' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'businesses') {
                  e.currentTarget.style.backgroundColor = '#f0fdf4';
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'businesses') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {language === 'en' && 'Businesses'}
              {language === 'af' && 'Besighede'}
              {language === 'xh' && 'Inkolo'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }}>
          {/* Sidebar - Categories */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '16px'
            }}>
              {language === 'en' && 'Categories'}
              {language === 'af' && 'Kategorieë'}
              {language === 'xh' && 'Iikategori'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                  setExpandedCategory(null);
                }}
                style={{
                  padding: '12px 16px',
                  backgroundColor: !selectedCategory ? '#f0fdf4' : 'transparent',
                  color: !selectedCategory ? '#2d5016' : '#374151',
                  border: '1px solid ' + (!selectedCategory ? '#d1fae5' : '#e5e7eb'),
                  borderRadius: '8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== null) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== null) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {language === 'en' && 'All Categories'}
                {language === 'af' && 'Alle Kategorieë'}
                {language === 'xh' && 'Zonke Iikategori'}
              </button>

              {categories.map(category => (
                <div key={category.id}>
                  <button
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSelectedSubcategory(null);
                      setExpandedCategory(expandedCategory === category.id ? null : category.id);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: selectedCategory === category.id ? '#f0fdf4' : 'transparent',
                      color: selectedCategory === category.id ? '#2d5016' : '#374151',
                      border: '1px solid ' + (selectedCategory === category.id ? '#d1fae5' : '#e5e7eb'),
                      borderRadius: '8px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCategory !== category.id) {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCategory !== category.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span>{getLanguageName(category.id)}</span>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <ChevronDown
                        size={18}
                        style={{
                          transform: expandedCategory === category.id ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }}
                      />
                    )}
                  </button>

                  {/* Subcategories */}
                  {expandedCategory === category.id && category.subcategories && (
                    <div style={{ marginTop: '8px', marginLeft: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {category.subcategories.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setSelectedSubcategory(sub.id);
                          }}
                          style={{
                            padding: '10px 12px',
                            backgroundColor: selectedSubcategory === sub.id ? '#dcfce7' : 'transparent',
                            color: selectedSubcategory === sub.id ? '#166534' : '#6b7280',
                            border: 'none',
                            borderRadius: '6px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '13px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedSubcategory !== sub.id) {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedSubcategory !== sub.id) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div>
            {/* Breadcrumb */}
            {selectedCategory && (
              <div style={{ marginBottom: '24px', fontSize: '14px', color: '#6b7280' }}>
                <span>{getLanguageName(selectedCategory)}</span>
                {selectedSubcategory && (
                  <>
                    <span style={{ margin: '0 8px' }}>/</span>
                    <span>{selectedSubcategoryData?.name}</span>
                  </>
                )}
              </div>
            )}

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
            ) : viewMode === 'products' ? (
              /* Products View */
              filteredProducts.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '24px'
                }}>
                  {filteredProducts.map(product => (
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
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#6b7280'
                }}>
                  <p style={{ fontSize: '18px', marginBottom: '8px' }}>
                    {selectedCategory ? 
                      emptyStateText[language].noProducts :
                      emptyStateText[language].selectCategory}
                  </p>
                </div>
              )
            ) : (
              /* Businesses View */
              filteredBusinesses.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '24px'
                }}>
                  {filteredBusinesses.map(business => (
                    <div
                      key={business.id}
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
                      {/* Business Logo */}
                      <div style={{
                        width: '100%',
                        height: '200px',
                        backgroundColor: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        {business.logoUrl ? (
                          <img
                            src={business.logoUrl}
                            alt={business.name}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain',
                              padding: '16px'
                            }}
                          />
                        ) : (
                          <div style={{ color: '#9ca3af', fontSize: '48px' }}>🏢</div>
                        )}
                      </div>

                      {/* Business Info */}
                      <div style={{ padding: '16px' }}>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#111827',
                          marginBottom: '8px'
                        }}>
                          {business.name}
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
                          {business.description}
                        </p>

                        {/* Contact Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                          {business.phone && (
                            <a
                              href={`tel:${business.phone}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '12px',
                                color: '#2d5016',
                                textDecoration: 'none',
                                transition: 'color 0.2s'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#1a3009')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#2d5016')}
                            >
                              <Phone size={14} />
                              {business.phone}
                            </a>
                          )}
                          {business.address && (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px',
                                fontSize: '12px',
                                color: '#6b7280'
                              }}
                            >
                              <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                              <span>{business.address}</span>
                            </div>
                          )}
                          {business.website && (
                            <a
                              href={business.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '12px',
                                color: '#2d5016',
                                textDecoration: 'none',
                                transition: 'color 0.2s'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#1a3009')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#2d5016')}
                            >
                              <Globe size={14} />
                              {language === 'en' ? 'Visit' : language === 'af' ? 'Besoek' : 'Hlola'}
                            </a>
                          )}
                        </div>

                        <button
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            backgroundColor: '#f0fdf4',
                            color: '#2d5016',
                            border: '2px solid #d1fae5',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#dcfce7';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0fdf4';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          {language === 'en' ? 'View Products' : language === 'af' ? 'Sien Produkte' : 'Jonga Imveliso'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#6b7280'
                }}>
                  <p style={{ fontSize: '18px', marginBottom: '8px' }}>
                    {selectedCategory ? 
                      emptyStateText[language].noBusinesses :
                      emptyStateText[language].selectCategory}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
