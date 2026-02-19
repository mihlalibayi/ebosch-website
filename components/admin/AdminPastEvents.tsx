'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase-config';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '@/lib/firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { Plus, X, Edit2, Trash2 } from 'lucide-react';

interface PastEvent {
  id: string;
  titleEn: string;
  titleAf: string;
  titleXh: string;
  descriptionEn: string;
  descriptionAf: string;
  descriptionXh: string;
  images: string[];
  createdBy: string;
  createdAt: any;
}

const AdminPastEvents: React.FC = () => {
  const [events, setEvents] = useState<PastEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    titleEn: '',
    titleAf: '',
    titleXh: '',
    descriptionEn: '',
    descriptionAf: '',
    descriptionXh: '',
    images: [] as string[],
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAdmin(currentUser.email === 'members.ebosch@gmail.com');
        loadEvents();
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  const loadEvents = async () => {
    try {
      const q = query(collection(db, 'pastEvents'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PastEvent[];
      setEvents(data);
    } catch (error) {
      console.error('Error loading past events:', error);
    }
  };

  const uploadImages = async (eventId: string, files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const imageRef = ref(storage, `pastEvents/${eventId}/${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      urls.push(url);
    }
    return urls;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUploading(true);

    try {
      const saveData = {
        titleEn: form.titleEn,
        titleAf: form.titleAf,
        titleXh: form.titleXh,
        descriptionEn: form.descriptionEn,
        descriptionAf: form.descriptionAf,
        descriptionXh: form.descriptionXh,
        images: form.images,
        createdBy: editingId ? undefined : user.uid,
        createdAt: editingId ? undefined : new Date(),
      };

      let eventId = editingId;

      if (editingId) {
        await updateDoc(doc(db, 'pastEvents', editingId), saveData);
      } else {
        const docRef = await addDoc(collection(db, 'pastEvents'), {
          ...saveData,
          createdBy: user.uid,
          createdAt: new Date(),
        });
        eventId = docRef.id;
      }

      if (imageFiles.length > 0 && eventId) {
        const newUrls = await uploadImages(eventId, imageFiles);
        const updatedImages = [...form.images, ...newUrls];
        await updateDoc(doc(db, 'pastEvents', eventId), { images: updatedImages });
      }

      resetForm();
      loadEvents();
    } catch (error) {
      console.error('Error saving past event:', error);
      alert('Error saving event');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm({
      titleEn: '',
      titleAf: '',
      titleXh: '',
      descriptionEn: '',
      descriptionAf: '',
      descriptionXh: '',
      images: [],
    });
    setImageFiles([]);
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (event: PastEvent) => {
    setForm({
      titleEn: event.titleEn || '',
      titleAf: event.titleAf || '',
      titleXh: event.titleXh || '',
      descriptionEn: event.descriptionEn || '',
      descriptionAf: event.descriptionAf || '',
      descriptionXh: event.descriptionXh || '',
      images: event.images || [],
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this past event?')) return;
    try {
      await deleteDoc(doc(db, 'pastEvents', id));
      loadEvents();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const canEdit = (event: PastEvent) => {
    if (!user) return false;
    if (isAdmin) return true;
    return user?.email === 'office.ebosch@gmail.com' && event.createdBy === user.uid;
  };

  const canDelete = (event: PastEvent) => {
    if (!user) return false;
    return isAdmin;
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
          Past Events Gallery
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
          Manage throwback events with images and descriptions
        </p>
      </div>

      {!showForm && (
        <div style={{ marginBottom: '32px' }}>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 'normal',
              fontSize: '14px',
              backgroundColor: '#2d5016',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Plus size={18} /> Add New Past Event
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: '0' }}>
              {editingId ? 'Edit Past Event' : 'Add New Past Event'}
            </h2>
            <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Multilingual Titles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Title (English) *</label>
                <input type="text" value={form.titleEn} onChange={e => setForm({...form, titleEn: e.target.value})} required style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Title (Afrikaans) *</label>
                <input type="text" value={form.titleAf} onChange={e => setForm({...form, titleAf: e.target.value})} required style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Title (Xhosa) *</label>
                <input type="text" value={form.titleXh} onChange={e => setForm({...form, titleXh: e.target.value})} required style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              </div>
            </div>

            {/* Multilingual Descriptions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Description (English) *</label>
                <textarea value={form.descriptionEn} onChange={e => setForm({...form, descriptionEn: e.target.value})} required rows={3} style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Description (Afrikaans) *</label>
                <textarea value={form.descriptionAf} onChange={e => setForm({...form, descriptionAf: e.target.value})} required rows={3} style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Description (Xhosa) *</label>
                <textarea value={form.descriptionXh} onChange={e => setForm({...form, descriptionXh: e.target.value})} required rows={3} style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', resize: 'vertical' }} />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Event Images (max 10)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length + (form.images?.length || 0) > 10) {
                    alert('Maximum 10 images allowed');
                    return;
                  }
                  setImageFiles(files);
                }}
                style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              {form.images && form.images.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {form.images.map((url, idx) => (
                    <img key={idx} src={url} alt={`Existing ${idx}`} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                  ))}
                </div>
              )}
              {imageFiles.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>New images to upload:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {imageFiles.map((file, idx) => (
                      <img key={idx} src={URL.createObjectURL(file)} alt={`Preview ${idx}`} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading}
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: uploading ? '#9ca3af' : '#2d5016',
                color: 'white',
                border: 'none',
                cursor: uploading ? 'not-allowed' : 'pointer',
              }}
            >
              {uploading ? 'Uploading...' : (editingId ? 'Update Event' : 'Add Event')}
            </button>
          </form>
        </div>
      )}

      {/* Events List */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb', padding: '20px 24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0' }}>
            Past Events ({events.length})
          </h2>
        </div>

        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#6b7280' }}>
            <p>No past events yet. Click "Add New Past Event" to get started!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016' }}>Title (EN)</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016' }}>Images</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016' }}>Created By</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#2d5016' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev, idx) => (
                  <tr key={ev.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#111827' }}>{ev.titleEn}</td>
                    <td style={{ padding: '16px', fontSize: '14px' }}>{ev.images?.length || 0} images</td>
                    <td style={{ padding: '16px', fontSize: '14px' }}>{ev.createdBy}</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {canEdit(ev) && (
                          <button onClick={() => handleEdit(ev)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#2d5016' }}>
                            <Edit2 size={14} /> Edit
                          </button>
                        )}
                        {canDelete(ev) && (
                          <button onClick={() => handleDelete(ev.id)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#dc2626' }}>
                            <Trash2 size={14} /> Delete
                          </button>
                        )}
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
};

export default AdminPastEvents;