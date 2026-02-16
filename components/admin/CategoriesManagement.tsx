'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Plus, X, ChevronDown, ChevronUp, Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface SubSubCategory {
  id: string;
  name: string;
}

interface SubCategory {
  id: string;
  name: string;
  subSubcategories?: SubSubCategory[];
}

interface Category {
  id: string;
  name: string;
  type: 'root';
  subcategories?: SubCategory[];
  webpageLink?: string;
  webpageTitle?: string;
  webpageDescription?: string;
  createdAt?: any;
}

type SortBy = 'name' | 'date' | 'size';
type SortOrder = 'asc' | 'desc';

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedRoot, setExpandedRoot] = useState<string | null>(null);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  
  const [showAddRootModal, setShowAddRootModal] = useState(false);
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [showAddSubSubModal, setShowAddSubSubModal] = useState(false);
  
  const [newRootName, setNewRootName] = useState('');
  const [selectedRootId, setSelectedRootId] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState('');
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [newSubSubName, setNewSubSubName] = useState('');
  
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

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

  const handleAddSubSub = async () => {
    if (!newSubSubName.trim() || !selectedRootId || !selectedSubId) return;

    try {
      const rootCategory = categories.find(c => c.id === selectedRootId);
      if (!rootCategory || !rootCategory.subcategories) return;

      const updatedSubs = rootCategory.subcategories.map(sub => {
        if (sub.id === selectedSubId) {
          return {
            ...sub,
            subSubcategories: [
              ...(sub.subSubcategories || []),
              {
                id: newSubSubName.toLowerCase().replace(/\s+/g, '_'),
                name: newSubSubName
              }
            ]
          };
        }
        return sub;
      });

      await updateDoc(doc(db, 'categories', selectedRootId), {
        subcategories: updatedSubs
      });

      loadCategories();
      setNewSubSubName('');
      setShowAddSubSubModal(false);
      setSelectedRootId(null);
      setSelectedSubId(null);
    } catch (error) {
      console.error('Error adding sub-subcategory:', error);
      alert('Error adding sub-subcategory');
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

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
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

        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#6b7280', marginRight: '8px' }}>
            Sort: {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
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
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: sortBy === 'name' ? '600' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            Name
            {sortBy === 'name' && (
              sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
            )}
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
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: sortBy === 'date' ? '600' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            Date
            {sortBy === 'date' && (
              sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
            )}
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
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: sortBy === 'size' ? '600' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            Size
            {sortBy === 'size' && (
              sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
            )}
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
                      transition: 'all 0.2s'
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
                              setSelectedRootId(root.id);
                              setSelectedSubId(sub.id);
                              setShowAddSubSubModal(true);
                            }}
                            style={{
                              padding: '4px 10px',
                              backgroundColor: '#f0fdf4',
                              color: '#2d5016',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#dcfce7';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#f0fdf4';
                            }}
                          >
                            + Add Item
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
                              <span>{subSub.name}</span>
                              <button
                                onClick={() => handleDeleteSubSub(root.id, sub.id, subSub.id)}
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: 'transparent',
                                  color: '#dc2626',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#fef2f2';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                Delete
                              </button>
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

      {showAddRootModal && (
        <Modal onClose={() => setShowAddRootModal(false)}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            Add Root Category
          </h3>
          <input
            type="text"
            value={newRootName}
            onChange={(e) => setNewRootName(e.target.value)}
            placeholder="Category name (e.g., LOCAL BUSINESSES)"
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
                fontSize: '14px'
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
                fontSize: '14px'
              }}
            >
              Add
            </button>
          </div>
        </Modal>
      )}

      {showAddSubModal && (
        <Modal onClose={() => { setShowAddSubModal(false); setSelectedRootId(null); }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            Add Subcategory
          </h3>
          <input
            type="text"
            value={newSubName}
            onChange={(e) => setNewSubName(e.target.value)}
            placeholder="Subcategory name (e.g., Bakeries)"
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
                fontSize: '14px'
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
                fontSize: '14px'
              }}
            >
              Add
            </button>
          </div>
        </Modal>
      )}

      {showAddSubSubModal && (
        <Modal onClose={() => { setShowAddSubSubModal(false); setSelectedRootId(null); setSelectedSubId(null); }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            Add Item
          </h3>
          <input
            type="text"
            value={newSubSubName}
            onChange={(e) => setNewSubSubName(e.target.value)}
            placeholder="Item name (e.g., business name)"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '16px',
              boxSizing: 'border-box'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSubSub()}
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => { setShowAddSubSubModal(false); setSelectedRootId(null); setSelectedSubId(null); }}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddSubSub}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: '#2d5016',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Add
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