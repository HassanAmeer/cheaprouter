"use client";
import { PixelatedCanvas } from "./ui/pixelated-canvas";
import profileImage from "../../assets/profilehasan.png";

export function PixelatedCanvasDemo() {
  return (
    <div style={{ padding: '80px 0', textAlign: 'center' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: '9999px',
          background: 'var(--color-primary-soft)', color: 'var(--color-primary)',
          fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.5px', marginBottom: '16px'
        }}>
          <span style={{ fontSize: '14px' }}>✨</span> Our Team
        </div>
        <h2 style={{
          fontSize: '36px', fontWeight: 800, marginBottom: '12px',
          color: 'var(--color-text-main)', letterSpacing: '-0.5px'
        }}>
          Meet the Founder
        </h2>
        <p style={{
          color: 'var(--color-text-muted)', fontSize: '16px',
          lineHeight: 1.7, marginBottom: '40px', maxWidth: '480px', margin: '0 auto 40px'
        }}>
          The person behind CheapModels — building the future of unified AI access.
        </p>
        <div style={{ border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden', display: 'inline-block', maxWidth: '100%' }}>
          <PixelatedCanvas
            src={profileImage.src}
            width={500}
            height={500}
            cellSize={2}
            dotScale={1}
            shape="square"
            backgroundColor="transparent"
            dropoutStrength={0.4}
            interactive
            distortionStrength={3}
            distortionRadius={80}
            distortionMode="swirl"
            followSpeed={0.2}
            jitterStrength={4}
            jitterSpeed={4}
            sampleAverage
            tintColor="#FFFFFF"
            tintStrength={0.15}
            className="rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}
