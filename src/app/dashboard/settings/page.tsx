'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/components/auth-provider';
import { useSiteSettings } from '@/components/settings-provider';
import { api } from '@/lib/api';
import {
  User, Mail, Shield, KeyRound, Sparkles, LogOut, GraduationCap, Code2,
  Target, Compass, Cpu, Pencil, Loader2, ChevronRight, CreditCard,
  Trash2, Lock, Check, X,
} from 'lucide-react';
import { PricingPlan } from '@/lib/api-types';
import styles from './settings.module.css';

const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: 'New / Beginner',
  intermediate: 'Intermediate',
  advanced: 'Pro / Expert',
  'not-programmer': 'Not a programmer',
};

const USECASE_LABELS: Record<string, string> = {
  'vibe-coding': 'Vibe Coding',
  'website-builder': 'Website Builder',
  agents: 'Chat agents',
  chat: 'Chat',
  api: 'API',
  cli: 'CLI',
  ide: 'IDE',
  extension: 'Extension',
};

const GOAL_LABELS: Record<string, string> = {
  coding: 'Coding',
  chats: 'Chats',
  agents: 'Agents',
  apis: 'APIs',
  resellers: 'Reseller',
  affiliate: 'Earn with Affiliate',
  earn: 'Earn / Build products',
  free: 'Use models for free',
};

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, updateProfile, logout } = useAuth();
  const { settings } = useSiteSettings();
  const [name, setName] = useState(user?.name ?? 'John Doe');
  const [email] = useState(user?.email ?? 'john@company.com');
  const [profilePic, setProfilePic] = useState<string | null>(user?.profile_picture ?? null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [delBusy, setDelBusy] = useState(false);

  const memberSince = user?.created_at ? new Date(user.created_at) : null;

  const passwordChangedLabel = user?.password_changed_at
    ? (() => {
        const d = new Date(user.password_changed_at);
        const days = Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
      })()
    : 'Never';

  const dirty =
    name !== (user?.name ?? 'John Doe') || profileFile !== null || profilePic !== (user?.profile_picture ?? null);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast('Enter your current and new password', 'warning');
      return;
    }
    if (newPassword.length < 6) {
      toast('New password must be at least 6 characters', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('New passwords do not match', 'error');
      return;
    }
    setPwBusy(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      toast('Password updated successfully', 'success');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast(err.message ?? 'Failed to update password', 'error');
    } finally {
      setPwBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDelBusy(true);
    try {
      await api.deleteAccount();
      toast('Account deleted', 'success');
      logout();
      setTimeout(() => { window.location.href = '/'; }, 500);
    } catch (err: any) {
      toast(err.message ?? 'Failed to delete account', 'error');
      setShowDeleteModal(false);
    } finally {
      setDelBusy(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfilePic(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile(name, profileFile ?? profilePic ?? undefined);
      setProfileFile(null);
      toast('Profile changes saved', 'success');
    } catch (err: any) {
      toast(err.message ?? 'Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setName(user?.name ?? 'John Doe');
    setProfileFile(null);
    setProfilePic(user?.profile_picture ?? null);
    toast('Changes discarded', 'warning');
  };

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const activePlanId = user?.plan && user.plan !== 'free'
    ? (user.plan_cli || user.plan_api || user.plan_chat || user.plan_agents)
    : null;
  const activePlan = (settings?.pricingSection?.tabs || [])
    .flatMap((t) => t.plans || [])
    .find((p: PricingPlan) => p.id === activePlanId);
  const planPrice = activePlan ? parseFloat(String(activePlan.price ?? '0').replace(/[^0-9.]/g, '')) || 0 : 0;

  const planName = user?.plan
    ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1)
    : 'Free';

  return (
    <div className={styles.page}>
      <h1 className={styles.largeTitle}>Settings</h1>
      <p className={styles.pageSubtitle}>Manage your account, security, and subscription.</p>

      {/* Profile */}
      <div className={styles.sectionLabel}>Account</div>
      <div className={`${styles.group} ${styles.groupBorder}`}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>
              {profilePic ? <img src={profilePic} alt="Profile" /> : initials}
            </div>
          </div>
          <div className={styles.profileName}>{name}</div>
          <div className={styles.profileEmail}>{email}</div>
          <label className={styles.textButton}>
            Change Photo
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
          </label>
        </div>

        <div className={styles.row}>
          <div className={styles.rowMain}>
            <label htmlFor="settings-name" className={styles.fieldLabel}>Name</label>
            <input
              id="settings-name"
              className={styles.fieldInput}
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ marginTop: 6 }}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.iconTile}><Mail size={16} /></div>
          <div className={styles.rowMain}>
            <div className={styles.rowTitle}>Email</div>
          </div>
          <span className={styles.rowValue}>{email}</span>
          <Lock size={14} className={styles.chevron} />
        </div>

        <div className={styles.row}>
          <div className={styles.iconTile}><Sparkles size={16} /></div>
          <div className={styles.rowMain}>
            <div className={styles.rowTitle}>Plan</div>
          </div>
          <span className={styles.planPill}>{planName}</span>
        </div>

        <div className={styles.row}>
          <div className={styles.iconTile}><User size={16} /></div>
          <div className={styles.rowMain}>
            <div className={styles.rowTitle}>Member Since</div>
          </div>
          <span className={styles.rowValue}>
            {memberSince ? memberSince.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
          </span>
        </div>

        {dirty && (
          <div className={styles.saveBar}>
            <span className={styles.saveNote}>You have unsaved changes</span>
            <div className={styles.saveActions}>
              <button className={`${styles.pillButton} ${styles.pillSecondary}`} onClick={discard}>
                Discard
              </button>
              <button className={`${styles.pillButton} ${styles.pillPrimary}`} onClick={save} disabled={saving}>
                {saving ? <Loader2 size={15} className="lucide-spin" /> : <><Check size={15} /> Save</>}
              </button>
            </div>
          </div>
        )}
      </div>
      <p className={styles.sectionFooter}>
        Email cannot be changed. Your photo and name are visible on your public profile.
      </p>

      {/* Preferences */}
      <div className={styles.sectionLabel}>Preferences</div>
      <div className={`${styles.group} ${styles.groupBorder}`}>
        {!user?.onboarding_completed ? (
          <button className={styles.row} onClick={() => (window.location.href = '/onboarding')}>
            <div className={styles.iconTile}><Target size={16} /></div>
            <div className={styles.rowMain}>
              <div className={styles.rowTitle}>Complete onboarding</div>
              <div className={styles.rowSub}>Answer a few questions to tailor your experience</div>
            </div>
            <ChevronRight size={16} className={styles.chevron} />
          </button>
        ) : (
          <>
            <div className={styles.row}>
              <div className={styles.iconTile}><GraduationCap size={16} /></div>
              <div className={styles.rowMain}>
                <div className={styles.rowTitle}>Student</div>
              </div>
              <span className={styles.rowValue}>{user?.is_student ? 'Yes' : 'No'}</span>
            </div>

            <div className={styles.row}>
              <div className={styles.iconTile}><Code2 size={16} /></div>
              <div className={styles.rowMain}>
                <div className={styles.rowTitle}>Experience</div>
              </div>
              <span className={styles.rowValue}>
                {EXPERIENCE_LABELS[user?.experience_level ?? ''] ?? (user?.experience_level || 'Not specified')}
              </span>
            </div>

            <div className={styles.row}>
              <div className={styles.iconTile}><Cpu size={16} /></div>
              <div className={styles.rowMain}>
                <div className={styles.rowTitle}>Wants to Use</div>
                <div className={styles.chipRow} style={{ marginTop: 6 }}>
                  {(user?.use_cases || '').split(',').map((u: string) => u.trim()).filter(Boolean).map((u: string) => (
                    <span key={u} className={styles.chip}>{USECASE_LABELS[u] ?? u}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.iconTile}><Compass size={16} /></div>
              <div className={styles.rowMain}>
                <div className={styles.rowTitle}>Goal</div>
              </div>
              <span className={styles.rowValue}>
                {GOAL_LABELS[user?.earning_goal ?? ''] ?? (user?.earning_goal || 'Not specified')}
              </span>
            </div>

            <button className={styles.row} onClick={() => (window.location.href = '/onboarding')}>
              <div className={styles.iconTile}><Pencil size={16} /></div>
              <div className={styles.rowMain}>
                <div className={styles.rowTitle}>Edit Preferences</div>
              </div>
              <ChevronRight size={16} className={styles.chevron} />
            </button>
          </>
        )}
      </div>
      <p className={styles.sectionFooter}>
        These answers help us tailor recommendations for you.
      </p>

      {/* Security */}
      <div className={styles.sectionLabel}>Security</div>
      <div className={`${styles.group} ${styles.groupBorder}`}>
        <button className={styles.row} onClick={() => setShowPasswordModal(true)}>
          <div className={styles.iconTile}><KeyRound size={16} /></div>
          <div className={styles.rowMain}>
            <div className={styles.rowTitle}>Change Password</div>
            <div className={styles.rowSub}>Last changed: {passwordChangedLabel}</div>
          </div>
          <ChevronRight size={16} className={styles.chevron} />
        </button>

        <button className={styles.row} onClick={() => { logout(); }}>
          <div className={styles.iconTile}><LogOut size={16} /></div>
          <div className={styles.rowMain}>
            <div className={styles.rowTitle}>Sign Out</div>
          </div>
          <ChevronRight size={16} className={styles.chevron} />
        </button>
      </div>

      {/* Billing */}
      <div className={styles.sectionLabel}>Subscription</div>
      <div className={`${styles.group} ${styles.groupBorder}`}>
        <div className={styles.row}>
          <div className={styles.iconTile}><Shield size={16} /></div>
          <div className={styles.rowMain}>
            <div className={styles.rowTitle}>Current Plan</div>
          </div>
          <span className={styles.rowValue}>
            {planName}
            {user?.plan && user.plan !== 'free' ? ` · $${planPrice}/mo` : ''}
          </span>
        </div>

        <button className={styles.row} onClick={() => (window.location.href = '/dashboard/billing')}>
          <div className={styles.iconTile}><CreditCard size={16} /></div>
          <div className={styles.rowMain}>
            <div className={styles.rowTitle}>Manage Subscription</div>
          </div>
          <ChevronRight size={16} className={styles.chevron} />
        </button>
      </div>
      <p className={styles.sectionFooter}>
        {user?.plan === 'free' || !user?.plan
          ? 'You are on the Free plan. Upgrade anytime from the Billing page.'
          : 'Your plan renews monthly. Manage payment details in Billing.'}
      </p>

      {/* Danger */}
      <div className={styles.sectionLabel}>Danger Zone</div>
      <div className={`${styles.group} ${styles.groupBorder}`}>
        <button className={styles.row} onClick={() => setShowDeleteModal(true)}>
          <div className={styles.iconTile}><Trash2 size={16} /></div>
          <div className={styles.rowMain}>
            <div className={`${styles.rowTitle} ${styles.dangerText}`}>Delete Account</div>
            <div className={styles.rowSub}>Permanently remove all data. This cannot be undone.</div>
          </div>
          <ChevronRight size={16} className={styles.chevron} />
        </button>
      </div>

      {/* Change Password — iOS alert */}
      {showPasswordModal && (
        <div className={styles.alertOverlay} onClick={() => !pwBusy && setShowPasswordModal(false)} role="dialog" aria-modal="true">
          <div className={styles.alert} onClick={(e) => e.stopPropagation()}>
            <div className={styles.alertBody}>
              <div className={styles.alertTitle}>Change Password</div>
              <div className={styles.alertMessage}>Enter your current password and choose a new one.</div>
              <div className={styles.alertFields}>
                <input
                  className={styles.fieldInput}
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                />
                <input
                  className={styles.fieldInput}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 6 characters)"
                />
                <input
                  className={styles.fieldInput}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className={styles.alertActions}>
              <button className={styles.alertAction} onClick={() => setShowPasswordModal(false)} disabled={pwBusy}>
                Cancel
              </button>
              <button className={`${styles.alertAction} ${styles.alertActionBold}`} onClick={handleChangePassword} disabled={pwBusy}>
                {pwBusy ? <Loader2 size={15} className="lucide-spin" style={{ margin: '0 auto' }} /> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account — iOS alert */}
      {showDeleteModal && (
        <div className={styles.alertOverlay} onClick={() => !delBusy && setShowDeleteModal(false)} role="dialog" aria-modal="true">
          <div className={styles.alert} onClick={(e) => e.stopPropagation()}>
            <div className={styles.alertBody}>
              <div className={styles.alertTitle}>Delete Account?</div>
              <div className={styles.alertMessage}>
                This permanently removes your API keys, usage history, conversations, transactions, and referral submissions. This action cannot be undone.
              </div>
            </div>
            <div className={styles.alertActions}>
              <button className={styles.alertAction} onClick={() => setShowDeleteModal(false)} disabled={delBusy}>
                Cancel
              </button>
              <button className={`${styles.alertAction} ${styles.alertActionDestructive}`} onClick={handleDeleteAccount} disabled={delBusy}>
                {delBusy ? <Loader2 size={15} className="lucide-spin" style={{ margin: '0 auto' }} /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
