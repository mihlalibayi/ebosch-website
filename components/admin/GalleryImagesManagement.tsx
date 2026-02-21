'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase-config';
import { collection, addDoc, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '@/lib/firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { Plus, X, Trash2, ArrowUp, ArrowDown, Lock, Image as ImageIcon, ArrowLeft } from 'lucide-react';

interface Folder {
  id: string;
  nameEn: string;
  nameAf: string;
  nameXh: string;
}

interface GalleryImage {
  id: string;
  folderId: string;
  imageUrl: string;
  order: number;
  uploadedBy: string;
  createdAt: any;
}

interface Props {
  user: any;
}

export default function GalleryImagesManagement({ user }: Props) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // For multiple file upload
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  const isAdmin = user?.email === 'members.ebosch@gmail.com';
  const canUpload = isAdmin || user?.email === 'office.ebosch@gmail.com';

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    if (selectedFolderId) {
      loadImages(selectedFolderId);
    } else {
      setImages([]);
    }
  }, [selectedFolderId]);

  // Clean up preview URLs
  useEffect(() => {
    return () => {
      filePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [filePreviews]);

  const loadFolders = async () => {
    try {
      const snap = await getDocs(collection(db, 'galleryFolders'));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Folder[];
      data.sort((a, b) => (a.nameEn || '').localeCompare(b.nameEn || ''));
      setFolders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading folders:', error);
      setLoading(false);
    }
  };

  const loadImages = async (folderId: string) => {
    try {
      const snap = await getDocs(collection(db, 'galleryImages'));
      let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GalleryImage[];
      data = data.filter(img => img.folderId === folderId);
      data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setImages(data);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setSelectedFiles(prev => [...prev, ...files]);
    setFilePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (index: number) => {
    URL.revokeObjectURL(filePreviews[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFolderId || selectedFiles.length === 0) return;
    setUploading(true);

    try {
      const maxOrder = images.reduce((max, img) => Math.max(max, img.order || 0), 0);

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const storageRef = ref(storage, `gallery/${selectedFolderId}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(storageRef);

        await addDoc(collection(db, 'galleryImages'), {
          folderId: selectedFolderId,
          imageUrl,
          order: maxOrder + i + 1,
          uploadedBy: user.uid,
          createdAt: new Date(),
        });
      }

      setSelectedFiles([]);
      setFilePreviews([]);
      loadImages(selectedFolderId);
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error uploading images');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm('Delete this image?')) return;
    try {
      await deleteDoc(doc(db, 'galleryImages', id));
      loadImages(selectedFolderId);
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const moveImage = async (index: number, direction: 'up' | 'down') => {
    if (!isAdmin) return;
    const newImages = [...images];
    if (direction === 'up' && index > 0) {
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    } else if (direction === 'down' && index < newImages.length - 1) {
      [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
    } else {
      return;
    }
    const batch = writeBatch(db);
    newImages.forEach((img, idx) => {
      batch.update(doc(db, 'galleryImages', img.id), { order: idx + 1 });
    });
    await batch.commit();
    setImages(newImages);
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading...</div>;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
          Gallery Images
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
          {isAdmin ? 'Manage images in folders' : 'Upload images to folders'}
        </p>
      </div>

      {/* Folder selector + Back button */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ maxWidth: '400px', flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
            Select Folder
          </label>
          <select
            value={selectedFolderId}
            onChange={(e) => setSelectedFolderId(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', width: '100%' }}
          >
            <option value="">-- Choose a folder --</option>
            {folders.map(f => (
              <option key={f.id} value={f.id}>{f.nameEn}</option>
            ))}
          </select>
        </div>
        {selectedFolderId && (
          <button
            onClick={() => setSelectedFolderId('')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#374151',
              fontSize: '14px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
          >
            <ArrowLeft size={16} /> Back to Folders
          </button>
        )}
      </div>

      {selectedFolderId && (
        <>
          {/* Upload form */}
          {canUpload && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Upload Images
              </h2>
              <form onSubmit={handleUpload}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  style={{ marginBottom: '16px', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', width: '100%' }}
                />

                {selectedFiles.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontWeight: '500', marginBottom: '8px' }}>{selectedFiles.length} image(s) selected:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} style={{ position: 'relative', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px', background: '#f9fafb' }}>
                          <img
                            src={filePreviews[idx]}
                            alt="preview"
                            style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <button
                            type="button"
                            onClick={() => removeSelectedFile(idx)}
                            style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <X size={14} />
                          </button>
                          <p style={{ fontSize: '10px', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="submit" disabled={uploading || selectedFiles.length === 0} style={{ padding: '10px 20px', backgroundColor: uploading ? '#9ca3af' : '#2d5016', color: 'white', border: 'none', borderRadius: '6px', cursor: uploading || selectedFiles.length === 0 ? 'not-allowed' : 'pointer' }}>
                    {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} image(s)`}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Images grid */}
          {images.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: '#6b7280' }}>
              No images in this folder yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {images.map((img, idx) => (
                <div key={img.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <img src={img.imageUrl} alt="" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                  {isAdmin ? (
                    <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center' }}>
                      <button onClick={() => moveImage(idx, 'up')} disabled={idx === 0} style={{ padding: '4px', background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', color: idx === 0 ? '#9ca3af' : '#2d5016' }}>
                        <ArrowUp size={18} />
                      </button>
                      <button onClick={() => moveImage(idx, 'down')} disabled={idx === images.length - 1} style={{ padding: '4px', background: 'none', border: 'none', cursor: idx === images.length - 1 ? 'not-allowed' : 'pointer', color: idx === images.length - 1 ? '#9ca3af' : '#2d5016' }}>
                        <ArrowDown size={18} />
                      </button>
                      <button onClick={() => handleDelete(img.id)} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '4px', color: '#6b7280', fontSize: '12px', alignItems: 'center' }}>
                      <Lock size={14} /> Read only
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}