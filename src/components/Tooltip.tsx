'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Tooltip({
  text,
  children,
}: {
  text: string
  children: React.ReactNode
}) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const ref = useRef<HTMLSpanElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  function updatePos() {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPos({
      top: rect.top + window.scrollY - 8,
      left: rect.left + rect.width / 2,
    })
    setShow(true)
  }

  return (
    <>
      <span
        ref={ref}
        className="inline-flex items-center gap-1 cursor-help"
        onMouseEnter={updatePos}
        onMouseLeave={() => setShow(false)}
        onClick={() => show ? setShow(false) : updatePos()}
      >
        {children}
        <svg className="w-3.5 h-3.5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </span>
      {show && mounted && createPortal(
        <span
          className="fixed z-[9999] -translate-x-1/2 -translate-y-full px-3 py-1.5 text-xs font-normal normal-case tracking-normal text-white bg-gray-900 rounded-lg whitespace-nowrap shadow-lg pointer-events-none"
          style={{ top: pos.top, left: pos.left }}
        >
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
        </span>,
        document.body
      )}
    </>
  )
}
