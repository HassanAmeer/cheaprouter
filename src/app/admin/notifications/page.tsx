'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Send, CheckCircle2, Users, Type, MessageSquare, Sparkles, X, Search, ChevronRight, ChevronLeft } from 'lucide-react';

type User = {
  id: string;
  name: string;
  email: string;
};

export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(['ALL']);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const adminHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    return { 'Authorization': `Bearer ${token || ''}`, 'Content-Type': 'application/json' };
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { headers: adminHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const limit = 50;
  const totalPages = Math.ceil(filteredUsers.length / limit) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * limit, page * limit);
  
  // Reset page to 1 when searching
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const isAllSelected = selectedUserIds.includes('ALL');

  const toggleUser = (id: string) => {
    if (id === 'ALL') {
      setSelectedUserIds(isAllSelected ? [] : ['ALL']);
      return;
    }
    
    let newSelection = [...selectedUserIds];
    if (isAllSelected) {
      newSelection = [];
    }

    if (newSelection.includes(id)) {
      newSelection = newSelection.filter(uid => uid !== id);
    } else {
      newSelection.push(id);
    }
    
    if (newSelection.length === 0) {
      newSelection = ['ALL']; // default back to all if empty, or just leave empty? Let's leave empty, but maybe enforce at least one.
    }
    setSelectedUserIds(newSelection);
  };

  const removeUser = (id: string) => {
    if (id === 'ALL') {
      setSelectedUserIds([]);
    } else {
      const newSelection = selectedUserIds.filter(uid => uid !== id);
      setSelectedUserIds(newSelection);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim() || selectedUserIds.length === 0) return;

    setIsSending(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ title, message, targetUserIds: selectedUserIds })
      });
      
      if (res.ok) {
        setSuccess(true);
        setTitle('');
        setMessage('');
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert('Failed to send notification.');
      }
    } catch (error) {
      console.error('Failed to send notification', error);
      alert('Failed to send notification.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ width: '100%', paddingBottom: '60px', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '40px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: -40, left: -40, width: '200px', height: '200px', background: 'var(--color-primary)', filter: 'blur(100px)', opacity: 0.15, zIndex: -1, borderRadius: '50%' }} />
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.5px' }}>
          <div style={{ background: 'var(--color-primary)', padding: '10px', borderRadius: '12px', display: 'flex', boxShadow: 'var(--shadow-glow)' }}>
            <Bell size={24} color="white" />
          </div>
          Broadcast Center
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '16px', maxWidth: '600px', lineHeight: '1.6' }}>
          Deploy real-time notifications to your user base. Messages will appear instantly on their dashboard and trigger push notifications if enabled.
        </p>
      </div>

      <div className="card glass-card" style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '40px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '400px', background: 'var(--color-primary)', filter: 'blur(150px)', opacity: 0.05, zIndex: 0, borderRadius: '50%' }} />
        
        <form onSubmit={handleSendNotification} style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Target Audience Selector (Trigger & Chips) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} color="var(--color-primary)" /> Target Audience
                </label>
                <button 
                  type="button" 
                  onClick={() => setIsSheetOpen(true)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Manage Audience <ChevronRight size={16} />
                </button>
              </div>
              
              {/* Chips Box */}
              <div 
                onClick={() => setIsSheetOpen(true)}
                style={{ 
                  width: '100%', 
                  flex: 1,
                  minHeight: '280px',
                  background: 'var(--color-input-bg)', 
                  border: '1px solid var(--color-border)', 
                  padding: '24px', 
                  borderRadius: '12px', 
                  cursor: 'pointer',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  alignContent: 'flex-start',
                  transition: 'all 0.2s' 
                }}
              >
                {selectedUserIds.length === 0 && (
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '16px', fontStyle: 'italic' }}>Click to select users...</span>
                )}
                
                {isAllSelected && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', borderRadius: '20px', padding: '10px 16px', fontSize: '15px', fontWeight: 600 }}>
                    <Users size={18} />
                    All Users (Broadcast)
                    <div 
                      onClick={(e) => { e.stopPropagation(); removeUser('ALL'); }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', marginLeft: '6px', background: 'rgba(255,255,255,0.5)' }}
                    >
                      <X size={14} color="var(--color-primary)" />
                    </div>
                  </div>
                )}

                {!isAllSelected && selectedUserIds.map(id => {
                  const user = users.find(u => u.id === id);
                  return (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-bg-muted)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '10px 16px', fontSize: '15px', fontWeight: 500 }}>
                      {user?.name || id}
                      <div 
                        onClick={(e) => { e.stopPropagation(); removeUser(id); }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', marginLeft: '6px', background: 'var(--color-bg-soft)' }}
                      >
                        <X size={14} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Notification Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Type size={18} color="var(--color-primary)" /> Notification Title
              </label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. System Maintenance Update"
                style={{ width: '100%', background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '16px 20px', borderRadius: '12px', color: 'var(--color-text-main)', fontSize: '15px', outline: 'none', transition: 'all 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              />
            </div>

            {/* Message Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              <label style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} color="var(--color-primary)" /> Message Content
              </label>
              <textarea 
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type the message you want the selected users to see..."
                style={{ width: '100%', flex: 1, background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', padding: '20px', borderRadius: '12px', color: 'var(--color-text-main)', fontSize: '15px', minHeight: '160px', resize: 'none', outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              />
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '20px', marginTop: '10px', paddingTop: '30px', borderTop: '1px solid var(--color-border)' }}>
            {success && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '15px', fontWeight: 500 }}>
                <CheckCircle2 size={18} />
                Notification broadcasted successfully
              </span>
            )}
            <button 
              type="submit" 
              disabled={isSending || (!title.trim() || !message.trim() || selectedUserIds.length === 0)}
              style={{ 
                background: 'transparent', 
                color: 'var(--color-primary)', 
                border: '1.5px solid var(--color-primary)', 
                borderRadius: '12px', 
                padding: '15px 32px', 
                fontSize: '16px', 
                fontWeight: 600,
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                cursor: (isSending || (!title.trim() || !message.trim() || selectedUserIds.length === 0)) ? 'not-allowed' : 'pointer', 
                opacity: (isSending || (!title.trim() || !message.trim() || selectedUserIds.length === 0)) ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => !isSending && title.trim() && message.trim() && selectedUserIds.length > 0 ? (e.currentTarget.style.background = 'var(--color-primary)', e.currentTarget.style.color = 'white', e.currentTarget.style.boxShadow = 'var(--shadow-glow)') : null}
              onMouseOut={(e) => !isSending && title.trim() && message.trim() && selectedUserIds.length > 0 ? (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = 'var(--color-primary)', e.currentTarget.style.boxShadow = 'none') : null}
            >
              {isSending ? (
                <>Sending...</>
              ) : (
                <><Sparkles size={20} /> Send Notification</>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Side Sheet (Overlay & Panel) */}
      {isSheetOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex' }}>
          {/* Backdrop overlay */}
          <div 
            onClick={() => setIsSheetOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out' }} 
          />
          
          {/* Sheet Panel */}
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '400px', background: 'var(--color-card-bg)', borderLeft: '1px solid var(--color-border)', boxShadow: '-10px 0 30px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-main)' }}>Select Audience</h2>
              <button 
                onClick={() => setIsSheetOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '50%' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', background: 'var(--color-input-bg)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '12px 16px 12px 42px', fontSize: '14px', color: 'var(--color-text-main)', outline: 'none' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              
              {/* All Users Toggle */}
              <div 
                onClick={() => toggleUser('ALL')}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', cursor: 'pointer', background: isAllSelected ? 'var(--color-primary-soft)' : 'transparent', transition: 'background 0.2s', marginBottom: '8px' }}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: `2px solid ${isAllSelected ? 'var(--color-primary)' : 'var(--color-border)'}`, background: isAllSelected ? 'var(--color-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isAllSelected && <CheckCircle2 size={14} color="white" />}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: isAllSelected ? 'var(--color-primary)' : 'var(--color-text-main)' }}>All Users</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Broadcast to everyone</div>
                </div>
              </div>

              {loadingUsers && <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading users...</div>}
              
              {!loadingUsers && filteredUsers.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No users found.</div>}

              {/* User List */}
              <div style={{ padding: '8px 16px', borderTop: '1px solid var(--color-border)', marginTop: '8px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px' }}>List of Users</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {paginatedUsers.map(user => {
                  const isSelected = selectedUserIds.includes(user.id);
                  return (
                    <div 
                      key={user.id}
                      onClick={() => toggleUser(user.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', background: isSelected ? 'var(--color-bg-muted)' : 'transparent', transition: 'background 0.2s' }}
                    >
                      <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`, background: isSelected ? 'var(--color-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isSelected && <CheckCircle2 size={14} color="white" />}
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.email}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
            
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-card-bg)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  50 / page
                </span>
                
                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', padding: '6px 8px', borderRadius: '8px', color: page === 1 ? 'var(--color-text-muted)' : 'var(--color-text-main)', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{
                          width: '28px', height: '28px', borderRadius: '6px',
                          border: p === page ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                          background: p === page ? 'var(--color-primary)' : 'transparent',
                          color: p === page ? 'white' : 'var(--color-text-main)',
                          fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        {p}
                      </button>
                    ))}

                    <button 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', padding: '6px 8px', borderRadius: '8px', color: page === totalPages ? 'var(--color-text-muted)' : 'var(--color-text-main)', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setIsSheetOpen(false)}
                style={{ background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}} />
    </div>
  );
}
