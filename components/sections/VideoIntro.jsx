'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import content from '@/data/content.json'
import styles from '@/styles/sections/VideoIntro.module.css'

function scrollNext() {
  const main = document.querySelector('main')
  if (main) main.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
}

export default function VideoIntro() {
  const videoRef  = useRef(null)
  const greetRef  = useRef(null)
  const nameRef   = useRef(null)
  const roleRef   = useRef(null)
  const ctaRef    = useRef(null)
  const scrollRef = useRef(null)

    const [muted,    setMuted]    = useState(false)
  const [typeText, setTypeText] = useState('')

  // ── Typewriter ─────────────────────────────────────────
  useEffect(() => {
    const full = 'Explore my work ↑'
    let i = 0, t
    function tick() {
      if (i <= full.length) { setTypeText(full.slice(0, i++)); t = setTimeout(tick, 60) }
    }
    const d = setTimeout(tick, 3000)
    return () => { clearTimeout(d); clearTimeout(t) }
  }, [])

  // ── Text entrance ───────────────────────────────────────
  useEffect(() => {
    gsap.set([greetRef.current, nameRef.current, roleRef.current, ctaRef.current], {
      opacity: 0, y: 22,
    })
    gsap.set(scrollRef.current, { opacity: 0 })

    const tl = gsap.timeline({ delay: 0.8 })
    tl.to(greetRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
      .to(nameRef.current,  { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, '-=0.25')
      .to(roleRef.current,  { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '-=0.35')
      .to(ctaRef.current,   { opacity: 1, y: 0, duration: 0.4,  ease: 'power2.out' }, '-=0.2')
      .to(scrollRef.current,{ opacity: 1, duration: 0.4 }, '-=0.1')

    return () => tl.kill()
  }, [])

  // ── Video: autoplay unmuted, fallback to muted + unmute on interaction ──
  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return

    vid.muted = false
    vid.loop  = true
    vid.playsInline = true

    let cleanedUp = false
    let cleanupListeners = () => {}

    vid.play()
      .then(() => {
        setMuted(false)
      })
      .catch(() => {
        // Browser blocked unmuted autoplay. Fallback to muted visual play.
        vid.muted = true
        setMuted(true)
        vid.play().catch(() => {})

        const unmuteOnInteraction = () => {
          if (cleanedUp) return
          vid.muted = false
          setMuted(false)
          vid.play().catch(() => {})
          cleanupListeners()
        }

        cleanupListeners = () => {
          cleanedUp = true
          window.removeEventListener('click', unmuteOnInteraction)
          window.removeEventListener('touchstart', unmuteOnInteraction)
          window.removeEventListener('keydown', unmuteOnInteraction)
          window.removeEventListener('scroll', unmuteOnInteraction)
        }

        window.addEventListener('click', unmuteOnInteraction)
        window.addEventListener('touchstart', unmuteOnInteraction)
        window.addEventListener('keydown', unmuteOnInteraction)
        window.addEventListener('scroll', unmuteOnInteraction)
      })

    return () => {
      cleanupListeners()
    }
  }, [])

  function toggleMute() {
    const vid = videoRef.current
    if (!vid) return
    vid.muted = !vid.muted
    setMuted(vid.muted)
  }

  return (
    <section className={styles.section}>

      {/* ── VIDEO — full screen ── */}
      <div className={styles.videoBg}>
        <video
          ref={videoRef}
          className={styles.videoEl}
          src="/assets/now_create_a_video_like_introd.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        {/* Lighter overlay */}
        <div className={styles.videoOverlay} />
        {/* Narrow left panel fade only for text legibility */}
        <div className={styles.leftFade} />
        {/* Cinematic letterbox */}
        <div className={styles.cinemaTop}    />
        <div className={styles.cinemaBottom} />
      </div>

      {/* Subtle scanlines */}
      <div className={styles.scanlines} aria-hidden />

      {/* ── Sound toggle (bottom-right) ── */}
      <button
        className={`${styles.muteBtn} ${muted ? styles.muteBtnMuted : ''}`}
        onClick={toggleMute}
        aria-label={muted ? 'Unmute video' : 'Mute video'}
      >
        {muted ? (
          <>
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
            <span>Tap for sound</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <span>Sound on</span>
          </>
        )}
      </button>

      {/* ── Text overlay (bottom-left) ── */}
      <div className={styles.heroContent}>

        <p ref={greetRef} className={styles.eyebrow}>{content.site.tagline}</p>

        <div className={styles.hiLine}>
          <span className={styles.waveEmoji}>👋</span>
          <span>Hi, my name is</span>
        </div>

        <h1 ref={nameRef} className={styles.name}>
          {profile.name.first} {profile.name.last}
        </h1>

        <p ref={roleRef} className={styles.role}>{profile.roles.short}</p>

        <div ref={ctaRef} className={styles.ctaWrap}>
          <button className={styles.ctaBtn} onClick={scrollNext}>
            <span className={styles.typeText}>
              {typeText}<span className={styles.cursor}>|</span>
            </span>
          </button>
        </div>

      </div>

      {/* ── Scroll cue ── */}
      <button ref={scrollRef} className={styles.scrollCue} onClick={scrollNext} aria-label="Scroll up">
        <span className={styles.scrollLabel}>Slide Up</span>
        <span className={styles.scrollLine} />
      </button>

    </section>
  )
}
