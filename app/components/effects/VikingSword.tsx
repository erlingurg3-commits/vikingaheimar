"use client"

import Image from 'next/image'

export default function VikingSword() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 0 24px',
        backgroundColor: '#f5f3ee',
      }}
    >
      <div style={{ position: 'relative', width: '100%', maxWidth: 600, height: 280 }}>
        <Image
          src="/sword.png"
          alt="The sword monument standing at Víkingaheimar"
          fill
          priority
          style={{
            objectFit: 'contain',
            objectPosition: 'top',
            opacity: 0.40,
            mixBlendMode: 'multiply',
          }}
        />
      </div>

      <p style={{
        marginTop: 24,
        fontFamily: 'var(--font-text), sans-serif',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.20em',
        textTransform: 'uppercase',
        color: 'rgba(200,135,74,0.50)',
      }}>
        Víkingaheimar · Reykjanesbær
      </p>
    </div>
  )
}
