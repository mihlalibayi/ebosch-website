'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase-config';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, X, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

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
  urlLink?: string;
  couponEligible: boolean;
  isFreeEvent: boolean;
  payWhatYouWant: boolean;
  minimumAmount?: number;
  isMembership?: boolean;
  membershipType?: 'individual' | 'business' | 'social_impact'; // added social_impact
  createdAt?: any;
}

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [rootCategories, setRootCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [subSubcategories, setSubSubcategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'products' | 'memberships'>('products');
  const [businessesList, setBusinessesList] = useState<any[]>([]);
  const [selectedBusinessBankDetails, setSelectedBusinessBankDetails] = useState<any>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    type: 'item' as 'ticket' | 'item',
    rootCategory: '',
    subcategory: '',
    subSubcategory: '',
    stock: 10,
    outOfStock: false,
    deliveryType: 'pickup' as 'pickup' | 'delivery' | 'digital' | 'instant',
    deliveryFee: 0,
    date: '',
    time: '',
    venue: '',
    urlLink: '',
    couponEligible: false,
    isFreeEvent: false,
    payWhatYouWant: false,
    minimumAmount: 0,
    isMembership: false,
    membershipType: '' as 'individual' | 'business' | 'social_impact' | '' // updated
  });

  useEffect(() => {
    loadCategories();
    loadProducts();
    loadBusinesses();
  }, []);

  const loadCategories = async () => {
    try {
      const snap = await getDocs(collection(db, 'categories'));
      const roots: any[] = [];
      snap.docs.forEach(doc => {
        const data = doc.data();
        if (data.name !== 'SERVICES') {
          roots.push({
            id: doc.id,
            name: data.name,
            subcategories: data.subcategories || []
          });
        }
      });
      setRootCategories(roots);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadBusinesses = async () => {
    try {
      const snap = await getDocs(collection(db, 'businesses'));
      const data = snap.docs.map(d => ({ 
        id: d.id, 
        name: d.data().name, 
        bankAccount: d.data().bankAccount, 
        bankName: d.data().bankName, 
        bankAccountHolder: d.data().bankAccountHolder, 
        payfastMerchantId: d.data().payfastMerchantId, 
        paymentMethod: d.data().paymentMethod, 
        subcategory: d.data().subcategory || '', 
        rootCategory: d.data().rootCategory || '' 
      }));
      setBusinessesList(data);
    } catch (e) {}
  };

  const handleRootCategoryChange = (rootId: string) => {
    setForm({ ...form, rootCategory: rootId, subcategory: '', subSubcategory: '' });
    const root = rootCategories.find(r => r.id === rootId);
    setSubcategories(root?.subcategories || []);
    setSubSubcategories([]);
  };

  const handleSubcategoryChange = (subId: string) => {
    setForm(f => ({ ...f, subcategory: subId, subSubcategory: '' }));
    const root = rootCategories.find(r => r.id === form.rootCategory);
    const sub = root?.subcategories.find((s: any) => s.id === subId);
    setSubSubcategories(sub?.subSubcategories || []);
    setSelectedBusinessBankDetails(null);
  };

  const handleSubSubcategoryChange = (subSubId: string) => {
    setForm(f => ({ ...f, subSubcategory: subSubId }));
    // Look for a matching business and load its bank details
    const matched = businessesList.find(b => b.id === subSubId || b.name === subSubId || b.subcategory === subSubId);
    if (matched) {
      setSelectedBusinessBankDetails({
        businessName: matched.name,
        paymentMethod: matched.paymentMethod,
        bankAccount: matched.bankAccount,
        bankName: matched.bankName,
        bankAccountHolder: matched.bankAccountHolder,
        payfastMerchantId: matched.payfastMerchantId,
      });
    } else {
      setSelectedBusinessBankDetails(null);
    }
  };

  const loadProducts = async () => {
    try {
      const snap = await getDocs(collection(db, 'products'));
      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() || new Date()
      })) as Product[];
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = imagePreview;

      if (imageFile) {
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const saveData = {
        ...form,
        imageUrl,
        price: form.isFreeEvent ? 0 : form.price,
        isMembership: activeTab === 'memberships',
        createdAt: new Date()
      };

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), saveData);
      } else {
        await addDoc(collection(db, 'products'), saveData);
      }

      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: 0,
      type: 'item',
      rootCategory: '',
      subcategory: '',
      subSubcategory: '',
      stock: 10,
      outOfStock: false,
      deliveryType: 'pickup',
      deliveryFee: 0,
      date: '',
      time: '',
      venue: '',
      urlLink: '',
      couponEligible: false,
      isFreeEvent: false,
      payWhatYouWant: false,
      minimumAmount: 0,
      isMembership: false,
      membershipType: ''
    });
    setImageFile(null);
    setImagePreview('');
    setShowForm(false);
    setEditingId(null);
    setSubcategories([]);
    setSubSubcategories([]);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      }
    }
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      type: product.type,
      rootCategory: product.rootCategory,
      subcategory: product.subcategory,
      subSubcategory: product.subSubcategory || '',
      stock: product.stock,
      outOfStock: product.outOfStock,
      deliveryType: product.deliveryType,
      deliveryFee: product.deliveryFee || 0,
      date: product.date || '',
      time: product.time || '',
      venue: product.venue || '',
      urlLink: product.urlLink || '',
      couponEligible: product.couponEligible || false,
      isFreeEvent: product.isFreeEvent || false,
      payWhatYouWant: product.payWhatYouWant || false,
      minimumAmount: product.minimumAmount || 0,
      isMembership: product.isMembership || false,
      membershipType: product.membershipType || ''
    });

    if (product.imageUrl) {
      setImagePreview(product.imageUrl);
    }

    setEditingId(product.id);
    setShowForm(true);

    if (product.rootCategory) {
      const root = rootCategories.find(r => r.id === product.rootCategory);
      setSubcategories(root?.subcategories || []);
      if (product.subcategory) {
        const sub = root?.subcategories.find((s: any) => s.id === product.subcategory);
        setSubSubcategories(sub?.subSubcategories || []);
      }
    }

    if (product.isMembership) {
      setActiveTab('memberships');
    } else {
      setActiveTab('products');
    }
  };

  const filteredProducts = products.filter(p => {
    if (activeTab === 'memberships') {
      return p.isMembership === true;
    } else {
      return p.isMembership !== true;
    }
  });

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
          Products & Memberships
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
          Manage store products and annual memberships
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '0'
      }}>
        <button
          onClick={() => {
            setActiveTab('products');
            resetForm();
          }}
          style={{
            padding: '12px 24px',
            backgroundColor: activeTab === 'products' ? '#2d5016' : 'transparent',
            color: activeTab === 'products' ? 'white' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'products' ? '3px solid #2d5016' : 'none',
            cursor: 'pointer',
            fontWeight: 'normal',
            fontSize: '15px',
            transition: 'all 0.2s',
            marginBottom: '-2px'
          }}
        >
          📦 Regular Products
        </button>
        <button
          onClick={() => {
            setActiveTab('memberships');
            resetForm();
          }}
          style={{
            padding: '12px 24px',
            backgroundColor: activeTab === 'memberships' ? '#2d5016' : 'transparent',
            color: activeTab === 'memberships' ? 'white' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'memberships' ? '3px solid #2d5016' : 'none',
            cursor: 'pointer',
            fontWeight: 'normal',
            fontSize: '15px',
            transition: 'all 0.2s',
            marginBottom: '-2px'
          }}
        >
          🎁 Annual Memberships
        </button>
      </div>

      {/* Add Button */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
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
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#2d5016';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Plus size={18} />
          Add {activeTab === 'memberships' ? 'Membership' : 'Product'}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
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
            maxWidth: '700px',
            width: '100%',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={resetForm}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '8px'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
            >
              <X size={24} />
            </button>

            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '24px',
              marginTop: '0'
            }}>
              {editingId ? 'Edit' : 'Add'} {activeTab === 'memberships' ? 'Membership' : 'Product'}
            </h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'normal', color: '#111827', fontSize: '14px' }}>
                  {activeTab === 'memberships' ? 'Membership Name' : 'Product Name'} *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={activeTab === 'memberships' ? 'e.g., Individual Annual Membership' : 'e.g., Product Name'}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'normal', color: '#111827', fontSize: '14px' }}>
                  Description {activeTab === 'memberships' && form.membershipType === 'social_impact' ? '' : '*'}
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={activeTab === 'memberships' ? 'Describe the membership...' : 'Describe the product...'}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    minHeight: '100px',
                    fontFamily: 'Arial, sans-serif',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                  required={!(activeTab === 'memberships' && form.membershipType === 'social_impact')}
                />
              </div>

              {/* Price */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'normal', color: '#111827', fontSize: '14px' }}>
                  Price (R) *
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  required={!activeTab || activeTab === 'memberships'}
                />
              </div>

              {/* Membership Type - Only for Memberships */}
              {activeTab === 'memberships' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'normal', color: '#111827', fontSize: '14px' }}>
                    Membership Type *
                  </label>
                  <select
                    value={form.membershipType}
                    onChange={(e) => setForm({ ...form, membershipType: e.target.value as 'individual' | 'business' | 'social_impact' })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    required
                  >
                    <option value="">Select membership type</option>
                    <option value="individual">Individual Annual</option>
                    <option value="business">Business Annual</option>
                    <option value="social_impact">Social Impact Investor Annual</option>
                  </select>
                </div>
              )}

              {/* Social Impact Investor Type Selection */}
              {activeTab === 'memberships' && form.membershipType === 'social_impact' && (
                <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                  <p style={{ margin: '0', fontSize: '14px', color: '#065f46', fontWeight: 'normal' }}>
                    Customer will provide investor type and details in store checkout form
                  </p>
                </div>
              )}

              {/* Category - Only for Regular Products */}
              {activeTab !== 'memberships' && (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'normal', color: '#111827', fontSize: '14px' }}>
                      Root Category *
                    </label>
                    <select
                      value={form.rootCategory}
                      onChange={(e) => handleRootCategoryChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      required
                    >
                      <option value="">Select category</option>
                      {rootCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {subcategories.length > 0 && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'normal', color: '#111827', fontSize: '14px' }}>
                        Subcategory *
                      </label>
                      <select
                        value={form.subcategory}
                        onChange={(e) => handleSubcategoryChange(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                        required
                      >
                        <option value="">Select subcategory</option>
                        {subcategories.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {subSubcategories.length > 0 && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'normal', color: '#111827', fontSize: '14px' }}>
                        Business (Sub-Subcategory)
                      </label>
                      <select
                        value={form.subSubcategory}
                        onChange={(e) => handleSubSubcategoryChange(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="">Select business (optional)</option>
                        {subSubcategories.map((sub: any) => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedBusinessBankDetails && (
                    <div style={{ backgroundColor: '#f0fdf4', borderRadius: '8px', padding: '16px', border: '1px solid #d1fae5' }}>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#2d5016', margin: '0 0 8px 0' }}>
                        Payment details auto-loaded from: {selectedBusinessBankDetails.businessName}
                      </p>
                      {selectedBusinessBankDetails.paymentMethod === 'bank' ? (
                        <div style={{ fontSize: '13px', color: '#374151', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span>Bank: {selectedBusinessBankDetails.bankName}</span>
                          <span>Account Holder: {selectedBusinessBankDetails.bankAccountHolder}</span>
                          <span>Account Number: {selectedBusinessBankDetails.bankAccount}</span>
                        </div>
                      ) : (
                        <div style={{ fontSize: '13px', color: '#374151' }}>
                          <span>PayFast Merchant ID: {selectedBusinessBankDetails.payfastMerchantId}</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Type - Only for Regular Products */}
              {activeTab !== 'memberships' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'normal', color: '#111827', fontSize: '14px' }}>
                    Type *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as 'ticket' | 'item' })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    required
                  >
                    <option value="item">Item</option>
                    <option value="ticket">Ticket</option>
                  </select>
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'normal', color: '#111827', fontSize: '14px' }}>
                  Image
                </label>
                <div style={{
                  border: '2px dashed #e5e7eb',
                  borderRadius: '8px',
                  padding: '24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2d5016')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                    id="imageInput"
                  />
                  <label htmlFor="imageInput" style={{ cursor: 'pointer' }}>
                    {imagePreview ? (
                      <div>
                        <img src={imagePreview} alt="Preview" style={{ maxHeight: '100px', marginBottom: '8px', borderRadius: '6px' }} />
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>Click to change</p>
                      </div>
                    ) : (
                      <div>
                        <ImageIcon size={32} style={{ margin: '0 auto 8px', color: '#9ca3af' }} />
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>Click to upload image</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'normal',
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
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
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
                  {editingId ? 'Update' : 'Add'} {activeTab === 'memberships' ? 'Membership' : 'Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products List - Card View */}
      {filteredProducts.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '60px 24px',
          textAlign: 'center',
          color: '#6b7280',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <p style={{ fontSize: '16px', margin: '0' }}>
            No {activeTab === 'memberships' ? 'memberships' : 'products'} yet. Click "Add {activeTab === 'memberships' ? 'Membership' : 'Product'}" to get started.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {filteredProducts.map(product => (
            <div
              key={product.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.2s',
                cursor: 'pointer',
                border: '1px solid #e5e7eb'
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
              {/* Image */}
              <div style={{
                width: '100%',
                height: '180px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                marginBottom: '16px',
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
                  <div style={{ fontSize: '40px' }}>
                    {activeTab === 'memberships' ? '🎁' : '📦'}
                  </div>
                )}
              </div>

              {/* Content */}
              <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 8px 0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {product.name}
              </h3>

              <p style={{
                fontSize: '13px',
                color: '#6b7280',
                margin: '0 0 12px 0',
                lineHeight: '1.4',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {product.description}
              </p>

              {/* Price & Type */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                paddingBottom: '16px',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#2d5016'
                }}>
                  R{product.price.toFixed(2)}
                </span>
                {activeTab === 'memberships' ? (
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    backgroundColor: product.membershipType === 'individual' ? '#dbeafe' : product.membershipType === 'business' ? '#fef3c7' : '#f0fdf4',
                    color: product.membershipType === 'individual' ? '#0369a1' : product.membershipType === 'business' ? '#92400e' : '#065f46',
                    fontSize: '12px',
                    fontWeight: 'normal',
                    borderRadius: '4px'
                  }}>
                    {product.membershipType === 'individual' ? 'Individual' : product.membershipType === 'business' ? 'Business' : 'Social Impact'}
                  </span>
                ) : (
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    backgroundColor: product.type === 'ticket' ? '#dbeafe' : '#fef3c7',
                    color: product.type === 'ticket' ? '#0369a1' : '#92400e',
                    fontSize: '12px',
                    fontWeight: 'normal',
                    borderRadius: '4px'
                  }}>
                    {product.type === 'ticket' ? 'Ticket' : 'Item'}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleEdit(product)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    backgroundColor: '#f0fdf4',
                    color: '#2d5016',
                    border: '1px solid #d1fae5',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 'normal',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#dcfce7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0fdf4';
                  }}
                >
                  <Edit2 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 'normal',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fee2e2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fef2f2';
                  }}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}