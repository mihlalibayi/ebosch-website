'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase-config';
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, X, Trash2, Lock } from 'lucide-react';

interface PublicityImage {
  id: string;
  imageUrl: string;
  createdBy: string;
  createdAt: any;
}

interface Props {
  user: any;
}

export default function PublicityManagement({ user }: Props) {
  const [images, setImages] = useState<PublicityImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const isAdmin = user?.email === 'members.ebosch@gmail.com';
  const canUpload = isAdmin || user?.email === 'school.ebosch@gmail.com';

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      // Sort by newest first
      const q = query(collection(db, 'publicityImages'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PublicityImage[];
      setImages(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading publicity images:', error);
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return;
    setUploading(true);

    try {
      const storageRef = ref(storage, `publicity/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'publicityImages'), {
        imageUrl,
        createdBy: user.uid,
        createdAt: new Date(),
      });

      resetForm();
      loadImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setImageFile(null);
    setImagePreview('');
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm('Delete this image?')) return;
    try {
      await deleteDoc(doc(db, 'publicityImages', id));
      loadImages();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading publicity images...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
          Publicity Images
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
          {isAdmin ? 'Manage media gallery images' : 'Upload new images (view only)'}
        </p>
      </div>

      {canUpload && !showForm && (
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => setShowForm(true)}
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
            <Plus size={18} /> Add New Image
          </button>
        </div>
      )}

      {showForm && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
            Upload New Image
          </h2>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                Image *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                required
                style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', width: '100%' }}
              />
              {imagePreview && (
                <div style={{ marginTop: '12px' }}>
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={resetForm} style={{ padding: '10px 20px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={uploading} style={{ padding: '10px 20px', backgroundColor: uploading ? '#9ca3af' : '#2d5016', color: 'white', border: 'none', borderRadius: '6px', cursor: uploading ? 'not-allowed' : 'pointer' }}>
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Images List - newest first */}
      {images.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#6b7280' }}>
          No images yet. Click "Add New Image" to get started.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {images.map((img) => (
            <div
              key={img.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <img
                src={img.imageUrl}
                alt=""
                style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
              />
              {isAdmin && (
                <button
                  onClick={() => handleDelete(img.id)}
                  title="Delete"
                  style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}
                >
                  <Trash2 size={18} />
                </button>
              )}
              {!isAdmin && canUpload && (
                <div style={{ display: 'flex', gap: '4px', color: '#6b7280', fontSize: '12px', alignItems: 'center' }}>
                  <Lock size={14} /> Read only
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}