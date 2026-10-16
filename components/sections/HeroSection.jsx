'use client'

import { useEffect, useRef, Fragment } from 'react'
import dynamic from 'next/dynamic'
import { FaGithub, FaLinkedinIn, FaInstagram, FaAws } from 'react-icons/fa'
import { FiArrowUpRight } from 'react-icons/fi'
import { 
  SiPytorch, 
  SiHuggingface, 
  SiLangchain, 
  SiFastapi, 
  SiDocker, 
  SiApachekafka, 
  SiSpringboot, 
  SiRedis, 
  SiPostgresql 
} from 'react-icons/si'
import { gsap } from '@/lib/gsap'

import profile from '@/data/profile.json'
import content from '@/data/content.json'
import styles from '@/styles/sections/HeroSection.module.css'

const HeroBackground = dynamic(() => import('@/components/three/HeroBackground'), { ssr: false })

const SOCIAL_ICON_MAP = { GitHub: FaGithub, LinkedIn: FaLinkedinIn, Instagram: FaInstagram }
const SIDEBAR_LABELS  = ['Instagram', 'GitHub', 'LinkedIn']

const HERO_SKILLS = [
  // Inner Orbit (Radius 65, duration 16s, clockwise)
  { name: 'PyTorch', icon: SiPytorch, color: '#EE4C2C', radius: 65, duration: '16s', angle: 0, direction: 1, size: 48 },
  { name: 'Hugging Face', icon: SiHuggingface, color: '#D9A400', radius: 65, duration: '16s', angle: 120, direction: 1, size: 44 },
  { name: 'LangChain', icon: SiLangchain, color: '#1C3C3A', radius: 65, duration: '16s', angle: 240, direction: 1, size: 42 },

  // Middle Orbit (Radius 110, duration 26s, counter-clockwise)
  { name: 'FastAPI', icon: SiFastapi, color: '#009688', radius: 110, duration: '26s', angle: 30, direction: -1, size: 46 },
  { name: 'Docker', icon: SiDocker, color: '#2496ED', radius: 110, duration: '26s', angle: 150, direction: -1, size: 48 },
  { name: 'Spring Boot', icon: SiSpringboot, color: '#6DB33F', radius: 110, duration: '26s', angle: 270, direction: -1, size: 48 },

  // Outer Orbit (Radius 155, duration 38s, clockwise)
  { name: 'AWS', icon: FaAws, color: '#FF9900', radius: 155, duration: '38s', angle: 0, direction: 1, size: 44 },
  { name: 'Kafka', icon: SiApachekafka, color: '#1E293B', radius: 155, duration: '38s', angle: 90, direction: 1, size: 42 },
  { name: 'Redis', icon: SiRedis, color: '#DC382D', radius: 155, duration: '38s', angle: 180, direction: 1, size: 40 },
  { name: 'PostgreSQL', icon: SiPostgresql, color: '#4169E1', radius: 155, duration: '38s', angle: 270, direction: 1, size: 44 }
]

function splitTagline(text, highlight) {
  if (!highlight) return [text]
  const parts = text.split(highlight)
  return parts.reduce((acc, part, i) => {
    acc.push(part)
    if (i < parts.length - 1) {
      acc.push(<span key={i} className={styles.taglineAccent}>{highlight}</span>)
    }
    return acc
  }, [])
}

export default function HeroSection() {
  const sectionRef     = useRef(null)
  const greetRef       = useRef(null)
  const roleRef        = useRef(null)
  const firstName      = useRef(null)
  const lastName       = useRef(null)
  const photoRef       = useRef(null)
  const pillsRef       = useRef(null)
  const ctaBtnRef      = useRef(null)
  const statsRef       = useRef(null)
  const taglineCardRef = useRef(null)
  const availCardRef   = useRef(null)
  const skillsRef      = useRef(null)
  const socialRef      = useRef(null)

  function handleViewProjects() {
    const scroller = document.querySelector('main')
    if (scroller) {
      gsap.to(scroller, { scrollTop: 3 * window.innerHeight, duration: 1.0, ease: 'power3.inOut' })
    }
  }

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const fadeY = [
      greetRef.current, roleRef.current,
      firstName.current, lastName.current,
      pillsRef.current, ctaBtnRef.current, statsRef.current,
    ].filter(Boolean)

    const fadeX = [taglineCardRef.current, availCardRef.current, skillsRef.current].filter(Boolean)

    gsap.set(fadeY, { opacity: 0, y: 30 })
    gsap.set(fadeX, { opacity: 0, x: 20 })
    if (photoRef.current)  gsap.set(photoRef.current,  { opacity: 0, x: 80 })
    if (socialRef.current) gsap.set(socialRef.current, { opacity: 0, x: -20 })

    const tl = gsap.timeline({ paused: true })
    tl.to(greetRef.current,       { opacity: 1, y: 0, duration: 0.5,  ease: 'power2.out' })
      .to(roleRef.current,        { opacity: 1, y: 0, duration: 0.5,  ease: 'power2.out' }, '-=0.3')
      .to(firstName.current,      { opacity: 1, y: 0, duration: 0.6,  ease: 'power2.out' }, '-=0.2')
      .to(lastName.current,       { opacity: 1, y: 0, duration: 0.6,  ease: 'power2.out' }, '-=0.4')
      .to(photoRef.current,       { opacity: 1, x: 0, duration: 0.7,  ease: 'power2.out' }, '-=0.5')
      .to(pillsRef.current,       { opacity: 1, y: 0, duration: 0.5,  ease: 'power2.out' }, '-=0.3')
      .to(ctaBtnRef.current,      { opacity: 1, y: 0, duration: 0.4,  ease: 'power2.out' }, '-=0.2')
      .to(statsRef.current,       { opacity: 1, y: 0, duration: 0.5,  ease: 'power2.out' }, '-=0.2')
      .to(taglineCardRef.current, { opacity: 1, x: 0, duration: 0.5,  ease: 'power2.out' }, '-=0.5')
      .to(availCardRef.current,   { opacity: 1, x: 0, duration: 0.5,  ease: 'power2.out' }, '-=0.3')
      .to(skillsRef.current,      { opacity: 1, x: 0, duration: 0.5,  ease: 'power2.out' }, '-=0.3')
      .to(socialRef.current,      { opacity: 1, x: 0, duration: 0.5,  ease: 'power2.out' }, '-=0.4')

    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { tl.play(); observer.disconnect() } },
      { threshold: 0.3 },
    )
    observer.observe(section)
    return () => { observer.disconnect(); tl.kill() }
  }, [])

  const sidebarSocials = SIDEBAR_LABELS
    .map(label => profile.socials.find(s => s.label === label))
    .filter(Boolean)

  return (
    <section ref={sectionRef} className={styles.section}>

      <HeroBackground />

      {/* AI Hologram Visual - replaces photo */}
      <div ref={photoRef} className={styles.photo}>
        <div className={styles.holoWrap}>
          <div className={styles.holoRing1} />
          <div className={styles.holoRing2} />
          <div className={styles.holoRing3} />
          <div className={styles.holoCore}>
            <div className={styles.holoInner}>
              <span className={styles.holoLabel}>AI</span>
            </div>
          </div>
          <div className={styles.holoParticles}>
            {[...Array(12)].map((_, i) => (
              <div key={i} className={styles.holoParticle} style={{ '--i': i }} />
            ))}
          </div>
          <div className={styles.holoGrid} />
        </div>
      </div>

      {/* Social Sidebar */}
      <div ref={socialRef} className={styles.socialSidebar}>
        {sidebarSocials.map(social => {
          const Icon = SOCIAL_ICON_MAP[social.label]
          if (!Icon) return null
          return (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={social.label}
            >
              <Icon size={15} />
              <span className={styles.socialLabel}>{social.label}</span>
            </a>
          )
        })}
        <div className={styles.scrollIndicator}>
          <span className={styles.scrollText}>Scroll down</span>
          <svg width="14" height="22" viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="1" y="1" width="12" height="20" rx="6" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="7" cy="6" r="2" fill="currentColor"/>
          </svg>
        </div>
      </div>

      {/* Left Content Column */}
      <div className={styles.content}>

        {/* Greeting */}
        <div className={styles.greeting}>
          <p ref={greetRef} className={styles.greetText}>{"Hi, I'm"}</p>
          <p ref={roleRef}  className={styles.roleText}>{profile.roles.short}</p>
        </div>

        {/* Stacked Name */}
        <div className={styles.nameBlock}>
          <p ref={firstName} className={styles.name}>{profile.name.first}</p>
          <p ref={lastName}  className={styles.name}>{profile.name.last}</p>
        </div>

        {/* Tag Pills */}
        <div ref={pillsRef} className={styles.pills}>
          {content.hero.pills.map((tag, i) => (
            <Fragment key={tag}>
              <span className={styles.pill}>{tag}</span>
              {i < content.hero.pills.length - 1 && (
                <span className={styles.pillDot} aria-hidden="true" />
              )}
            </Fragment>
          ))}
        </div>

        {/* View Projects CTA */}
        <button ref={ctaBtnRef} type="button" className={styles.viewBtn} onClick={handleViewProjects}>
           View Work <FiArrowUpRight />
        </button>

        {/* Stats Row */}
        <div ref={statsRef} className={styles.stats}>
          {[...profile.stats.slice(0, 2), content.hero.specialistStat].map(s => (
            <div key={s.label} className={styles.statCard}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Tagline + Availability Cards */}
      <div className={styles.cardsCol}>
        <div ref={taglineCardRef} className={styles.taglineCard}>
          <p className={styles.taglineText}>
            {splitTagline(profile.tagline, content.hero.taglineHighlight)}
          </p>
          <p className={styles.freelanceNote}>{content.hero.freelanceNote}</p>
        </div>

        {profile.available && (
          <div ref={availCardRef} className={styles.availCard}>
            <div className={styles.availHeader}>
              <span className={styles.availDot} />
              <span className={styles.availStatus}>{content.hero.availableLabel}</span>
            </div>
            <p className={styles.locationLine}>Based in {profile.location.based}</p>
            <p className={styles.locationLine}>Available {profile.location.availability}</p>
          </div>
        )}
      </div>

      {/* 3-Tier Orbital Skills System in the far-right space */}
      <div ref={skillsRef} className={styles.orbitContainer}>
        <h3 className={styles.skillsTitle}>Core Tech Stack</h3>
        <div className={styles.orbitCenter}>
          <div className={styles.orbitCore}>
            <span className={styles.orbitCoreText}>STACK</span>
          </div>
          
          {/* Background Orbit Rings */}
          <div className={styles.orbitRing} style={{ width: '130px', height: '130px' }} />
          <div className={styles.orbitRing} style={{ width: '220px', height: '220px', borderStyle: 'solid' }} />
          <div className={styles.orbitRing} style={{ width: '310px', height: '310px' }} />

          {/* Orbiting Skill Bubbles */}
          {HERO_SKILLS.map(skill => {
            const Icon = skill.icon
            const endAngle = skill.angle + (360 * skill.direction)
            return (
              <div
                key={skill.name}
                className={styles.orbitBubble}
                style={{
                  width: `${skill.size}px`,
                  height: `${skill.size}px`,
                  '--radius': `${skill.radius}px`,
                  '--duration': skill.duration,
                  '--start-angle': `${skill.angle}deg`,
                  '--inverse-start-angle': `${-skill.angle}deg`,
                  '--end-angle': `${endAngle}deg`,
                  '--inverse-end-angle': `${-endAngle}deg`,
                  '--brand-color': skill.color,
                }}
              >
                <Icon className={styles.skillIcon} size={skill.size * 0.52} />
                <span className={styles.tooltip}>{skill.name}</span>
              </div>
            )
          })}
        </div>
      </div>

    </section>
  )
}
