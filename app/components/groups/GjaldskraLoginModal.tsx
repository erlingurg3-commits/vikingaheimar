"use client";

import { useEffect, useRef, useState } from "react";

const VALID_USER = "viking";
const VALID_PASS = "viking";

export default function GjaldskraLoginModal({
  onSuccess,
  onClose,
}: {
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);
  const userRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    userRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (user.trim().toLowerCase() === VALID_USER && pass === VALID_PASS) {
      onSuccess();
    } else {
      setError(true);
      setPass("");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,25,35,0.7)] p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[340px] bg-white rounded shadow-[0_8px_40px_rgba(0,0,0,0.28)] overflow-hidden"
      >
        {/* Header */}
        <div className="px-7 pt-6 pb-4 border-b border-[#e5e5e3] flex justify-between items-start">
          <div>
            <h2 className="text-[15px] font-semibold text-[#1a1a1a]">Gjaldskrá</h2>
            <p className="text-[11px] text-[#999] mt-0.5 tracking-[0.03em]">Skráðu þig inn til að skoða</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[20px] leading-none text-[#aaa] hover:text-[#333] transition-colors mt-[-1px]"
          >
            ×
          </button>
        </div>

        {/* Fields */}
        <div className="px-7 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[0.14em] text-[#888] font-medium">
              Notandanafn
            </label>
            <input
              ref={userRef}
              type="text"
              value={user}
              onChange={(e) => { setUser(e.target.value); setError(false); }}
              autoComplete="username"
              className="border border-[#ddd] rounded-[3px] px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-[#3a4a5c] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[0.14em] text-[#888] font-medium">
              Lykilorð
            </label>
            <input
              type="password"
              value={pass}
              onChange={(e) => { setPass(e.target.value); setError(false); }}
              autoComplete="current-password"
              className="border border-[#ddd] rounded-[3px] px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-[#3a4a5c] transition-colors"
            />
          </div>

          {error && (
            <p className="text-[12px] text-red-500">Rangt notandanafn eða lykilorð.</p>
          )}
        </div>

        {/* Submit */}
        <div className="px-7 pb-6">
          <button
            type="submit"
            className="w-full bg-[#3a4a5c] hover:bg-[#2c3a4a] text-white text-[13px] font-semibold py-2.5 rounded-[4px] transition-colors"
          >
            Innskrá
          </button>
        </div>
      </form>
    </div>
  );
}
