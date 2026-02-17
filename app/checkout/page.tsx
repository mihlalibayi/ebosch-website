'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import translations from '@/app/translations.json';

type Language = 'en' | 'af' | 'xh';

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  rootCategory: string;
}

export default function Checkout() {
  const [language, setLanguage] = useState<Language>('en');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const [deliveryOptions, setDeliveryOptions] = useState<{ [key: string]: 'pickup' | 'delivery' | 'digital' | 'na' }>({});
  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'payfast' | 'bank_transfer'>('payfast');

  const t = translations[language];

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        const cartData = localStorage.getItem(`cart_${sessionId}`);
        if (cartData) {
          setCartItems(JSON.parse(cartData));
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading cart:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDeliveryChange = (productId: string, type: 'pickup' | 'delivery' | 'digital' | 'na') => {
    setDeliveryOptions({
      ...deliveryOptions,
      [productId]: type
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = Object.values(deliveryOptions).filter(opt => opt === 'delivery').length * 50;
  const total = subtotal + deliveryFee;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      alert(language === 'en' ? 'Please fill all required fields' : 
            language === 'af' ? 'Vul asseblief alle verpligte velde in' :
            'Tiyisele zonke izinkalo ezilindelweyo');
      return;
    }

    const requiresAddress = Object.values(deliveryOptions).includes('delivery');
    if (requiresAddress && (!formData.address || !formData.city)) {
      alert(language === 'en' ? 'Please enter delivery address' :
            language === 'af' ? 'Voer asseblief liewer-adres in' :
            'Tiyisele ikheli lokuthunyelwa');
      return;
    }

    console.log('Checkout data:', {
      customer: formData,
      cart: cartItems,
      deliveryOptions,
      couponCode,
      paymentMethod,
      total
    });

    alert('Checkout would proceed here with payment integration');
  };

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
              <Link href="/store" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                {language === 'en' && "e'Bosch Store"}
                {language === 'af' && "e'Bosch Winkel"}
                {language === 'xh' && "e'Bosch Inkolo"}
              </Link>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
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
          {language === 'en' && 'Checkout'}
          {language === 'af' && 'Uitslag'}
          {language === 'xh' && 'Ikheki'}
        </h1>

        {loading || cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
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
              fontWeight: '600'
            }}>
              {language === 'en' && 'Back to Store'}
              {language === 'af' && 'Terug na Winkel'}
              {language === 'xh' && 'Buya ku-Store'}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleCheckout}>
            <div style={{ display: 'grid', gridTemplateColumns: '450px 1fr', gap: '40px' }}>
              {/* Order Summary - LEFT SIDE - LARGER */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                height: 'fit-content',
                position: 'sticky',
                top: '100px'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '28px'
                }}>
                  {language === 'en' && 'Order Summary'}
                  {language === 'af' && 'Bestellingoverzicht'}
                  {language === 'xh' && 'Isishwankathelo Soku-Order'}
                </h3>

                <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '32px', paddingRight: '12px' }}>
                  {cartItems.map(item => (
                    <div key={item.productId} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                      paddingBottom: '16px',
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: '15px'
                    }}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#111827' }}>
                          {item.productName}
                        </p>
                        <p style={{ margin: '0', color: '#6b7280', fontSize: '13px' }}>
                          x{item.quantity} @ R{item.price.toFixed(2)}
                        </p>
                      </div>
                      <span style={{ fontWeight: '600', color: '#111827' }}>
                        R{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{ color: '#6b7280', fontSize: '15px' }}>
                    {language === 'en' ? 'Subtotal' : language === 'af' ? 'Subtotaal' : 'Isishwankathelo'}
                  </span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>
                    R{subtotal.toFixed(2)}
                  </span>
                </div>

                {deliveryFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ color: '#6b7280', fontSize: '15px' }}>
                      {language === 'en' ? 'Delivery Fee' : language === 'af' ? 'Lewingsgeld' : 'Intela Yokukhulisa'}
                    </span>
                    <span style={{ fontWeight: '600', color: '#111827' }}>
                      R{deliveryFee.toFixed(2)}
                    </span>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '32px',
                  fontSize: '18px',
                  fontWeight: '700'
                }}>
                  <span style={{ color: '#111827' }}>
                    {language === 'en' && 'Total'}
                    {language === 'af' && 'Totaal'}
                    {language === 'xh' && 'Inani Elipheleleyo'}
                  </span>
                  <span style={{ color: '#2d5016' }}>
                    R{total.toFixed(2)}
                  </span>
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: '#2d5016',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginBottom: '12px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1a3009';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2d5016';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {language === 'en' && 'Complete Purchase'}
                  {language === 'af' && 'Voltooi Aankoop'}
                  {language === 'xh' && 'Kumalisane Ukuthenga'}
                </button>

                <Link href="/cart" style={{
                  display: 'block',
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  textAlign: 'center',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '15px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}>
                  {language === 'en' && 'Back to Cart'}
                  {language === 'af' && 'Terug na Mandjie'}
                  {language === 'xh' && 'Buya Ku-Cart'}
                </Link>
              </div>

              {/* Checkout Form - RIGHT SIDE */}
              <div>
                {/* Customer Details */}
                <section style={{ marginBottom: '40px' }}>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '24px'
                  }}>
                    {language === 'en' && 'Customer Details'}
                    {language === 'af' && 'Klantebesonderhede'}
                    {language === 'xh' && 'Iinkcukacha Zemali'}
                  </h2>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <input
                      type="text"
                      name="firstName"
                      placeholder={language === 'en' ? 'First Name *' : language === 'af' ? 'Voornaam *' : 'Igama Lokuqala *'}
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder={language === 'en' ? 'Last Name *' : language === 'af' ? 'Van *' : 'Ifani *'}
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                    <input
                      type="email"
                      name="email"
                      placeholder={language === 'en' ? 'Email *' : language === 'af' ? 'E-pos *' : 'I-imeyile *'}
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder={language === 'en' ? 'Phone *' : language === 'af' ? 'Foon *' : 'Umnxeba *'}
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </section>

                {/* Delivery Options */}
                <section style={{ marginBottom: '40px' }}>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '24px'
                  }}>
                    {language === 'en' && 'Delivery Options'}
                    {language === 'af' && 'Lewingsopsies'}
                    {language === 'xh' && 'Iinketho Zokukhulisa'}
                  </h2>

                  {cartItems.map(item => (
                    <div key={item.productId} style={{
                      padding: '16px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <p style={{ fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
                        {item.productName}
                      </p>

                      <div style={{ display: 'flex', gap: '24px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name={`delivery_${item.productId}`}
                            value="pickup"
                            checked={deliveryOptions[item.productId] === 'pickup' || !deliveryOptions[item.productId]}
                            onChange={(e) => handleDeliveryChange(item.productId, e.target.value as 'pickup')}
                          />
                          <span style={{ fontSize: '14px' }}>
                            {language === 'en' ? 'Pickup' : language === 'af' ? 'Optel' : 'Ukuthenga'}
                          </span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name={`delivery_${item.productId}`}
                            value="delivery"
                            checked={deliveryOptions[item.productId] === 'delivery'}
                            onChange={(e) => handleDeliveryChange(item.productId, e.target.value as 'delivery')}
                          />
                          <span style={{ fontSize: '14px' }}>
                            {language === 'en' ? 'Delivery (R50)' : language === 'af' ? 'Lewering (R50)' : 'Ukukhulisa (R50)'}
                          </span>
                        </label>

                        {item.rootCategory === 'ebosch' && (
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name={`delivery_${item.productId}`}
                              value="digital"
                              checked={deliveryOptions[item.productId] === 'digital'}
                              onChange={(e) => handleDeliveryChange(item.productId, e.target.value as 'digital')}
                            />
                            <span style={{ fontSize: '14px' }}>
                              {language === 'en' ? 'Digital' : language === 'af' ? 'Digitaal' : 'I-Digital'}
                            </span>
                          </label>
                        )}
                      </div>
                    </div>
                  ))}

                  {Object.values(deliveryOptions).includes('delivery') && (
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '8px',
                      border: '1px solid #d1fae5',
                      marginTop: '24px'
                    }}>
                      <p style={{ fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
                        {language === 'en' && 'Delivery Address'}
                        {language === 'af' && 'Lewingsadres'}
                        {language === 'xh' && 'Ikheli Lokukhulisa'}
                      </p>

                      <input
                        type="text"
                        name="address"
                        placeholder={language === 'en' ? 'Street Address *' : language === 'af' ? 'Straatadres *' : 'Ikheli Lomnqwazi *'}
                        value={formData.address}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          marginBottom: '12px'
                        }}
                      />

                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                        <input
                          type="text"
                          name="city"
                          placeholder={language === 'en' ? 'City *' : language === 'af' ? 'Stad *' : 'Isixeko *'}
                          value={formData.city}
                          onChange={handleInputChange}
                          style={{
                            padding: '12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px'
                          }}
                        />
                        <input
                          type="text"
                          name="postalCode"
                          placeholder={language === 'en' ? 'Postal Code' : language === 'af' ? 'Poskode' : 'Ikhodi Yeposi'}
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          style={{
                            padding: '12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </section>

                {/* Coupon Code */}
                <section style={{ marginBottom: '40px' }}>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '24px'
                  }}>
                    {language === 'en' && 'Coupon Code (Optional)'}
                    {language === 'af' && 'Koepon Kode (Opsioneel)'}
                    {language === 'xh' && 'Ikhodi Ye-Coupon (Ekunxulumene)'}
                  </h2>

                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder={language === 'en' ? 'Enter coupon code' : language === 'af' ? 'Voer koeponkode in' : 'Faka ikhodi ye-coupon'}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </section>

                {/* Payment Method */}
                <section>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '24px'
                  }}>
                    {language === 'en' && 'Payment Method'}
                    {language === 'af' && 'Betalingsmetode'}
                    {language === 'xh' && 'Indlela Yokukhokela'}
                  </h2>

                  <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
                    <label style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '16px',
                      border: `2px solid ${paymentMethod === 'payfast' ? '#2d5016' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: paymentMethod === 'payfast' ? '#f0fdf4' : 'white',
                      transition: 'all 0.2s'
                    }}>
                      <input
                        type="radio"
                        value="payfast"
                        checked={paymentMethod === 'payfast'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'payfast')}
                      />
                      <div>
                        <p style={{ fontWeight: '600', margin: '0 0 4px 0' }}>
                          {language === 'en' ? 'PayFast' : language === 'af' ? 'PayFast' : 'PayFast'}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                          {language === 'en' ? 'Pay online with card' : language === 'af' ? 'Betaal aanlyn met kaart' : 'Khokelela online ngekhadi'}
                        </p>
                      </div>
                    </label>

                    <label style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '16px',
                      border: `2px solid ${paymentMethod === 'bank_transfer' ? '#2d5016' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: paymentMethod === 'bank_transfer' ? '#f0fdf4' : 'white',
                      transition: 'all 0.2s'
                    }}>
                      <input
                        type="radio"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'bank_transfer')}
                      />
                      <div>
                        <p style={{ fontWeight: '600', margin: '0 0 4px 0' }}>
                          {language === 'en' ? 'Bank Transfer' : language === 'af' ? 'Bankoordrag' : 'Uguqulo LweBanki'}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                          {language === 'en' ? 'Transfer to our bank account' : language === 'af' ? 'Oordrag na ons bankrekening' : 'Guqulela kwi-akhaunnti yethu yebhanki'}
                        </p>
                      </div>
                    </label>
                  </div>
                </section>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
