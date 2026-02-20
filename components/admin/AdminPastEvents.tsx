'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase-config';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '@/lib/firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { Plus, X, Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

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
  createdByEmail: string;
  createdAt: any;
  order: number;
}

// Combined item for reordering: either an existing image URL or a new file with preview
interface ImageItem {
  id: string; // temporary unique id for React key
  type: 'existing' | 'new';
  url?: string;      // for existing
  file?: File;       // for new
  preview?: string;  // for new
}

export default function AdminPastEvents() {
  const [events, setEvents] = useState<PastEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showMyEventsOnly, setShowMyEventsOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    titleEn: '',
    titleAf: '',
    titleXh: '',
    descriptionEn: '',
    descriptionAf: '',
    descriptionXh: '',
  });

  // Combined list of images (existing + new) for reordering
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAdmin(currentUser.email === 'members.ebosch@gmail.com');
        loadEvents();
      } else {
        setUser(null);
        setLoading(false);
        setEvents([]);
      }
    });
    return unsubscribe;
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await getDocs(collection(db, 'pastEvents'));
      console.log('Raw snapshot size:', snapshot.size);
      let data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PastEvent[];
      console.log('Fetched events:', data);

      data.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        } else if (a.order !== undefined) {
          return -1;
        } else if (b.order !== undefined) {
          return 1;
        } else {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return aTime - bTime;
        }
      });

      setEvents(data);
    } catch (err: any) {
      console.error('Error loading past events:', err);
      setError('Failed to load past events. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Convert existing image URLs to imageItems
  const resetImageItems = (existingUrls: string[] = []) => {
    const items: ImageItem[] = existingUrls.map((url, index) => ({
      id: `existing-${index}-${Date.now()}`,
      type: 'existing',
      url,
    }));
    setImageItems(items);
  };

  const handleAddFiles = (files: FileList | null) => {
    if (!files) return;
    const newItems: ImageItem[] = Array.from(files).map((file, index) => ({
      id: `new-${Date.now()}-${index}-${Math.random()}`,
      type: 'new',
      file,
      preview: URL.createObjectURL(file),
    }));
    // Check total count
    if (imageItems.length + newItems.length > 10) {
      alert('Maximum 10 images allowed');
      // Clean up preview URLs
      newItems.forEach(item => item.preview && URL.revokeObjectURL(item.preview));
      return;
    }
    setImageItems(prev => [...prev, ...newItems]);
  };

  const moveImageItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...imageItems];
    if (direction === 'up' && index > 0) {
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    } else if (direction === 'down' && index < newItems.length - 1) {
      [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
    } else {
      return;
    }
    setImageItems(newItems);
  };

  const removeImageItem = (index: number) => {
    const item = imageItems[index];
    if (item.type === 'new' && item.preview) {
      URL.revokeObjectURL(item.preview);
    }
    setImageItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUploading(true);

    try {
      // Separate existing URLs and new files, preserving order
      const existingUrls: string[] = [];
      const newFiles: File[] = [];
      for (const item of imageItems) {
        if (item.type === 'existing' && item.url) {
          existingUrls.push(item.url);
        } else if (item.type === 'new' && item.file) {
          newFiles.push(item.file);
        }
      }

      let finalImageUrls = [...existingUrls];

      // Upload new files and get their URLs
      if (newFiles.length > 0 && editingId) {
        // For existing event, upload to its folder
        const uploadedUrls = await uploadImages(editingId, newFiles);
        finalImageUrls = [...existingUrls, ...uploadedUrls];
      } else if (newFiles.length > 0 && !editingId) {
        // For new event, we'll upload after creation, so store files for later
        // We'll handle in a separate step
      }

      const baseData = {
        titleEn: form.titleEn,
        titleAf: form.titleAf,
        titleXh: form.titleXh,
        descriptionEn: form.descriptionEn,
        descriptionAf: form.descriptionAf,
        descriptionXh: form.descriptionXh,
        images: finalImageUrls,
      };

      let eventId = editingId;

      if (editingId) {
        await updateDoc(doc(db, 'pastEvents', editingId), baseData);
        // If there are new files, they've already been uploaded above
      } else {
        const maxOrder = events.reduce((max, ev) => Math.max(max, ev.order || 0), 0);
        const docRef = await addDoc(collection(db, 'pastEvents'), {
          ...baseData,
          createdBy: user.uid,
          createdByEmail: user.email,
          createdAt: new Date(),
          order: maxOrder + 1,
          images: existingUrls, // temporary, will update after upload
        });
        eventId = docRef.id;
        // Upload new files if any
        if (newFiles.length > 0) {
          const uploadedUrls = await uploadImages(eventId, newFiles);
          finalImageUrls = [...existingUrls, ...uploadedUrls];
          await updateDoc(doc(db, 'pastEvents', eventId), { images: finalImageUrls });
        }
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

  const resetForm = () => {
    setForm({
      titleEn: '',
      titleAf: '',
      titleXh: '',
      descriptionEn: '',
      descriptionAf: '',
      descriptionXh: '',
    });
    // Clean up any preview URLs
    imageItems.forEach(item => {
      if (item.type === 'new' && item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });
    setImageItems([]);
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
    });
    resetImageItems(event.images || []);
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

  const moveEvent = async (index: number, direction: 'up' | 'down') => {
    if (!isAdmin) return;
    const newEvents = [...events];
    if (direction === 'up' && index > 0) {
      [newEvents[index - 1], newEvents[index]] = [newEvents[index], newEvents[index - 1]];
    } else if (direction === 'down' && index < newEvents.length - 1) {
      [newEvents[index + 1], newEvents[index]] = [newEvents[index], newEvents[index + 1]];
    } else {
      return;
    }
    const batch = writeBatch(db);
    newEvents.forEach((ev, idx) => {
      batch.update(doc(db, 'pastEvents', ev.id), { order: idx + 1 });
    });
    await batch.commit();
    setEvents(newEvents);
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

  const filteredEvents = events.filter(ev => {
    if (isAdmin) return true;
    if (showMyEventsOnly) {
      return ev.createdBy === user?.uid;
    }
    return true;
  });

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading past events...</div>;
  }

  if (error) {
    return <div style={{ padding: '24px', color: 'red' }}>{error}</div>;
  }

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
        <div style={{ marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'center' }}>
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
          {!isAdmin && user && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151' }}>
              <input
                type="checkbox"
                checked={showMyEventsOnly}
                onChange={(e) => setShowMyEventsOnly(e.target.checked)}
              />
              Show only my events
            </label>
          )}
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

            {/* Multilingual Descriptions (optional) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Description (English)</label>
                <textarea value={form.descriptionEn} onChange={e => setForm({...form, descriptionEn: e.target.value})} rows={3} style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Description (Afrikaans)</label>
                <textarea value={form.descriptionAf} onChange={e => setForm({...form, descriptionAf: e.target.value})} rows={3} style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Description (Xhosa)</label>
                <textarea value={form.descriptionXh} onChange={e => setForm({...form, descriptionXh: e.target.value})} rows={3} style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', resize: 'vertical' }} />
              </div>
            </div>

            {/* Image Upload with Reordering */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Event Images (max 10)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleAddFiles(e.target.files)}
                style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              {imageItems.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>Drag to reorder:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {imageItems.map((item, idx) => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                        <img
                          src={item.type === 'existing' ? item.url : item.preview}
                          alt={`Image ${idx + 1}`}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <span style={{ fontSize: '13px', color: '#374151' }}>Image {idx + 1} {item.type === 'existing' ? '(existing)' : '(new)'}</span>
                        <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                          <button type="button" onClick={() => moveImageItem(idx, 'up')} disabled={idx === 0} style={{ padding: '4px', background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', color: idx === 0 ? '#9ca3af' : '#2d5016' }}>
                            <ArrowUp size={18} />
                          </button>
                          <button type="button" onClick={() => moveImageItem(idx, 'down')} disabled={idx === imageItems.length - 1} style={{ padding: '4px', background: 'none', border: 'none', cursor: idx === imageItems.length - 1 ? 'not-allowed' : 'pointer', color: idx === imageItems.length - 1 ? '#9ca3af' : '#2d5016' }}>
                            <ArrowDown size={18} />
                          </button>
                          <button type="button" onClick={() => removeImageItem(idx)} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
                            <X size={18} />
                          </button>
                        </div>
                      </div>
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
            Past Events ({filteredEvents.length}{filteredEvents.length !== events.length ? ` of ${events.length}` : ''})
          </h2>
        </div>

        {filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#6b7280' }}>
            <p>No past events yet. Click "Add New Past Event" to get started!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016' }}>Order</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016' }}>Title (EN)</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016' }}>Images</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016' }}>Created By</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#2d5016' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((ev, idx) => (
                  <tr key={ev.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                    <td style={{ padding: '16px', fontSize: '14px', whiteSpace: 'nowrap' }}>
                      {isAdmin ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => moveEvent(idx, 'up')} disabled={idx === 0} style={{ padding: '4px', background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', color: idx === 0 ? '#9ca3af' : '#2d5016' }}>
                            <ArrowUp size={16} />
                          </button>
                          <span>{ev.order || idx + 1}</span>
                          <button onClick={() => moveEvent(idx, 'down')} disabled={idx === filteredEvents.length - 1} style={{ padding: '4px', background: 'none', border: 'none', cursor: idx === filteredEvents.length - 1 ? 'not-allowed' : 'pointer', color: idx === filteredEvents.length - 1 ? '#9ca3af' : '#2d5016' }}>
                            <ArrowDown size={16} />
                          </button>
                        </div>
                      ) : (
                        ev.order || idx + 1
                      )}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#111827', wordBreak: 'break-word' }}>{ev.titleEn}</td>
                    <td style={{ padding: '16px', fontSize: '14px', whiteSpace: 'nowrap' }}>{ev.images?.length || 0} images</td>
                    <td style={{ padding: '16px', fontSize: '14px', wordBreak: 'break-word' }}>{ev.createdByEmail || ev.createdBy}</td>
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
}