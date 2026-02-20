'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase-config';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, X, Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface Partner {
  id: string;
  imageUrl: string;
  altText: string;
  order: number;
  createdAt: any;
}

interface Props {
  user: any;
}

export default function PartnersManagement({ user }: Props) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);

  // Image upload state – single file
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // For reordering existing partners (admin only)
  const isAdmin = user?.email === 'members.ebosch@gmail.com';

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'partners'));
      let data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Partner[];
      data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setPartners(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading partners:', error);
      setLoading(false);
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
    if (!isAdmin) return;
    if (!imageFile && !editingId) {
      alert('Please select an image.');
      return;
    }
    setUploading(true);

    try {
      let imageUrl = '';
      if (imageFile) {
        const storageRef = ref(storage, `partners/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      if (editingId) {
        const updateData: any = { altText };
        if (imageUrl) {
          updateData.imageUrl = imageUrl;
        }
        await updateDoc(doc(db, 'partners', editingId), updateData);
      } else {
        const maxOrder = partners.reduce((max, p) => Math.max(max, p.order || 0), 0);
        await addDoc(collection(db, 'partners'), {
          imageUrl,
          altText,
          order: maxOrder + 1,
          createdAt: new Date(),
        });
      }

      resetForm();
      loadPartners();
    } catch (error) {
      console.error('Error saving partner:', error);
      alert('Error saving partner');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setImageFile(null);
    setImagePreview('');
    setAltText('');
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (partner: Partner) => {
    setAltText(partner.altText);
    setImagePreview(partner.imageUrl);
    setEditingId(partner.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm('Delete this partner logo?')) return;
    try {
      await deleteDoc(doc(db, 'partners', id));
      loadPartners();
    } catch (error) {
      console.error('Error deleting partner:', error);
    }
  };

  const movePartner = async (index: number, direction: 'up' | 'down') => {
    if (!isAdmin) return;
    const newPartners = [...partners];
    if (direction === 'up' && index > 0) {
      [newPartners[index - 1], newPartners[index]] = [newPartners[index], newPartners[index - 1]];
    } else if (direction === 'down' && index < newPartners.length - 1) {
      [newPartners[index + 1], newPartners[index]] = [newPartners[index], newPartners[index + 1]];
    } else {
      return;
    }
    const batch = writeBatch(db);
    newPartners.forEach((p, idx) => {
      batch.update(doc(db, 'partners', p.id), { order: idx + 1 });
    });
    await batch.commit();
    setPartners(newPartners);
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading partners...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
          Partners Management
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
          Upload and reorder partner logos
        </p>
      </div>

      {isAdmin && !showForm && (
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
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
          >
            <Plus size={18} /> Add New Partner Logo
          </button>
        </div>
      )}

      {showForm && isAdmin && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
            {editingId ? 'Edit Partner' : 'Add New Partner'}
          </h2>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                Image *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', width: '100%' }}
              />
              {imagePreview && (
                <div style={{ marginTop: '12px' }}>
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                Alt Text (description) *
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="e.g., Stellenbosch Municipality"
                required
                style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={resetForm} style={{ padding: '10px 20px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={uploading} style={{ padding: '10px 20px', backgroundColor: uploading ? '#9ca3af' : '#2d5016', color: 'white', border: 'none', borderRadius: '6px', cursor: uploading ? 'not-allowed' : 'pointer' }}>
                {uploading ? 'Uploading...' : (editingId ? 'Update' : 'Add')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Partners List */}
      {partners.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#6b7280' }}>
          No partners yet. Click "Add New Partner Logo" to get started.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {partners.map((partner, idx) => (
            <div
              key={partner.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <img
                src={partner.imageUrl}
                alt={partner.altText}
                style={{ maxWidth: '100%', maxHeight: '80px', objectFit: 'contain' }}
              />
              <p style={{ fontSize: '12px', color: '#374151', textAlign: 'center', margin: 0 }}>{partner.altText}</p>
              {isAdmin && (
                <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center' }}>
                  <button
                    onClick={() => movePartner(idx, 'up')}
                    disabled={idx === 0}
                    title="Move up"
                    style={{ padding: '4px', background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', color: idx === 0 ? '#9ca3af' : '#2d5016' }}
                  >
                    <ArrowUp size={18} />
                  </button>
                  <button
                    onClick={() => movePartner(idx, 'down')}
                    disabled={idx === partners.length - 1}
                    title="Move down"
                    style={{ padding: '4px', background: 'none', border: 'none', cursor: idx === partners.length - 1 ? 'not-allowed' : 'pointer', color: idx === partners.length - 1 ? '#9ca3af' : '#2d5016' }}
                  >
                    <ArrowDown size={18} />
                  </button>
                  <button
                    onClick={() => handleEdit(partner)}
                    title="Edit alt text"
                    style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(partner.id)}
                    title="Delete"
                    style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}