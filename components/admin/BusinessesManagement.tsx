'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase-config';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Plus, X, Edit2, Trash2, Upload, FileText, Download } from 'lucide-react';

interface BusinessFile {
  name: string;
  url: string;
  uploadedAt: any;
}

interface Business {
  id: string;
  name: string;
  description: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  address: string;
  website: string;
  logoUrl?: string;
  taxNumber?: string;
  payfastMerchantId?: string;
  bankAccount?: string;
  bankName?: string;
  bankAccountHolder?: string;
  paymentMethod: 'payfast' | 'bank';
  status: 'active' | 'inactive';
  rootCategory: string;
  subcategory?: string;
  files: BusinessFile[];
  createdAt?: any;
}

export default function BusinessesManagement() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [rootCategories, setRootCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadingFileNames, setUploadingFileNames] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: '',
    description: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    taxNumber: '',
    payfastMerchantId: '',
    bankAccount: '',
    bankName: '',
    bankAccountHolder: '',
    paymentMethod: 'payfast' as 'payfast' | 'bank',
    status: 'active' as 'active' | 'inactive',
    rootCategory: '',
    subcategory: ''
  });

  useEffect(() => {
    loadBusinesses();
    loadCategories();
  }, []);

  const loadBusinesses = async () => {
    try {
      const snap = await getDocs(collection(db, 'businesses'));
      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() || new Date()
      })) as Business[];
      setBusinesses(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error loading businesses:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const snap = await getDocs(collection(db, 'categories'));
      const roots: any[] = [];
      snap.docs.forEach(d => {
        const data = d.data();
        if (data.name === 'LOCAL BUSINESSES' || data.name === 'COMMUNITY BUSINESSES') {
          roots.push({ id: d.id, name: data.name, subcategories: data.subcategories || [] });
        }
      });
      setRootCategories(roots);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleRootCategoryChange = (rootId: string) => {
    setForm(f => ({ ...f, rootCategory: rootId, subcategory: '' }));
    const root = rootCategories.find(r => r.id === rootId);
    setSubcategories(root?.subcategories || []);
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const totalFiles = uploadingFiles.length + newFiles.length;
      
      if (totalFiles > 5) {
        alert('Maximum 5 files allowed');
        return;
      }

      setUploadingFiles([...uploadingFiles, ...newFiles]);
      setUploadingFileNames([...uploadingFileNames, ...newFiles.map(f => f.name)]);
    }
  };

  const removeUploadingFile = (index: number) => {
    setUploadingFiles(uploadingFiles.filter((_, i) => i !== index));
    setUploadingFileNames(uploadingFileNames.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.paymentMethod === 'payfast' && !form.payfastMerchantId) {
      alert('Please enter PayFast Merchant ID');
      return;
    }
    if (form.paymentMethod === 'bank' && !form.bankAccount) {
      alert('Please enter Bank Account');
      return;
    }

    try {
      let logoUrl = logoPreview;

      if (logoFile) {
        const storageRef = ref(storage, `business-logos/${Date.now()}_${logoFile.name}`);
        await uploadBytes(storageRef, logoFile);
        logoUrl = await getDownloadURL(storageRef);
      }

      const fileUploadPromises = uploadingFiles.map(async (file) => {
        const storageRef = ref(storage, `business-files/${form.rootCategory}/${form.name}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        return {
          name: file.name,
          url,
          uploadedAt: new Date()
        };
      });

      const newFiles = await Promise.all(fileUploadPromises);

      const saveData = {
        ...form,
        logoUrl,
        files: editingId
          ? businesses.find(b => b.id === editingId)?.files || []
          : [],
        createdAt: new Date()
      };

      if (editingId) {
        const existing = businesses.find(b => b.id === editingId);
        saveData.files = [...(existing?.files || []), ...newFiles];
      } else {
        saveData.files = newFiles;
      }

      let businessId = editingId;

      if (editingId) {
        await updateDoc(doc(db, 'businesses', editingId), saveData);
      } else {
        const newDoc = await addDoc(collection(db, 'businesses'), saveData);
        businessId = newDoc.id;
      }

      // Sync business as sub-subcategory inside the categories document
      if (form.rootCategory && form.subcategory && businessId) {
        try {
          const catRef = doc(db, 'categories', form.rootCategory);
          const catSnap = await getDoc(catRef);
          if (catSnap.exists()) {
            const catData = catSnap.data();
            const updatedSubcategories = (catData.subcategories || []).map((sub: any) => {
              if (sub.id !== form.subcategory) return sub;
              const existingSubSubs: any[] = sub.subSubcategories || [];

              if (editingId) {
                // Update existing entry (name may have changed)
                const updated = existingSubSubs.map((ss: any) =>
                  ss.id === editingId ? { ...ss, id: businessId, name: form.name } : ss
                );
                // If not found, add it
                if (!updated.find((ss: any) => ss.id === businessId)) {
                  updated.push({ id: businessId, name: form.name });
                }
                return { ...sub, subSubcategories: updated };
              } else {
                // Add new entry, avoid duplicates
                const alreadyExists = existingSubSubs.find((ss: any) => ss.id === businessId);
                if (!alreadyExists) {
                  return { ...sub, subSubcategories: [...existingSubSubs, { id: businessId, name: form.name }] };
                }
                return sub;
              }
            });
            await updateDoc(catRef, { subcategories: updatedSubcategories });
            await loadCategories(); // refresh subcategories list
          }
        } catch (catError) {
          console.error('Error syncing to categories:', catError);
        }
      }

      resetForm();
      loadBusinesses();
    } catch (error) {
      console.error('Error saving business:', error);
      alert('Error saving business');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      ownerName: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      taxNumber: '',
      payfastMerchantId: '',
      bankAccount: '',
      bankName: '',
      bankAccountHolder: '',
      paymentMethod: 'payfast',
      status: 'active',
      rootCategory: '',
      subcategory: ''
    });
    setSubcategories([]);
    setLogoFile(null);
    setLogoPreview('');
    setUploadingFiles([]);
    setUploadingFileNames([]);
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this business?')) {
      try {
        const business = businesses.find(b => b.id === id);
        await deleteDoc(doc(db, 'businesses', id));

        // Remove from categories sub-subcategories
        if (business?.rootCategory && business?.subcategory) {
          try {
            const catRef = doc(db, 'categories', business.rootCategory);
            const catSnap = await getDoc(catRef);
            if (catSnap.exists()) {
              const catData = catSnap.data();
              const updatedSubcategories = (catData.subcategories || []).map((sub: any) => {
                if (sub.id !== business.subcategory) return sub;
                return {
                  ...sub,
                  subSubcategories: (sub.subSubcategories || []).filter((ss: any) => ss.id !== id)
                };
              });
              await updateDoc(catRef, { subcategories: updatedSubcategories });
            }
          } catch (catError) {
            console.error('Error removing from categories:', catError);
          }
        }

        loadBusinesses();
      } catch (error) {
        console.error('Error deleting business:', error);
        alert('Error deleting business');
      }
    }
  };

  const handleDeleteFile = async (businessId: string, fileUrl: string) => {
    try {
      const business = businesses.find(b => b.id === businessId);
      if (!business) return;

      const fileRef = ref(storage, fileUrl);
      await deleteObject(fileRef);

      const updatedFiles = business.files.filter(f => f.url !== fileUrl);
      await updateDoc(doc(db, 'businesses', businessId), { files: updatedFiles });

      loadBusinesses();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };

  const handleEdit = (business: Business) => {
    setForm({
      name: business.name,
      description: business.description,
      ownerName: business.ownerName || '',
      email: business.email || '',
      phone: business.phone || '',
      address: business.address,
      website: business.website,
      taxNumber: business.taxNumber || '',
      payfastMerchantId: business.payfastMerchantId || '',
      bankAccount: business.bankAccount || '',
      bankName: business.bankName || '',
      bankAccountHolder: business.bankAccountHolder || '',
      paymentMethod: business.paymentMethod,
      status: business.status,
      rootCategory: business.rootCategory,
      subcategory: business.subcategory || ''
    });
    // restore subcategories list for editing
    // will be populated after rootCategories loads - handled in useEffect below
    setLogoPreview(business.logoUrl || '');
    setEditingId(business.id);
    setShowForm(true);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
          Businesses Management
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
          Add and manage local and community businesses
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
          Add Business
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
              {editingId ? 'Edit Business' : 'Add Business'}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Business Name *
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

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Category *
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
                    <option value="">Select Category</option>
                    {rootCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {subcategories.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Subcategory *
                  </label>
                  <select
                    value={form.subcategory}
                    onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
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
                    {subcategories.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              )}

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
                    minHeight: '100px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={form.ownerName}
                    onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
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
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact & Location */}
            <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                Contact & Location
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                  Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
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
                  Website
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
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

            {/* Financial & Legal */}
            <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                Financial & Legal Information
              </h4>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Tax/Registration Number
                </label>
                <input
                  type="text"
                  value={form.taxNumber}
                  onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
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
                  Payment Method *
                </label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="payfast">PayFast</option>
                  <option value="bank">Bank Account</option>
                </select>
              </div>

              {form.paymentMethod === 'payfast' && (
                <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                  <h5 style={{ fontSize: '13px', fontWeight: '600', color: '#2d5016', margin: '0 0 12px 0' }}>
                    PayFast Information
                  </h5>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      PayFast Merchant ID *
                    </label>
                    <input
                      type="text"
                      value={form.payfastMerchantId}
                      onChange={(e) => setForm({ ...form, payfastMerchantId: e.target.value })}
                      placeholder="Your PayFast Merchant ID"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0 0' }}>
                      Payments will be processed through PayFast to your linked bank account
                    </p>
                  </div>
                </div>
              )}

              {form.paymentMethod === 'bank' && (
                <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <h5 style={{ fontSize: '13px', fontWeight: '600', color: '#0369a1', margin: '0 0 12px 0' }}>
                    Bank Account Information
                  </h5>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      value={form.bankName}
                      onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                      placeholder="e.g., FNB, ABSA, Capitec"
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

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      value={form.bankAccountHolder}
                      onChange={(e) => setForm({ ...form, bankAccountHolder: e.target.value })}
                      placeholder="Name on bank account"
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
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={form.bankAccount}
                      onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                      placeholder="Account number"
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
            </div>

            {/* Logo Upload */}
            <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                Business Logo
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
                  onChange={handleLogoSelect}
                  style={{ display: 'none' }}
                  id="logoInput"
                />
                <label htmlFor="logoInput" style={{ cursor: 'pointer' }}>
                  {logoPreview ? (
                    <div>
                      <img src={logoPreview} alt="Logo" style={{ maxHeight: '100px', marginBottom: '8px' }} />
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>Click to change logo</p>
                    </div>
                  ) : (
                    <div>
                      <Upload size={32} style={{ margin: '0 auto 8px', color: '#9ca3af' }} />
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>Click to upload logo</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* File Uploads */}
            <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                Business Files (Catalogues, Brochures, etc.) - Max 5 files
              </h4>

              <div style={{
                border: '2px dashed #e5e7eb',
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: '16px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2d5016')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
              >
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="filesInput"
                  disabled={uploadingFiles.length >= 5}
                />
                <label htmlFor="filesInput" style={{ cursor: uploadingFiles.length >= 5 ? 'not-allowed' : 'pointer', opacity: uploadingFiles.length >= 5 ? 0.5 : 1 }}>
                  <FileText size={32} style={{ margin: '0 auto 8px', color: '#9ca3af' }} />
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                    Click to upload files ({uploadingFiles.length}/5)
                  </p>
                </label>
              </div>

              {uploadingFileNames.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h5 style={{ fontSize: '13px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                    Files to Upload:
                  </h5>
                  {uploadingFileNames.map((name, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '6px',
                        marginBottom: '8px',
                        fontSize: '14px',
                        color: '#374151'
                      }}
                    >
                      <span>{name}</span>
                      <button
                        type="button"
                        onClick={() => removeUploadingFile(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
              {editingId ? 'Update Business' : 'Add Business'}
            </button>
          </form>
        </div>
      )}

      {/* Businesses List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        {businesses.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#6b7280' }}>
            No businesses yet. Click "Add Business" to get started.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Name</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Category</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Contact</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Payment</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((business, idx) => (
                  <tr
                    key={business.id}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f9fafb')}
                  >
                    <td style={{ padding: '16px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                      {business.name}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                      {(() => { const root = business.rootCategory === 'local_businesses' ? 'Local' : 'Community'; const sub = business.subcategory ? ` · ${business.subcategory}` : ''; return root + sub; })()}
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#6b7280' }}>
                      {business.email || 'N/A'}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        backgroundColor: business.status === 'active' ? '#dcfce7' : '#fee2e2',
                        color: business.status === 'active' ? '#166534' : '#991b1b',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        {business.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#6b7280' }}>
                      {business.paymentMethod === 'payfast' ? 'PayFast' : 'Bank Account'}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleEdit(business)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#f0fdf4',
                            color: '#2d5016',
                            border: '1px solid #d1fae5',
                            borderRadius: '6px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            fontWeight: 'normal'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dcfce7')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f0fdf4')}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(business.id)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            fontWeight: 'normal'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}