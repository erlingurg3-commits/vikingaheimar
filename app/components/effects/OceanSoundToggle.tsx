"use client";

import { useState, useRef } from "react";

/**
 * OceanSoundToggle — fixed bottom-right ambient sound button.
 *
 * Default state: MUTED (never autoplays).
 * First click plays /viking drums.m4a on loop.
 * Respects browser autoplay policies — audio only starts on user gesture.
 */
export default function OceanSoundToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    audio.volume = 0.6;
    audio.muted = false;

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.warn("OceanSoundToggle: audio play blocked", error);
      setIsPlaying(false);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={encodeURI("/viking drums.m4a")}
        loop
        preload="metadata"
      />

      <div
        className="group"
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 50,
        }}
      >
        {/* Tooltip — visible on group hover */}
        <span
          className="pointer-events-none absolute right-0 whitespace-nowrap font-text opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{
            bottom: 52,
            background: "rgba(15,13,10,0.90)",
            color: "rgba(255,255,255,0.75)",
            fontSize: 11,
            letterSpacing: "0.06em",
            padding: "5px 10px",
            borderRadius: 3,
          }}
          aria-hidden="true"
        >
          Viking drums
        </span>

        {/* Toggle button */}
        <button
          onClick={toggle}
          aria-label={
            isPlaying ? "Mute Viking drums" : "Play Viking drums"
          }
          aria-pressed={isPlaying}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "rgba(15,13,10,0.80)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(12px)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 300ms, border-color 300ms",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(15,13,10,0.95)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(15,13,10,0.80)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
          }}
        >
          {isPlaying ? <IconSpeakerOn /> : <IconSpeakerOff />}
        </button>
      </div>
    </>
  );
}

function IconSpeakerOn() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="rgba(255,255,255,0.65)"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 7 L6 7 L10.5 3 L10.5 17 L6 13 L2.5 13 Z" />
      <path d="M13.5 7 Q16 10 13.5 13" fill="none" />
      <path d="M15 4.5 Q19 10 15 15.5" fill="none" />
    </svg>
  );
}

function IconSpeakerOff() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="rgba(255,255,255,0.65)"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 7 L6 7 L10.5 3 L10.5 17 L6 13 L2.5 13 Z" />
      <line x1="3" y1="3" x2="17" y2="17" />
    </svg>
  );
}
