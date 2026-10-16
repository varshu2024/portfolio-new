
'use client'

import { useEffect, useRef, useState, Fragment } from 'react'
import Image from 'next/image'
import * as THREE from 'three'
import { gsap } from '@/lib/gsap'
import {
  FaGithub, FaLinkedinIn, FaMedium, FaInstagram, FaYoutube, FaEnvelope,
} from 'react-icons/fa'
import { FiArrowUpRight, FiChevronDown } from 'react-icons/fi'
import profile from '@/data/profile.json'
import content from '@/data/content.json'
import styles from '@/styles/sections/PublicationsFooterSection.module.css'

const PUBS = profile.publications

const SOCIAL_ICONS = {
  GitHub:    <FaGithub    size={13} />,
  LinkedIn:  <FaLinkedinIn  size={13} />,
  Medium:    <FaMedium    size={13} />,
  Instagram: <FaInstagram size={13} />,
  YouTube:   <FaYoutube   size={13} />,
}

const MOBILE_SOCIAL_ICONS = {
  GitHub:    <FaGithub    size={20} />,
  LinkedIn:  <FaLinkedinIn  size={20} />,
  Instagram: <FaInstagram size={20} />,
}
const HERO_SOCIAL_LABELS = ['GitHub', 'LinkedIn', 'Instagram']

const VID_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const VID_FRAG = `
  uniform sampler2D uVideo;
  uniform float uOpacity;
  uniform float uVideoAspect;
  uniform float uCanvasAspect;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv;
    if (uCanvasAspect > uVideoAspect) {
      float s = uVideoAspect / uCanvasAspect;
      uv.y = (vUv.y - 0.5) * s + 0.5;
    } else {
      float s = uCanvasAspect / uVideoAspect;
      uv.x = (vUv.x - 0.5) * s + 0.5;
    }
    vec4 tex = texture2D(uVideo, uv);
    float fadeY =
      smoothstep(0.0, 0.05, uv.y) *
      smoothstep(1.0, 0.95, uv.y);
    float alpha = fadeY * uOpacity;
    float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    vec3 col = mix(vec3(lum), tex.rgb, 0.72);
    float vx = smoothstep(0.0, 0.38, abs(uv.x - 0.5) * 2.0);
    vec3 dark = vec3(0.008, 0.008, 0.008);
    col = mix(col, dark, vx * 0.82);
    col *= 0.68;
    gl_FragColor = vec4(col, alpha);
  }
`

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

function handleViewProjects() {
  const scroller = document.querySelector('main')
  if (scroller) gsap.to(scroller, { scrollTop: 3 * window.innerHeight, duration: 1.0, ease: 'power3.inOut' })
}

export default function PublicationsFooterSection() {
  const [metrics, setMetrics] = useState({
    inference: '14.2ms',
    faiss: 'READY',
    attention: 'ACTIVE',
    loss: '0.0421'
  })

  const [footerMuted, setFooterMuted] = useState(true)

  const handleCoreClick = () => {
    const inferences = ['12.8ms', '14.5ms', '13.1ms', '15.2ms', '11.9ms']
    const losses = ['0.0418', '0.0425', '0.0399', '0.0411', '0.0430']
    const indices = ['READY', 'SYNCED', 'OPTIMIZED', 'INDEXED']
    const attentionModes = ['ACTIVE', 'CROSS-FUSION', 'MULTI-HEAD', 'TRANSFORM']
    
    setMetrics({
      inference: inferences[Math.floor(Math.random() * inferences.length)],
      faiss: indices[Math.floor(Math.random() * indices.length)],
      attention: attentionModes[Math.floor(Math.random() * attentionModes.length)],
      loss: losses[Math.floor(Math.random() * losses.length)]
    })
  }

  const toggleFooterMute = () => {
    const vid = footerVideoRef.current
    if (!vid) return
    vid.muted = !vid.muted
    setFooterMuted(vid.muted)
  }

  const wrapperRef = useRef(null)
  const stickyRef  = useRef(null)
  const footerVideoRef = useRef(null)
  const footerVideoWrapRef = useRef(null)

  // image
  const imageWrapRef    = useRef(null)
  const imageOverlayRef = useRef(null)

  // publication content
  const pubContentRef = useRef(null)
  const labelRef      = useRef(null)
  const headingRef    = useRef(null)
  const dividerRef    = useRef(null)
  const itemRefs      = useRef([])

  // image-only interstitial
  const interstitialRef = useRef(null)

  // footer
  const canvasRef         = useRef(null)
  const videoSrcRef       = useRef(null)
  const footerContentRef  = useRef(null)
  const leftRef         = useRef(null)
  const rightRef        = useRef(null)
  const bigNameRef      = useRef(null)
  const bottomBarRef    = useRef(null)

  useEffect(() => {
    const wrapper       = wrapperRef.current
    const sticky        = stickyRef.current
    const canvas        = canvasRef.current
    const scroller      = document.querySelector('main')
    if (!wrapper || !sticky || !scroller) return

    const isMobile = window.innerWidth < 768

    let renderer, particlesMaterial, lightMaterial1, lightMaterial2, particles, lightMesh1, lightMesh2
    let rafId
    let onMouseMove = () => {}, onResize = () => {}

    const W = sticky.offsetWidth
    const H = sticky.offsetHeight

    if (!isMobile && canvas) {
      // ── Three.js particle setup ────────────────────────────────
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(W, H)
      renderer.setClearColor(0x000000, 0)

      const scene  = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(60, W / H, 1, 1000)
      camera.position.z = 200

      // Create particle geometry
      const particleCount = 250
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(particleCount * 3)

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * W * 1.5
        positions[i * 3 + 1] = (Math.random() - 0.5) * H * 1.5
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

      const createCircleTexture = () => {
        const c = document.createElement('canvas')
        c.width = 16
        c.height = 16
        const ctx = c.getContext('2d')
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8)
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)')
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 16, 16)
        return new THREE.CanvasTexture(c)
      }

      particlesMaterial = new THREE.PointsMaterial({
        color: 0x6c63ff, // Purple
        size: 3.0,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        map: createCircleTexture()
      })

      particles = new THREE.Points(geometry, particlesMaterial)
      scene.add(particles)

      // Add a couple of glowing background orbs
      const lightGeometry = new THREE.SphereGeometry(30, 16, 16)
      
      lightMaterial1 = new THREE.MeshBasicMaterial({
        color: 0x6c63ff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
      })
      lightMesh1 = new THREE.Mesh(lightGeometry, lightMaterial1)
      lightMesh1.position.set(-W/3, H/3, -50)
      scene.add(lightMesh1)

      lightMaterial2 = new THREE.MeshBasicMaterial({
        color: 0xf7931e, // Accent orange
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
      })
      lightMesh2 = new THREE.Mesh(lightGeometry, lightMaterial2)
      lightMesh2.position.set(W/3, -H/3, -50)
      scene.add(lightMesh2)

      const mx = { tx: 0, ty: 0, x: 0, y: 0 }
      onMouseMove = function(e) {
        const r = sticky.getBoundingClientRect()
        mx.tx = (e.clientX - r.left) / r.width  - 0.5
        mx.ty = (e.clientY - r.top)  / r.height - 0.5
      }
      sticky.addEventListener('mousemove', onMouseMove)

      onResize = function() {
        const w = sticky.offsetWidth
        const h = sticky.offsetHeight
        renderer.setSize(w, h)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      window.addEventListener('resize', onResize)

      function tick() {
        rafId = requestAnimationFrame(tick)
        
        particles.rotation.y += 0.0006
        particles.rotation.x += 0.0003

        const time = Date.now() * 0.0008
        lightMesh1.position.x = -W/3 + Math.sin(time) * 15
        lightMesh1.position.y = H/3 + Math.cos(time) * 15

        lightMesh2.position.x = W/3 + Math.cos(time * 0.8) * 15
        lightMesh2.position.y = -H/3 + Math.sin(time * 0.8) * 15

        mx.x += (mx.tx - mx.x) * 0.04
        mx.y += (mx.ty - mx.y) * 0.04
        camera.position.x = mx.x * 40
        camera.position.y = mx.y * -40
        camera.lookAt(scene.position)

        renderer.render(scene, camera)
      }
      tick()
    }

    // ── Publication entry animation ───────────────────────────
    let pubAnimDone = false

    function resetPubAnim() {
      pubAnimDone = false
      gsap.set(labelRef.current,   { opacity: 0, y: -16, rotateX: 40, transformPerspective: 500, transformOrigin: '50% 0%' })
      gsap.set(headingRef.current, { opacity: 0, y: -30, rotateX: 35, transformPerspective: 700, transformOrigin: '50% 0%' })
      gsap.set(dividerRef.current, { scaleX: 0, transformOrigin: 'left center' })
      itemRefs.current.forEach(el => {
        if (el) gsap.set(el, { opacity: 0, y: 28, rotateX: 18, transformPerspective: 900, transformOrigin: '50% 0%' })
      })
    }

    function playPubAnim() {
      if (pubAnimDone) return
      pubAnimDone = true
      gsap.to(labelRef.current,   { opacity: 1, y: 0, rotateX: 0, duration: 0.55, ease: 'power3.out' })
      gsap.to(headingRef.current, { opacity: 1, y: 0, rotateX: 0, duration: 0.75, ease: 'expo.out', delay: 0.08 })
      gsap.to(dividerRef.current, { scaleX: 1, duration: 0.7, ease: 'power2.inOut', delay: 0.25 })
      itemRefs.current.forEach((el, i) => {
        if (el) gsap.to(el, { opacity: 1, y: 0, rotateX: 0, duration: 0.6, ease: 'power3.out', delay: 0.32 + i * 0.1 })
      })
    }

    // ── Initial image position (full-width background) ───────
    function setImageLeft() {
      const vw = window.innerWidth
      gsap.set(imageWrapRef.current, { width: vw, x: 0, opacity: 1 })
      if (imageOverlayRef.current) gsap.set(imageOverlayRef.current, { opacity: 1 })
    }

    // ── Scroll-driven animation ───────────────────────────────
    function onScroll() {
      const vh   = window.innerHeight
      const dist = -wrapper.getBoundingClientRect().top

      // Entry: play pub animation when section first enters view
      if (dist > -vh * 0.5 && dist < vh * 0.35) {
        playPubAnim()
      } else if (dist < -vh * 0.4) {
        resetPubAnim()
        setImageLeft()
      }

      // 300vh wrapper → 2 viewports of scroll travel
      const p = Math.max(0, Math.min(1, dist / (2 * vh)))

      // ── Phase 1: pub text fades out ──────────────────────
      const pubFadeEnd = isMobile ? 0.25 : 0.28
      const pubFade = 1 - Math.max(0, Math.min(1, p / pubFadeEnd))
      gsap.set(pubContentRef.current, { opacity: pubFade, pointerEvents: pubFade > 0.05 ? 'auto' : 'none' })

      const vw = window.innerWidth

      if (isMobile) {
        // Static mobile background - interstitial fades between feature list and footer
        const interIn  = Math.max(0, Math.min(1, (p - 0.28) / 0.17))
        const interOut = Math.max(0, Math.min(1, (p - 0.60) / 0.12))
        gsap.set(interstitialRef.current, { opacity: interIn * (1 - interOut), pointerEvents: 'none' })

      } else {
        // ── Phase 2: image shrinks full-width → centered (p 0.12 → 0.65) ──
        const imgRaw = Math.max(0, Math.min(1, (p - 0.12) / 0.53))
        const imgP   = easeInOut(imgRaw)

        const startW  = vw
        const endW    = vw * 0.46
        const w       = startW + imgP * (endW - startW)
        const centerX = imgP * (vw - w) / 2

        // Dark overlay fades as image shrinks
        if (imageOverlayRef.current) {
          gsap.set(imageOverlayRef.current, { opacity: 1 - imgP })
        }

        // ── Interstitial: fade in after pub, fade out before crossfade ──
        const interIn  = Math.max(0, Math.min(1, (p - 0.25) / 0.15))
        const interOut = Math.max(0, Math.min(1, (p - 0.54) / 0.14))
        gsap.set(interstitialRef.current, { opacity: interIn * (1 - interOut), pointerEvents: 'none' })

        // ── Phase 3: crossfade image → particles & video (p 0.65 → 0.92) ──
        const xfadeRaw = Math.max(0, Math.min(1, (p - 0.65) / 0.27))
        const xfade    = 0.5 - 0.5 * Math.cos(Math.PI * xfadeRaw)

        gsap.set(imageWrapRef.current, { width: w, x: centerX, opacity: 1 - xfade })
        
        // Update Three.js opacity uniforms
        if (particlesMaterial) particlesMaterial.opacity = xfade
        if (lightMaterial1) lightMaterial1.opacity = xfade * 0.15
        if (lightMaterial2) lightMaterial2.opacity = xfade * 0.1

        // Update footer video opacity
        if (footerVideoWrapRef.current) {
          gsap.set(footerVideoWrapRef.current, { opacity: xfade })
        }
      }

      // ── Footer text fades in ──────────────────────────────
      const footerStart = isMobile ? 0.72 : 0.75
      const footerRange = isMobile ? 0.20 : 0.25
      const footerFade = Math.max(0, Math.min(1, (p - footerStart) / footerRange))
      gsap.set(footerContentRef.current, { opacity: footerFade, pointerEvents: footerFade > 0.05 ? 'auto' : 'none' })

      // Handle mobile static opacity
      if (isMobile && footerVideoWrapRef.current) {
        gsap.set(footerVideoWrapRef.current, { opacity: 1 })
      }

      // Automatically control video audio based on footer viewport presence
      if (footerVideoRef.current) {
        const isFooterVisible = isMobile ? (dist > 1.7 * vh) : (p > 0.75)
        if (isFooterVisible) {
          if (footerVideoRef.current.muted) {
            footerVideoRef.current.muted = false
            // Play unmuted and sync state
            footerVideoRef.current.play().catch((err) => {
              console.warn("Autoplay audio blocked, falling back to muted play:", err)
              if (footerVideoRef.current) {
                footerVideoRef.current.muted = true
                footerVideoRef.current.play().catch(() => {})
                setFooterMuted(true)
              }
            })
            setFooterMuted(false)
          }
        } else {
          if (!footerVideoRef.current.muted) {
            footerVideoRef.current.muted = true
            setFooterMuted(true)
          }
        }
      }
    }

    resetPubAnim()
    setImageLeft()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    // Gesture warming: browsers block autoplay audio until the user interacts.
    // Tapping or clicking anywhere warms up the audio state.
    const warmUpAudio = () => {
      const vid = footerVideoRef.current
      if (vid) {
        // Attempt to play briefly to satisfy gesture requirement
        vid.play().then(() => {
          // Check if we are in the footer viewport, if not, mute back
          const dist = -wrapper.getBoundingClientRect().top
          const vh = window.innerHeight
          const p = Math.max(0, Math.min(1, dist / (2 * vh)))
          const isFooterVisible = isMobile ? (dist > 1.7 * vh) : (p > 0.75)
          if (!isFooterVisible) {
            vid.muted = true
            setFooterMuted(true)
          } else {
            vid.muted = false
            setFooterMuted(false)
          }
        }).catch(() => {})
      }
      window.removeEventListener('click', warmUpAudio)
      window.removeEventListener('touchstart', warmUpAudio)
    }

    window.addEventListener('click', warmUpAudio, { passive: true })
    window.addEventListener('touchstart', warmUpAudio, { passive: true })

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      scroller.removeEventListener('scroll', onScroll)
      sticky.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('click', warmUpAudio)
      window.removeEventListener('touchstart', warmUpAudio)
      if (renderer) renderer.dispose()
    }
  }, [])

  const year = new Date().getFullYear()

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div ref={stickyRef} className={styles.sticky}>

        {/* ── Particles canvas (footer background - desktop) ── */}
        <canvas ref={canvasRef} className={styles.glCanvas} />

        {/* ── Mobile background abstract (footer phase - mobile only) ── */}
        <div className={styles.mobileFooterBg}>
          <div className={styles.abstractMobileBg} />
        </div>

        {/* ── Mobile permanent dark overlay - keeps image visually identical across all 3 sections ── */}
        <div className={styles.mobileDarkOverlay} aria-hidden />

        {/* ── Outro Video Background (footer phase - desktop & mobile) ── */}
        <div ref={footerVideoWrapRef} className={styles.footerVideoBg}>
          <video
            ref={footerVideoRef}
            src="/assets/Thanks_for_visiting_my_portfol.mp4"
            autoPlay
            muted
            loop
            playsInline
            className={styles.footerVideoEl}
          />
          <div className={styles.footerVideoOverlay} />
        </div>

        {/* ── Floating image: starts left, moves to center ── */}
        <div ref={imageWrapRef} className={styles.imageWrap}>
          <img 
            src="/assets/certifications_bg.jpg" 
            alt="Varshini Uppada Certifications Background" 
            className={styles.certBgImg} 
          />
          <div ref={imageOverlayRef} className={styles.imageOverlay} />
        </div>

        {/* ── Publication content (right of image) ── */}
        <div ref={pubContentRef} className={styles.pubContent}>
          <span className={styles.watermark} aria-hidden>IMPACT</span>

          <div className={styles.pubHero}>
            <p  ref={labelRef}   className={styles.label}>Credentials &amp; Impact</p>
            <h2 ref={headingRef} className={styles.heading}>Certifications &amp; Achievements</h2>
          </div>

          <div ref={dividerRef} className={styles.divider} />

          <div className={styles.list}>
            {PUBS.map((pub, i) => (
              <a
                key={pub.id}
                href={pub.link}
                target="_blank"
                rel="noopener noreferrer"
                ref={el => { itemRefs.current[i] = el }}
                className={styles.item}
              >
                <div className={styles.num}>0{i + 1}.</div>
                <div className={styles.itemBody}>
                  <div className={styles.itemTop}>
                    <h3 className={styles.title}>{pub.title}</h3>
                    <span className={styles.platform}>{pub.platform}</span>
                  </div>
                  <p className={styles.desc}>{pub.desc}</p>
                </div>
                <div className={styles.itemRight}>
                  <span className={styles.year}>{pub.year}</span>
                  <span className={styles.readBtn}>
                    View <FiArrowUpRight size={11} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ── Image-only interstitial (step 2) ── */}
        <div ref={interstitialRef} className={styles.interstitial} aria-hidden>

          <div className={styles.interstitialLeft}>
            <div className={styles.interStat}>
              <span className={styles.interLabel}>{content.interstitial.availabilityLabel}</span>
              <span className={styles.interBig}>{profile.location.availability}</span>
            </div>
            <div className={styles.interDividerH} />
            <div className={styles.interStat}>
              <span className={styles.interLabel}>{content.interstitial.basedInLabel}</span>
              <span className={styles.interBig}>{profile.location.based}</span>
            </div>
          </div>

          <div className={styles.interstitialRight}>
            {profile.stats.map((stat, i) => (
              <Fragment key={stat.label}>
                {i > 0 && <div className={styles.interDividerV} />}
                <div className={styles.interNum}>
                  <span className={styles.interCount}>{stat.value}</span>
                  <span className={styles.interNumLabel}>
                    {(content.interstitial.statLabels[i] ?? stat.label).split('\n').map((line, j) => (
                      <Fragment key={j}>{line}{j === 0 && <br />}</Fragment>
                    ))}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>

          <div className={styles.interstitialBottom}>
            <span className={styles.interScrollText}>Continue</span>
            <span className={styles.interScrollLine} />
          </div>

        </div>

        {/* ── Radial vignette (footer phase) ── */}
        <div className={styles.vignetteOverlay} aria-hidden />

        {/* ── Footer content ── */}
        <div ref={footerContentRef} className={styles.footerContent}>

          {/* ── Mobile: hero-like layout ── */}
          <div className={styles.mobileLayout}>
            <div className={styles.mobileBrand}>
              <span className={styles.mobileRoleDot} />
              <span className={styles.mobileRoleText}>{profile.roles.short.toUpperCase()}</span>
            </div>
            <h2 className={styles.mobileName}>
              {profile.name.first.toUpperCase()}
              <br />
              <span className={styles.mobileNameGhost}>{profile.name.last.toUpperCase()}</span>
            </h2>
            <p className={styles.mobileDesc}>{profile.description}</p>
            <div className={styles.mobileCtas}>
              <a href={`mailto:${profile.email}`} className={styles.mobileTalkBtn}>
                Let&apos;s talk <FiArrowUpRight />
              </a>
              <button onClick={toggleFooterMute} className={`${styles.mobileSoundBtn} ${footerMuted ? styles.mobileSoundBtnMuted : ''}`}>
                {footerMuted ? 'TAP FOR VOICE' : 'VOICE ON'}
              </button>
            </div>
            <div className={styles.mobileSocialRow}>
              {HERO_SOCIAL_LABELS.map((label, i) => {
                const s = profile.socials.find(s => s.label === label)
                if (!s) return null
                return (
                  <Fragment key={label}>
                    {i > 0 && <div className={styles.mobileSocialDivider} aria-hidden />}
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className={styles.mobileSocialLink} aria-label={label}>
                      <span className={styles.mobileSocialIconEl}>{MOBILE_SOCIAL_ICONS[label]}</span>
                      <span className={styles.mobileSocialLabelEl}>{label.toUpperCase()}</span>
                    </a>
                  </Fragment>
                )
              })}
            </div>
            <div className={styles.mobileScrollHint} aria-hidden>
              <FiChevronDown size={18} />
              <span className={styles.mobileScrollText}>Scroll to explore</span>
            </div>
          </div>

          <div className={styles.mainGrid}>

            <div ref={leftRef} className={styles.leftCol}>
              <div className={styles.identityBlock}>
                <p className={styles.greetLine}>
                  <span className={styles.greetDot} />
                  {getGreeting()}
                </p>
                <p className={styles.roleLabel}>{profile.roles.short}</p>
                <h2 className={styles.nameHeading}>
                  {profile.name.first}
                  <br />
                  <span className={styles.nameGhost}>{profile.name.last}</span>
                </h2>
              </div>

              <div className={styles.footerInfo}>
                <p className={styles.footerDescription}>{profile.description}</p>
                <div className={styles.footerLinks}>
                  {profile.socials.slice(0, 4).map((s, i) => (
                    <span key={s.label} className={styles.footerLinkWrap}>
                      {i > 0 && <span className={styles.footerPipe}>|</span>}
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.footerLink}
                      >
                        {SOCIAL_ICONS[s.label] && (
                          <span className={styles.socialIcon}>{SOCIAL_ICONS[s.label]}</span>
                        )}
                        {s.label}
                      </a>
                    </span>
                  ))}
                </div>
                <a href={`mailto:${profile.email}`} className={styles.footerMail}>
                  <FaEnvelope size={12} />
                  {profile.email}
                </a>
              </div>
            </div>

            <div className={styles.centerSpace}>
              <div className={styles.interactiveConsole}>
                {/* Latent Space Rings */}
                <div className={styles.ringContainer}>
                  <div className={`${styles.dataRing} ${styles.ringOuter}`} />
                  <div className={`${styles.dataRing} ${styles.ringMid}`} />
                  <div className={`${styles.dataRing} ${styles.ringInner}`} />
                  
                  {/* Glowing Core */}
                  <div className={styles.coreNode} onClick={handleCoreClick} title="Click to cycle metrics">
                    <div className={styles.corePulse} />
                    <span className={styles.coreText}>AI</span>
                  </div>
                </div>

                {/* Shifting ML Logs / Parameters console */}
                <div className={styles.mlParamsConsole}>
                  <div className={styles.consoleHeader}>
                    <span className={styles.consoleDot} />
                    <span className={styles.consoleTitle}>LATENT SPACE METRICS</span>
                  </div>
                  <div className={styles.consoleGrid}>
                    <div className={styles.paramItem}>
                      <span className={styles.paramLabel}>INFERENCE</span>
                      <span className={styles.paramVal}>{metrics.inference}</span>
                    </div>
                    <div className={styles.paramItem}>
                      <span className={styles.paramLabel}>FAISS INDEX</span>
                      <span className={styles.paramVal}>{metrics.faiss}</span>
                    </div>
                    <div className={styles.paramItem}>
                      <span className={styles.paramLabel}>ATTENTION</span>
                      <span className={styles.paramVal}>{metrics.attention}</span>
                    </div>
                    <div className={styles.paramItem}>
                      <span className={styles.paramLabel}>LOSS RATE</span>
                      <span className={styles.paramVal}>{metrics.loss}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div ref={rightRef} className={styles.rightCol}>
              <div className={styles.ctaBlock}>
                <p className={styles.ctaEyebrow}>{content.footer.eyebrow}</p>
                <p className={styles.ctaHeading}>
                  {content.footer.ctaLines.map((line, i) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                  <span className={styles.ctaAccent}>{content.footer.ctaAccent}</span>
                </p>
                <div className={styles.ctaActions}>
                  <a href={`mailto:${profile.email}`} className={styles.talkBtn}>
                    Let&apos;s talk
                  </a>
                  <button onClick={toggleFooterMute} className={`${styles.soundBtn} ${footerMuted ? styles.soundBtnMuted : ''}`}>
                    {footerMuted ? 'TAP FOR VOICE' : 'VOICE ON'}
                  </button>
                </div>
              </div>
            </div>

          </div>

          <div ref={bigNameRef} className={styles.signatureWrap}>
            <h2 className={styles.signatureText}>{profile.name.full.toUpperCase()}</h2>
          </div>

          <div ref={bottomBarRef} className={styles.bottomBar}>
            <div className={styles.bottomLeft}>
              <div className={styles.monogram}>
                <span className={styles.monoLetters}>JS</span>
                <span className={styles.monoDot} />
              </div>
              <span className={styles.leftDivider} />
              <div className={styles.copyBlock}>
                <p className={styles.copy}>© {year} {profile.name.full.toUpperCase()}</p>
                <p className={styles.copyAll}>ALL RIGHTS RESERVED</p>
              </div>
            </div>
            <div className={styles.bottomRight}>
              <span className={styles.builtWith}>
                DESIGNED &amp; DEVELOPED
                <br />
                WITH PRECISION.
              </span>
              <span className={styles.barDivider} />
              <span className={styles.sunIcon}>*</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
