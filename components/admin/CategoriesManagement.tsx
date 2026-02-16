'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase-config';
import { collection, getDocs, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Plus, X, ChevronDown, ChevronUp, Edit2, Trash2, ArrowUp, ArrowDown, Upload, Image as ImageIcon, Check } from 'lucide-react';

interface SubSubCategory {
  id: string;
  name: string;
  imageUrl?: string;
}

interface SubCategory {
  id: string;
  name: string;
  imageUrl?: string;
  subSubcategories?: SubSubCategory[];
}

interface Category {
  id: string;
  name: string;
  type: 'root';
  imageUrl?: string;
  subcategories?: SubCategory[];
  createdAt?: any;
}

type SortBy = 'name' | 'date' | 'size';
type SortOrder = 'asc' | 'desc';

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [rootCategories, setRootCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [expandedRoot, setExpandedRoot] = useState<string | null>(null);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  
  const [showAddRootModal, setShowAddRootModal] = useState(false);
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showEditRootModal, setShowEditRootModal] = useState(false);
  const [showEditSubModal, setShowEditSubModal] = useState(false);
  
  const [imageModalType, setImageModalType] = useState<'root' | 'sub' | 'subsub'>('root');
  const [imageModalData, setImageModalData] = useState<{ rootId?: string; subId?: string; subSubId?: string }>({});
  
  const [newRootName, setNewRootName] = useState('');
  const [selectedRootId, setSelectedRootId] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState('');
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  
  const [editRootName, setEditRootName] = useState('');
  const [editRootId, setEditRootId] = useState<string | null>(null);
  const [editSubName, setEditSubName] = useState('');
  const [editSubRootId, setEditSubRootId] = useState<string | null>(null);
  
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const snap = await getDocs(collection(db, 'categories'));
      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() || new Date()
      })) as Category[];
      
      const sorted = sortCategories(data);
      setCategories(sorted);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const getCategorySize = (category: Category): number => {
    return category.subcategories?.reduce((count, sub) => {
      return count + (sub.subSubcategories?.length || 0);
    }, 0) || 0;
  };

  const sortCategories = (cats: Category[]) => {
    const sorted = [...cats];
    
    if (sortBy === 'name') {
      sorted.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    } else if (sortBy === 'date') {
      sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        const comparison = dateA - dateB;
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    } else if (sortBy === 'size') {
      sorted.sort((a, b) => {
        const sizeA = getCategorySize(a);
        const sizeB = getCategorySize(b);
        const comparison = sizeA - sizeB;
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }
    
    return sorted;
  };

  const handleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
    
    const sorted = sortCategories(categories);
    setCategories(sorted);
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

  const handleImageUpload = async () => {
    if (!imageFile) return;

    try {
      let imageUrl = '';
      const storageRef = ref(storage, `category-images/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);

      if (imageModalType === 'root' && imageModalData.rootId) {
        await updateDoc(doc(db, 'categories', imageModalData.rootId), { imageUrl });
      } else if (imageModalType === 'sub' && imageModalData.rootId && imageModalData.subId) {
        const rootCat = categories.find(c => c.id === imageModalData.rootId);
        if (rootCat?.subcategories) {
          const updatedSubs = rootCat.subcategories.map(sub => 
            sub.id === imageModalData.subId ? { ...sub, imageUrl } : sub
          );
          await updateDoc(doc(db, 'categories', imageModalData.rootId), { subcategories: updatedSubs });
        }
      } else if (imageModalType === 'subsub' && imageModalData.rootId && imageModalData.subId && imageModalData.subSubId) {
        const rootCat = categories.find(c => c.id === imageModalData.rootId);
        if (rootCat?.subcategories) {
          const updatedSubs = rootCat.subcategories.map(sub => {
            if (sub.id === imageModalData.subId && sub.subSubcategories) {
              return {
                ...sub,
                subSubcategories: sub.subSubcategories.map(ss => 
                  ss.id === imageModalData.subSubId ? { ...ss, imageUrl } : ss
                )
              };
            }
            return sub;
          });
          await updateDoc(doc(db, 'categories', imageModalData.rootId), { subcategories: updatedSubs });
        }
      }

      resetImageModal();
      loadCategories();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    }
  };

  const resetImageModal = () => {
    setShowImageModal(false);
    setImageFile(null);
    setImagePreview('');
    setImageModalData({});
  };

  const handleEditRoot = async () => {
    if (!editRootName.trim() || !editRootId) return;

    try {
      await updateDoc(doc(db, 'categories', editRootId), { name: editRootName });
      loadCategories();
      setShowEditRootModal(false);
      setEditRootName('');
      setEditRootId(null);
    } catch (error) {
      console.error('Error editing root category:', error);
      alert('Error editing category');
    }
  };

  const handleEditSub = async () => {
    if (!editSubName.trim() || !editSubRootId || !selectedSubId) return;

    try {
      const rootCat = categories.find(c => c.id === editSubRootId);
      if (rootCat?.subcategories) {
        const updatedSubs = rootCat.subcategories.map(sub =>
          sub.id === selectedSubId ? { ...sub, name: editSubName } : sub
        );
        await updateDoc(doc(db, 'categories', editSubRootId), { subcategories: updatedSubs });
      }
      loadCategories();
      setShowEditSubModal(false);
      setEditSubName('');
      setEditSubRootId(null);
      setSelectedSubId(null);
    } catch (error) {
      console.error('Error editing subcategory:', error);
      alert('Error editing subcategory');
    }
  };

  const handleAddRoot = async () => {
    if (!newRootName.trim()) return;

    try {
      const id = newRootName.toLowerCase().replace(/\s+/g, '_');
      await setDoc(doc(db, 'categories', id), {
        name: newRootName,
        type: 'root',
        subcategories: [],
        createdAt: new Date()
      });
      loadCategories();
      setNewRootName('');
      setShowAddRootModal(false);
    } catch (error) {
      console.error('Error adding root category:', error);
      alert('Error adding category');
    }
  };

  const handleAddSub = async () => {
    if (!newSubName.trim() || !selectedRootId) return;

    try {
      const rootCategory = categories.find(c => c.id === selectedRootId);
      if (!rootCategory) return;

      const newSubCategory: SubCategory = {
        id: newSubName.toLowerCase().replace(/\s+/g, '_'),
        name: newSubName,
        subSubcategories: []
      };

      const updatedSubs = [...(rootCategory.subcategories || []), newSubCategory];
      await updateDoc(doc(db, 'categories', selectedRootId), {
        subcategories: updatedSubs
      });

      loadCategories();
      setNewSubName('');
      setShowAddSubModal(false);
      setSelectedRootId(null);
    } catch (error) {
      console.error('Error adding subcategory:', error);
      alert('Error adding subcategory');
    }
  };

  const handleDeleteRoot = async (rootId: string) => {
    if (!confirm('Delete this root category?')) return;

    try {
      await deleteDoc(doc(db, 'categories', rootId));
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    }
  };

  const handleDeleteSub = async (rootId: string, subId: string) => {
    if (!confirm('Delete this subcategory?')) return;

    try {
      const rootCategory = categories.find(c => c.id === rootId);
      if (!rootCategory) return;

      const updatedSubs = rootCategory.subcategories?.filter(s => s.id !== subId) || [];
      await updateDoc(doc(db, 'categories', rootId), {
        subcategories: updatedSubs
      });

      loadCategories();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      alert('Error deleting subcategory');
    }
  };

  const handleDeleteSubSub = async (rootId: string, subId: string, subSubId: string) => {
    if (!confirm('Delete this item?')) return;

    try {
      const rootCategory = categories.find(c => c.id === rootId);
      if (!rootCategory || !rootCategory.subcategories) return;

      const updatedSubs = rootCategory.subcategories.map(sub => {
        if (sub.id === subId) {
          return {
            ...sub,
            subSubcategories: sub.subSubcategories?.filter(ss => ss.id !== subSubId) || []
          };
        }
        return sub;
      });

      await updateDoc(doc(db, 'categories', rootId), {
        subcategories: updatedSubs
      });

      loadCategories();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
          Categories Management
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
          Manage root categories, subcategories, and sub-subcategories
        </p>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowAddRootModal(true)}
          style={{
            padding: '10px 16px',
            backgroundColor: '#2d5016',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'normal',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
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
          <Plus size={16} />
          Add Root Category
        </button>

        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            {sortOrder === 'asc' ? '↑ A→Z' : '↓ Z→A'}
          </span>
          <button
            onClick={() => handleSort('name')}
            style={{
              padding: '8px 12px',
              backgroundColor: sortBy === 'name' ? '#f0fdf4' : '#f3f4f6',
              color: sortBy === 'name' ? '#2d5016' : '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: sortBy === 'name' ? '600' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            Name
          </button>

          <button
            onClick={() => handleSort('date')}
            style={{
              padding: '8px 12px',
              backgroundColor: sortBy === 'date' ? '#f0fdf4' : '#f3f4f6',
              color: sortBy === 'date' ? '#2d5016' : '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: sortBy === 'date' ? '600' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            Date
          </button>

          <button
            onClick={() => handleSort('size')}
            style={{
              padding: '8px 12px',
              backgroundColor: sortBy === 'size' ? '#f0fdf4' : '#f3f4f6',
              color: sortBy === 'size' ? '#2d5016' : '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: sortBy === 'size' ? '600' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            Size
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        {categories.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#6b7280' }}>
            No categories yet. Click "Add Root Category" to get started.
          </div>
        ) : (
          categories.map((root) => (
            <div key={root.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <div
                style={{
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#f9fafb',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => setExpandedRoot(expandedRoot === root.id ? null : root.id)}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  {expandedRoot === root.id ? (
                    <ChevronUp size={18} color="#2d5016" />
                  ) : (
                    <ChevronDown size={18} color="#2d5016" />
                  )}
                  {root.imageUrl && (
                    <img src={root.imageUrl} alt={root.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                  )}
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                    {root.name}
                  </span>
                  <span style={{ fontSize: '13px', color: '#9ca3af', marginLeft: '8px' }}>
                    ({getCategorySize(root)} items)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditRootName(root.name);
                      setEditRootId(root.id);
                      setShowEditRootModal(true);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#dbeafe',
                      color: '#0369a1',
                      border: '1px solid #bfdbfe',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontWeight: 'normal'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#93c5fd';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#dbeafe';
                    }}
                  >
                    <Edit2 size={12} style={{ display: 'inline', marginRight: '4px' }} /> Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageModalType('root');
                      setImageModalData({ rootId: root.id });
                      setShowImageModal(true);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      border: '1px solid #fde68a',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontWeight: 'normal'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fcd34d';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fef3c7';
                    }}
                  >
                    <ImageIcon size={12} style={{ display: 'inline', marginRight: '4px' }} /> Image
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRootId(root.id);
                      setShowAddSubModal(true);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f0fdf4',
                      color: '#2d5016',
                      border: '1px solid #d1fae5',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontWeight: 'normal'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#dcfce7';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0fdf4';
                    }}
                  >
                    + Add Sub
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRoot(root.id);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontWeight: 'normal'
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
              </div>

              {expandedRoot === root.id && root.subcategories && (
                <div style={{ backgroundColor: '#ffffff', borderLeft: '3px solid #2d5016' }}>
                  {root.subcategories.map((sub) => (
                    <div key={sub.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <div
                        style={{
                          padding: '12px 24px 12px 48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onClick={() => setExpandedSub(expandedSub === `${root.id}-${sub.id}` ? null : `${root.id}-${sub.id}`)}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                          {sub.subSubcategories && sub.subSubcategories.length > 0 ? (
                            expandedSub === `${root.id}-${sub.id}` ? (
                              <ChevronUp size={16} color="#6b7280" />
                            ) : (
                              <ChevronDown size={16} color="#6b7280" />
                            )
                          ) : (
                            <div style={{ width: '16px' }} />
                          )}
                          {sub.imageUrl && (
                            <img src={sub.imageUrl} alt={sub.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                          )}
                          <span style={{ fontSize: '14px', color: '#374151' }}>
                            {sub.name}
                          </span>
                          <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '8px' }}>
                            ({sub.subSubcategories?.length || 0})
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditSubName(sub.name);
                              setEditSubRootId(root.id);
                              setSelectedSubId(sub.id);
                              setShowEditSubModal(true);
                            }}
                            style={{
                              padding: '4px 10px',
                              backgroundColor: '#dbeafe',
                              color: '#0369a1',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              fontWeight: 'normal'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#93c5fd';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#dbeafe';
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setImageModalType('sub');
                              setImageModalData({ rootId: root.id, subId: sub.id });
                              setShowImageModal(true);
                            }}
                            style={{
                              padding: '4px 10px',
                              backgroundColor: '#fef3c7',
                              color: '#92400e',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              fontWeight: 'normal'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fcd34d';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#fef3c7';
                            }}
                          >
                            Img
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSub(root.id, sub.id);
                            }}
                            style={{
                              padding: '4px 10px',
                              backgroundColor: '#fef2f2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              fontWeight: 'normal'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fee2e2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#fef2f2';
                            }}
                          >
                            Del
                          </button>
                        </div>
                      </div>

                      {expandedSub === `${root.id}-${sub.id}` && sub.subSubcategories && (
                        <div style={{ backgroundColor: '#f9fafb', borderLeft: '2px solid #a1f5d8' }}>
                          {sub.subSubcategories.map((subSub) => (
                            <div
                              key={subSub.id}
                              style={{
                                padding: '10px 24px 10px 72px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '13px',
                                color: '#6b7280',
                                borderBottom: '1px solid #e5e7eb'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {subSub.imageUrl && (
                                  <img src={subSub.imageUrl} alt={subSub.name} style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }} />
                                )}
                                <span>{subSub.name}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  onClick={() => {
                                    setImageModalType('subsub');
                                    setImageModalData({ rootId: root.id, subId: sub.id, subSubId: subSub.id });
                                    setShowImageModal(true);
                                  }}
                                  style={{
                                    padding: '3px 8px',
                                    backgroundColor: '#fef3c7',
                                    color: '#92400e',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    cursor: 'pointer',
                                    fontWeight: 'normal'
                                  }}
                                >
                                  Img
                                </button>
                                <button
                                  onClick={() => handleDeleteSubSub(root.id, sub.id, subSub.id)}
                                  style={{
                                    padding: '3px 8px',
                                    backgroundColor: 'transparent',
                                    color: '#dc2626',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    cursor: 'pointer',
                                    fontWeight: 'normal'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#fef2f2';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  Del
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Root Category Modal */}
      {showAddRootModal && (
        <Modal onClose={() => setShowAddRootModal(false)}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            Add Root Category
          </h3>
          <input
            type="text"
            value={newRootName}
            onChange={(e) => setNewRootName(e.target.value)}
            placeholder="Category name"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '16px',
              boxSizing: 'border-box'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleAddRoot()}
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowAddRootModal(false)}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'normal'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddRoot}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: '#2d5016',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'normal'
              }}
            >
              Add
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Root Category Modal */}
      {showEditRootModal && (
        <Modal onClose={() => { setShowEditRootModal(false); setEditRootName(''); setEditRootId(null); }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            Edit Root Category
          </h3>
          <input
            type="text"
            value={editRootName}
            onChange={(e) => setEditRootName(e.target.value)}
            placeholder="Category name"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '16px',
              boxSizing: 'border-box'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleEditRoot()}
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => { setShowEditRootModal(false); setEditRootName(''); setEditRootId(null); }}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'normal'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleEditRoot}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: '#2d5016',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'normal'
              }}
            >
              Update
            </button>
          </div>
        </Modal>
      )}

      {/* Add Subcategory Modal */}
      {showAddSubModal && (
        <Modal onClose={() => { setShowAddSubModal(false); setSelectedRootId(null); }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            Add Subcategory
          </h3>
          <input
            type="text"
            value={newSubName}
            onChange={(e) => setNewSubName(e.target.value)}
            placeholder="Subcategory name"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '16px',
              boxSizing: 'border-box'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSub()}
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => { setShowAddSubModal(false); setSelectedRootId(null); }}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'normal'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddSub}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: '#2d5016',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'normal'
              }}
            >
              Add
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Subcategory Modal */}
      {showEditSubModal && (
        <Modal onClose={() => { setShowEditSubModal(false); setEditSubName(''); setEditSubRootId(null); setSelectedSubId(null); }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            Edit Subcategory
          </h3>
          <input
            type="text"
            value={editSubName}
            onChange={(e) => setEditSubName(e.target.value)}
            placeholder="Subcategory name"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '16px',
              boxSizing: 'border-box'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleEditSub()}
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => { setShowEditSubModal(false); setEditSubName(''); setEditSubRootId(null); setSelectedSubId(null); }}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'normal'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleEditSub}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: '#2d5016',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'normal'
              }}
            >
              Update
            </button>
          </div>
        </Modal>
      )}

      {/* Image Upload Modal */}
      {showImageModal && (
        <Modal onClose={resetImageModal}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            Upload Image
          </h3>

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
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
              id="imageInput"
            />
            <label htmlFor="imageInput" style={{ cursor: 'pointer' }}>
              {imagePreview ? (
                <div>
                  <img src={imagePreview} alt="Preview" style={{ maxHeight: '100px', marginBottom: '8px' }} />
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>Click to change image</p>
                </div>
              ) : (
                <div>
                  <ImageIcon size={32} style={{ margin: '0 auto 8px', color: '#9ca3af' }} />
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>Click to upload image</p>
                </div>
              )}
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={resetImageModal}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'normal'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleImageUpload}
              disabled={!imageFile}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: imageFile ? '#2d5016' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: imageFile ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: 'normal'
              }}
            >
              Upload
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}