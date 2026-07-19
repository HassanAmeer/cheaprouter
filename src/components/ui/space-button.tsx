import React from 'react';
import Link from 'next/link';
import styles from './space-button.module.css';

interface SpaceButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'primary' | 'outline';
}

export function SpaceButton({ children, href, onClick, className, style, variant = 'primary' }: SpaceButtonProps) {
  const containerClass = variant === 'outline' 
    ? `${styles.btnContainer} ${styles.btnContainerOutline} ${className || ''}`
    : `${styles.btnContainer} ${className || ''}`;

  const content = (
    <div className={containerClass} style={style} onClick={onClick}>
      <button className={styles.spaceBtn}>
        <span>{children}</span>
        <div className={`${styles.star} ${styles.star1}`}></div>
        <div className={`${styles.star} ${styles.star2}`}></div>
        <div className={`${styles.star} ${styles.star3}`}></div>
        <div className={`${styles.star} ${styles.star4}`}></div>
        <div className={`${styles.star} ${styles.star5}`}></div>
        <div className={`${styles.star} ${styles.star6}`}></div>
        <div className={`${styles.shootingStar} ${styles.shootingStar1}`}></div>
        <div className={`${styles.shootingStar} ${styles.shootingStar2}`}></div>
        <div className={`${styles.shootingStar} ${styles.shootingStar3}`}></div>
        <div className={`${styles.shootingStar} ${styles.shootingStar4}`}></div>
      </button>
    </div>
  );

  if (href) {
    return <Link href={href} prefetch={false} style={{ textDecoration: 'none', display: 'block', width: '100%' }}>{content}</Link>;
  }

  return content;
}
