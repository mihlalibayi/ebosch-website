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
    minimumAmount: 0
  });

  useEffect(() => {
    loadCategories();
    loadProducts();
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

  const handleRootCategoryChange = (rootId: string) => {
    setForm({ ...form, rootCategory: rootId, subcategory: '', subSubcategory: '' });
    const root = rootCategories.find(r => r.id === rootId);
    setSubcategories(root?.subcategories || []);
    setSubSubcategories([]);
  };

  const handleSubcategoryChange = (subId: string) => {
    setForm({ ...form, subcategory: subId, subSubcategory: '' });
    const root = rootCategories.find(r => r.id === form.rootCategory);
    const sub = root?.subcategories.find((s: any) => s.id === subId);
    setSubSubcategories(sub?.subSubcategories || []);
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
      minimumAmount: 0
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
      couponEligible: product.couponEligible,
      isFreeEvent: product.isFreeEvent,
      payWhatYouWant: product.payWhatYouWant,
      minimumAmount: product.minimumAmount || 0
    });
    const root = rootCategories.find(r => r.id === product.rootCategory);
    setSubcategories(root?.subcategories || []);
    const sub = root?.subcategories.find((s: any) => s.id === product.subcategory);
    setSubSubcategories(sub?.subSubcategories || []);
    setImagePreview(product.imageUrl || '');
    setEditingId(product.id);
    setShowForm(true);
  };

  const isLocalOrCommunity = form.rootCategory === 'local_businesses' || form.rootCategory === 'community_businesses';

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
          Products Management
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
          Create and manage products, tickets, and events
        </p>
      </div>

      {!showForm && (
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          style={{
            padding: '10px 18px',
            backgroundColor: '#2d5016',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'normal',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px',
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
          Add Product
        </button>
      )}

      {showForm && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: '0' }}>
              {editingId ? 'Edit Product' : 'Add Product'}
            </h3>
            <button
              onClick={() => resetForm()}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '4px'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Basic Info */}
            <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                Basic Information
              </h4>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    minHeight: '80px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Type *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as 'ticket' | 'item' })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="item">Item (Physical Product)</option>
                    <option value="ticket">Ticket (Event/Training)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Root Category *
                  </label>
                  <select
                    value={form.rootCategory}
                    onChange={(e) => handleRootCategoryChange(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Select Root Category</option>
                    {rootCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {form.rootCategory && (
                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Subcategory *
                  </label>
                  <select
                    value={form.subcategory}
                    onChange={(e) => handleSubcategoryChange(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Select Subcategory</option>
                    {subcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {isLocalOrCommunity && form.subcategory && (
                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Business Name *
                  </label>
                  <select
                    value={form.subSubcategory}
                    onChange={(e) => setForm({ ...form, subSubcategory: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Select Business</option>
                    {subSubcategories.map((subSub) => (
                      <option key={subSub.id} value={subSub.id}>{subSub.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                Pricing
              </h4>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '12px' }}>
                  <input
                    type="checkbox"
                    checked={form.isFreeEvent}
                    onChange={(e) => setForm({ ...form, isFreeEvent: e.target.checked, price: 0 })}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', color: '#374151' }}>Free Event</span>
                </label>
              </div>

              {!form.isFreeEvent && (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Price (R)
                    </label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={form.payWhatYouWant}
                        onChange={(e) => setForm({ ...form, payWhatYouWant: e.target.checked })}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px', color: '#374151' }}>Pay What You Want</span>
                    </label>
                  </div>

                  {form.payWhatYouWant && (
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                        Minimum Amount (R)
                      </label>
                      <input
                        type="number"
                        value={form.minimumAmount}
                        onChange={(e) => setForm({ ...form, minimumAmount: parseFloat(e.target.value) })}
                        step="0.01"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  )}
                </>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.couponEligible}
                    onChange={(e) => setForm({ ...form, couponEligible: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', color: '#374151' }}>Coupon Eligible</span>
                </label>
              </div>
            </div>

            {/* Stock & Delivery */}
            <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                Stock & Delivery
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', paddingTop: '30px' }}>
                    <input
                      type="checkbox"
                      checked={form.outOfStock}
                      onChange={(e) => setForm({ ...form, outOfStock: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px', color: '#374151' }}>Out of Stock</span>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Delivery Type
                </label>
                <select
                  value={form.deliveryType}
                  onChange={(e) => setForm({ ...form, deliveryType: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="pickup">Pickup (Customer fetches)</option>
                  <option value="delivery">Delivery (Paid delivery fee)</option>
                  <option value="digital">Digital (Download/Email)</option>
                  <option value="instant">Instant (Immediate access)</option>
                </select>
              </div>

              {form.deliveryType === 'delivery' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Delivery Fee (R)
                  </label>
                  <input
                    type="number"
                    value={form.deliveryFee}
                    onChange={(e) => setForm({ ...form, deliveryFee: parseFloat(e.target.value) })}
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Ticket Fields */}
            {form.type === 'ticket' && (
              <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                  Event Details
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Time
                    </label>
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Venue (In-Person)
                  </label>
                  <input
                    type="text"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    placeholder="Location address"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    URL Link (Online)
                  </label>
                  <input
                    type="url"
                    value={form.urlLink}
                    onChange={(e) => setForm({ ...form, urlLink: e.target.value })}
                    placeholder="https://..."
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Image Upload */}
            <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                Product Image
              </h4>

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
                      <img src={imagePreview} alt="Preview" style={{ maxHeight: '100px', marginBottom: '8px' }} />
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon size={32} style={{ margin: '0 auto 8px', color: '#9ca3af' }} />
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>Click to upload</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px 20px',
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
              {editingId ? 'Update Product' : 'Add Product'}
            </button>
          </form>
        </div>
      )}

      {/* Products List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        {products.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#6b7280' }}>
            No products yet. Click "Add Product" to get started.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Name</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Type</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Category</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Price</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Stock</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, idx) => {
                  const rootCat = rootCategories.find(r => r.id === product.rootCategory);
                  const subCat = rootCat?.subcategories.find((s: any) => s.id === product.subcategory);
                  const subSubCat = subCat?.subSubcategories?.find((ss: any) => ss.id === product.subSubcategory);
                  
                  let categoryDisplay = `${rootCat?.name} > ${subCat?.name}`;
                  if (subSubCat) {
                    categoryDisplay += ` > ${subSubCat.name}`;
                  }

                  return (
                    <tr
                      key={product.id}
                      style={{
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f9fafb')}
                    >
                      <td style={{ padding: '16px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                        {product.name}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          backgroundColor: product.type === 'ticket' ? '#dbeafe' : '#fef3c7',
                          color: product.type === 'ticket' ? '#0369a1' : '#92400e',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}>
                          {product.type === 'ticket' ? 'Ticket' : 'Item'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '12px', color: '#374151' }}>
                        {categoryDisplay}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                        {product.isFreeEvent ? 'FREE' : `R${product.price.toFixed(2)}`}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          backgroundColor: product.outOfStock ? '#fee2e2' : '#dcfce7',
                          color: product.outOfStock ? '#991b1b' : '#166534',
                          fontSize: '13px'
                        }}>
                          {product.outOfStock ? 'Out' : product.stock}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleEdit(product)}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#f0fdf4',
                              color: '#2d5016',
                              border: '1px solid #d1fae5',
                              borderRadius: '6px',
                              fontSize: '13px',
                              cursor: 'pointer',
                              fontWeight: 'normal',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#dcfce7';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#f0fdf4';
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#fef2f2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              fontSize: '13px',
                              cursor: 'pointer',
                              fontWeight: 'normal',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fee2e2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#fef2f2';
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}