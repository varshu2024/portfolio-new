'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/ProjectsSection.module.css'

const PROJECTS = profile.projects

export default function ProjectsSection() {
  const sectionRef  = useRef(null)
  const trackRef    = useRef(null)
  const slideRefs   = useRef([])
  const contentRefs = useRef([])
  const bgRefs      = useRef([])
  const counterRef  = useRef(null)
  const progressRef = useRef(null)
  const [slideIdx, setSlideIdx] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    const track   = trackRef.current
    if (!section || !track) return

    const scroller = document.querySelector('main')
    if (!scroller) return

    const n = PROJECTS.length
    slideRefs.current   = slideRefs.current.slice(0, n)
    contentRefs.current = contentRefs.current.slice(0, n)
    bgRefs.current      = bgRefs.current.slice(0, n)

    // Set initial position of slides: Slide 0 at 0, Slides 1+ stacked above (-100%)
    PROJECTS.forEach((_, i) => {
      if (slideRefs.current[i]) {
        if (i === 0) {
          gsap.set(slideRefs.current[i], { yPercent: 0, zIndex: 1 })
          if (contentRefs.current[i]) gsap.set(contentRefs.current[i], { opacity: 1, y: 0 })
        } else {
          gsap.set(slideRefs.current[i], { yPercent: -100, zIndex: i + 1 })
          if (contentRefs.current[i]) gsap.set(contentRefs.current[i], { opacity: 0, y: 30 })
        }
      }
    })

    const tl = gsap.timeline({ paused: true })

    // Create transitions for each slide sliding down
    for (let i = 0; i < n - 1; i++) {
      const nextSlide = slideRefs.current[i + 1]
      const currContent = contentRefs.current[i]
      const nextContent = contentRefs.current[i + 1]
      const nextBg = bgRefs.current[i + 1]

      // Slide down animation: next slide enters from -100% to 0%
      tl.to(nextSlide, {
        yPercent: 0,
        duration: 1.0,
        ease: 'power2.inOut',
      }, i)

      // Parallax effect on the background image: starts offset at 30% and aligns as slide lands
      if (nextBg) {
        tl.fromTo(nextBg,
          { yPercent: 30 },
          { yPercent: 0, duration: 1.0, ease: 'power2.inOut' },
          i
        )
      }

      // Current content fades out as the new slide covers it
      if (currContent) {
        tl.to(currContent, {
          opacity: 0,
          y: 40,
          duration: 0.45,
          ease: 'power2.in',
        }, i)
      }

      // Next content slides and fades in as the slide settles
      if (nextContent) {
        tl.set(nextContent, { opacity: 1, y: 0 }, i + 0.3)

        const meta  = nextContent.querySelector(`.${styles.meta}`)
        const title = nextContent.querySelector(`.${styles.title}`)
        const sub   = nextContent.querySelector(`.${styles.subtitle}`)
        const desc  = nextContent.querySelector(`.${styles.desc}`)
        const tags  = nextContent.querySelectorAll(`.${styles.tag}`)
        const btn   = nextContent.querySelector(`.${styles.liveBtn}`)

        if (meta) {
          tl.fromTo(meta,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
            i + 0.4
          )
        }
        if (title) {
          tl.fromTo(title,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.55, ease: 'expo.out' },
            i + 0.45
          )
        }
        if (sub) {
          tl.fromTo(sub,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' },
            i + 0.5
          )
        }
        if (desc) {
          tl.fromTo(desc,
            { y: 25, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
            i + 0.55
          )
        }
        if (tags.length) {
          tl.fromTo(tags,
            { y: 15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out', stagger: 0.04 },
            i + 0.6
          )
        }
        if (btn) {
          tl.fromTo(btn,
            { y: 15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
            i + 0.65
          )
        }
      }
    }

    const st = ScrollTrigger.create({
      trigger:  section,
      scroller,
      start:    'top top',
      end:      () => `+=${(n - 1) * window.innerHeight}`,
      onUpdate: (self) => {
        tl.progress(self.progress)

        // Calculate the closest active slide index based on scroll position
        const currentScroll = scroller.scrollTop
        const activeIdx = Math.min(n - 1, Math.max(0, Math.round((currentScroll - 3 * window.innerHeight) / window.innerHeight)))
        
        setSlideIdx(prev => prev !== activeIdx ? activeIdx : prev)

        if (progressRef.current) {
          gsap.set(progressRef.current, {
            scaleX: self.progress, transformOrigin: 'left center', overwrite: true,
          })
        }

        if (counterRef.current) {
          counterRef.current.textContent = `0${activeIdx + 1}`
        }
      },
    })

    return () => st.kill()
  }, [])

  const handleNextSlide = () => {
    const scroller = document.querySelector('main')
    if (!scroller) return

    const nextIdx = slideIdx + 1
    const targetIdx = 3 + nextIdx

    // Use native smooth scrolling for guaranteed cross-browser compatibility
    scroller.scrollTo({
      top: targetIdx * window.innerHeight,
      behavior: 'smooth'
    })
  }

  const handleSlideClick = (e) => {
    if (e.target.closest('a') || e.target.closest('button')) {
      return
    }
    handleNextSlide()
  }

  return (
    <div style={{ height: `${PROJECTS.length * 100}vh` }}>
      <section ref={sectionRef} className={styles.section}>

        {/* Top bar */}
        <div className={styles.topBar}>
          <span className={styles.sectionLabel}>Featured Work</span>
          <div className={styles.counter}>
            <span ref={counterRef} className={styles.cCur}>01</span>
            <span className={styles.cSep}> / </span>
            <span className={styles.cTot}>0{PROJECTS.length}</span>
          </div>
        </div>

        {/* Vertical stacking track */}
        <div ref={trackRef} className={styles.track}>
          {PROJECTS.map((proj, i) => (
            <div
              key={proj.id}
              ref={el => { slideRefs.current[i] = el }}
              className={styles.slide}
              onClick={handleSlideClick}
            >

              <div className={styles.slideBg}>
                <div
                  ref={el => { bgRefs.current[i] = el }}
                  className={styles.bgParallaxContainer}
                >
                  <Image
                    src={proj.image}
                    alt={proj.title}
                    fill
                    quality={100}
                    sizes="100vw"
                    className={styles.slideImg}
                    priority={i === 0}
                  />
                </div>
                <div className={styles.slideOverlayLeft}   aria-hidden />
                <div className={styles.slideOverlayBottom} aria-hidden />
                <div className={styles.slideVignette}      aria-hidden />
              </div>

              <span className={styles.slideNum} aria-hidden>0{i + 1}</span>

              <div
                ref={el => { contentRefs.current[i] = el }}
                className={styles.slideContent}
              >
                <div className={styles.slideLeft}>
                  <div className={styles.meta}>
                    <span className={styles.typeTag}>{proj.type}</span>
                  </div>
                  <h2 className={styles.title}>{proj.title}</h2>
                  <p  className={styles.subtitle}>{proj.subtitle}</p>
                  <a
                    href={proj.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.liveBtn}
                  >
                    <span>Live Demo</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>

                <div className={styles.slideRight}>
                  <p className={styles.desc}>{proj.desc}</p>
                  <div className={styles.stack}>
                    {proj.tech.map(t => (
                      <span key={t} className={styles.tag}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className={styles.bottomUI}>
          <div className={styles.progressTrack}>
            <div ref={progressRef} className={styles.progressBar} />
          </div>
        </div>

        {/* Next Slide / Down Arrow Button */}
        <button
          className={styles.nextSlideBtn}
          onClick={handleNextSlide}
          aria-label={slideIdx < PROJECTS.length - 1 ? "Next Project" : "View Experience"}
        >
          <span className={styles.nextSlideLabel}>
            {slideIdx < PROJECTS.length - 1 ? "Next Project" : "View Experience"}
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={`${styles.nextSlideChevron} ${slideIdx === PROJECTS.length - 1 ? styles.lastSlideChevron : ''}`}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

      </section>
    </div>
  )
}
