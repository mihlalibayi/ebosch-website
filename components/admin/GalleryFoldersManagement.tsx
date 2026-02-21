'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase-config';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import { auth } from '@/lib/firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { Plus, X, Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface Folder {
  id: string;
  nameEn: string;
  nameAf: string;
  nameXh: string;
  order: number;
  createdAt: any;
  createdBy: string;
}

export default function GalleryFoldersManagement() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nameEn: '',
    nameAf: '',
    nameXh: '',
  });
  const [user, setUser] = useState<any>(null);
  const isAdmin = user?.email === 'members.ebosch@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadFolders();
      } else {
        setUser(null);
        setFolders([]);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const loadFolders = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'galleryFolders'));
      let data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Folder[];
      data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setFolders(data);
    } catch (error) {
      console.error('Error loading folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      if (editingId) {
        await updateDoc(doc(db, 'galleryFolders', editingId), form);
      } else {
        const maxOrder = folders.reduce((max, f) => Math.max(max, f.order || 0), 0);
        await addDoc(collection(db, 'galleryFolders'), {
          ...form,
          order: maxOrder + 1,
          createdBy: user.uid,
          createdAt: new Date(),
        });
      }
      resetForm();
      loadFolders();
    } catch (error) {
      console.error('Error saving folder:', error);
      alert('Error saving folder');
    }
  };

  const resetForm = () => {
    setForm({ nameEn: '', nameAf: '', nameXh: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (folder: Folder) => {
    setForm({
      nameEn: folder.nameEn || '',
      nameAf: folder.nameAf || '',
      nameXh: folder.nameXh || '',
    });
    setEditingId(folder.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm('Delete this folder? All images inside will also be deleted.')) return;
    try {
      // Delete images in this folder
      const imagesSnap = await getDocs(collection(db, 'galleryImages'));
      imagesSnap.docs.forEach(async (imgDoc) => {
        if (imgDoc.data().folderId === id) {
          await deleteDoc(doc(db, 'galleryImages', imgDoc.id));
        }
      });
      // Delete folder
      await deleteDoc(doc(db, 'galleryFolders', id));
      loadFolders();
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  const moveFolder = async (index: number, direction: 'up' | 'down') => {
    if (!isAdmin) return;
    const newFolders = [...folders];
    if (direction === 'up' && index > 0) {
      [newFolders[index - 1], newFolders[index]] = [newFolders[index], newFolders[index - 1]];
    } else if (direction === 'down' && index < newFolders.length - 1) {
      [newFolders[index + 1], newFolders[index]] = [newFolders[index], newFolders[index + 1]];
    } else {
      return;
    }
    const batch = writeBatch(db);
    newFolders.forEach((f, idx) => {
      batch.update(doc(db, 'galleryFolders', f.id), { order: idx + 1 });
    });
    await batch.commit();
    setFolders(newFolders);
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading folders...</div>;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
          Gallery Folders
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
          Create and manage folders for the gallery
        </p>
      </div>

      {isAdmin && !showForm && (
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
            }}
          >
            <Plus size={18} /> Add New Folder
          </button>
        </div>
      )}

      {showForm && isAdmin && (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
            {editingId ? 'Edit Folder' : 'Add New Folder'}
          </h2>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text"
              placeholder="Folder name (English)"
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              required
              style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <input
              type="text"
              placeholder="Folder name (Afrikaans)"
              value={form.nameAf}
              onChange={(e) => setForm({ ...form, nameAf: e.target.value })}
              required
              style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <input
              type="text"
              placeholder="Folder name (Xhosa)"
              value={form.nameXh}
              onChange={(e) => setForm({ ...form, nameXh: e.target.value })}
              required
              style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={resetForm} style={{ padding: '10px 20px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#2d5016', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                {editingId ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Folders List */}
      {folders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#6b7280' }}>
          No folders yet. Click "Add New Folder" to get started.
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016' }}>Order</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016' }}>Name (EN)</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016' }}>Name (AF)</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016' }}>Name (XH)</th>
                <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#2d5016' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {folders.map((f, idx) => (
                <tr key={f.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                  <td style={{ padding: '16px', fontSize: '14px' }}>
                    {isAdmin ? (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => moveFolder(idx, 'up')} disabled={idx === 0} style={{ padding: '4px', background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', color: idx === 0 ? '#9ca3af' : '#2d5016' }}>
                          <ArrowUp size={16} />
                        </button>
                        <span>{f.order || idx + 1}</span>
                        <button onClick={() => moveFolder(idx, 'down')} disabled={idx === folders.length - 1} style={{ padding: '4px', background: 'none', border: 'none', cursor: idx === folders.length - 1 ? 'not-allowed' : 'pointer', color: idx === folders.length - 1 ? '#9ca3af' : '#2d5016' }}>
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    ) : (
                      f.order || idx + 1
                    )}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>{f.nameEn}</td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>{f.nameAf}</td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>{f.nameXh}</td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    {isAdmin && (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleEdit(f)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer', color: '#2d5016' }}>
                          <Edit2 size={14} /> Edit
                        </button>
                        <button onClick={() => handleDelete(f.id)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer', color: '#dc2626' }}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}