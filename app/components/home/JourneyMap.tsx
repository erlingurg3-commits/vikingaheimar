"use client"

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useScrollReveal } from '@/app/components/hooks/useScrollReveal'

const ROAD_PATH =
  "M 280,560 C 320,480 380,460 440,400 C 500,340 480,280 560,240 C 640,200 720,220 800,180 C 880,140 940,100 1040,80 C 1120,65 1220,55 1320,60"

export default function JourneyMap() {
  const { ref: sectionRef, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.08 })
  const measureRef = useRef<SVGPathElement>(null)
  const [pathLength, setPathLength] = useState(0)
  const [drawn, setDrawn] = useState(false)
  const [buildingVisible, setBuildingVisible] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Measure path length and detect motion preference once on mount
  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    if (measureRef.current) {
      setPathLength(measureRef.current.getTotalLength())
    }
  }, [])

  // Trigger road draw when section enters viewport
  useEffect(() => {
    if (!isVisible) return
    if (reducedMotion) {
      setDrawn(true)
      setBuildingVisible(true)
      return
    }
    setDrawn(true)
    const timer = setTimeout(() => setBuildingVisible(true), 2400)
    return () => clearTimeout(timer)
  }, [isVisible, reducedMotion])

  const dashOffset = drawn ? 0 : pathLength
  const roadTransition =
    !reducedMotion && pathLength > 0
      ? 'stroke-dashoffset 2400ms cubic-bezier(0.25,0.1,0.25,1)'
      : 'none'

  return (
    <div
      ref={sectionRef as RefObject<HTMLDivElement>}
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(360px, 48vw, 580px)',
        backgroundColor: '#f5f3ee',
        overflow: 'hidden',
      }}
    >
      {/* ── Layer 1: Sword image — bottom-left anchor ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: 'clamp(120px, 16vw, 220px)',
          height: '85%',
          zIndex: 2,
          opacity: 0.22,
          mixBlendMode: 'multiply',
        }}
      >
        <Image
          src="/sword.png"
          alt=""
          fill
          priority
          sizes="220px"
          style={{
            objectFit: 'contain',
            objectPosition: 'bottom left',
            filter: 'sepia(0.3)',
          }}
        />
      </div>

      {/* ── Layer 2: Animated road SVG ── */}
      <svg
        viewBox="0 0 1400 580"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 3,
        }}
        aria-hidden="true"
      >
        {/* Hidden path used only to measure total length */}
        <path
          ref={measureRef}
          d={ROAD_PATH}
          stroke="none"
          fill="none"
          style={{ visibility: 'hidden' }}
        />

        {/* Outer road — solid, wider */}
        <path
          d={ROAD_PATH}
          stroke="#c8874a"
          strokeWidth={3}
          fill="none"
          opacity={0.35}
          strokeLinecap="round"
          strokeDasharray={pathLength || undefined}
          strokeDashoffset={pathLength ? dashOffset : undefined}
          style={{ transition: roadTransition }}
        />

        {/* Inner road — dashed centre line */}
        <path
          d={ROAD_PATH}
          stroke="#c8874a"
          strokeWidth={1.5}
          fill="none"
          opacity={0.55}
          strokeLinecap="round"
          strokeDasharray={pathLength ? `12 8` : '12 8'}
          strokeDashoffset={pathLength ? dashOffset : undefined}
          style={{ transition: roadTransition }}
        />
      </svg>

      {/* ── Layer 3: Museum building — top-right destination ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 24,
          right: 48,
          zIndex: 4,
          transition: 'opacity 600ms ease, transform 600ms ease',
          opacity: buildingVisible ? 0.55 : 0,
          transform: buildingVisible ? 'scale(1)' : 'scale(0.8)',
        }}
      >
        <svg
          viewBox="0 0 120 80"
          style={{ width: 'clamp(80px, 8vw, 120px)', height: 'auto', display: 'block' }}
          fill="none"
          stroke="#c8874a"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Main building */}
          <rect x={10} y={20} width={80} height={50} />
          {/* Roof */}
          <polyline points="5,20 60,8 115,20" />
          {/* Door */}
          <rect x={42} y={45} width={16} height={25} />
          {/* Windows */}
          <rect x={18} y={28} width={14} height={12} />
          <rect x={88} y={28} width={14} height={12} />
          {/* Flag pole */}
          <line x1={60} y1={8} x2={60} y2={0} />
          {/* Flag */}
          <path d="M60,0 L72,4 L60,8" />
        </svg>
      </div>

      {/* ── Layer 4: Top gradient fade ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          background: 'linear-gradient(to bottom, #f5f3ee, transparent)',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />

      {/* ── Layer 4: Bottom gradient fade ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background: 'linear-gradient(to top, #f5f3ee, transparent)',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
