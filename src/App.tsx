import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import './App.css'
import './Thing.css'

const backgroundAudioSource = new URL('../audio/audiobackground.mp3', import.meta.url).href

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null)
  const [isDoomFullscreen, setIsDoomFullscreen] = useState(false)
  const [isMusicEnabled, setIsMusicEnabled] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const waveContainerRef = useRef<HTMLDivElement>(null)
  const starsRef = useRef<HTMLDivElement[]>([])
  const buttonRef = useRef<HTMLButtonElement>(null)
  const startHintRef = useRef<HTMLParagraphElement>(null)
  const doomFrameRef = useRef<HTMLIFrameElement>(null)
  const backgroundAudioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = backgroundAudioRef.current
    if (!audio || !isMusicEnabled) return

    audio.volume = 0.35
    const tryPlayAudio = () => {
      void audio.play().catch(() => undefined)
    }

    tryPlayAudio()
    window.addEventListener('pointerdown', tryPlayAudio, { once: true })
    window.addEventListener('keydown', tryPlayAudio, { once: true })

    return () => {
      window.removeEventListener('pointerdown', tryPlayAudio)
      window.removeEventListener('keydown', tryPlayAudio)
    }
  }, [isMusicEnabled])

  const startPortfolio = () => {
    const audio = backgroundAudioRef.current
    if (isMusicEnabled && audio) void audio.play().catch(() => undefined)
    setCurrentPage('portfolio')
  }

  const toggleMusic = () => {
    const audio = backgroundAudioRef.current
    if (!audio) return

    if (isMusicEnabled) {
      audio.pause()
      setIsMusicEnabled(false)
      return
    }

    setIsMusicEnabled(true)
    void audio.play().catch(() => undefined)
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsDoomFullscreen(document.fullscreenElement === doomFrameRef.current)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleDoomFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }

    await doomFrameRef.current?.requestFullscreen()
  }

  useEffect(() => {
    if (currentPage !== 'home' || !containerRef.current) return

    // Gerar 300 estrelas aleatórias
    const starCount = 250
    const container = containerRef.current
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    gsap.set(buttonRef.current, { opacity: 0, scale: 0.5 })
    gsap.set(startHintRef.current, { autoAlpha: 0 })

    // Limpar estrelas anteriores
    container.innerHTML = ''
    starsRef.current = []

    // Criar estrelas
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div')
      star.className = 'star'
      
      // Posição aleatória na tela
      const startX = Math.random() * window.innerWidth
      const startY = Math.random() * window.innerHeight
      const size = Math.random() * 6 + 2
      const opacity = Math.random() * 0.7 + 0.3
      
      star.style.left = startX + 'px'
      star.style.top = startY + 'px'
      star.style.width = size + 'px'
      star.style.height = size + 'px'
      star.style.opacity = opacity.toString()
      
      container.appendChild(star)
      starsRef.current.push(star)
    }

    // Animar todas as estrelas para o centro
    starsRef.current.forEach((star, index) => {
      gsap.to(star, {
        left: centerX,
        top: centerY,
        opacity: 0,
        duration: 2 + Math.random() * 1,
        delay: index * 0.05,
        repeat: -1,
        ease: 'power2.inOut',
      })
    })

    // Mostrar botão após 1 segundos
    const timeout = setTimeout(() => {
      if (startHintRef.current) {
        gsap.set(startHintRef.current, { visibility: 'visible' })
        gsap.to(startHintRef.current, {
          opacity: 1,
          duration: 1,
          ease: 'none',
        })
      }

      if (buttonRef.current) {
        gsap.to(buttonRef.current, {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'back.out',
        })
      }
    }, 3000)

    return () => {
      clearTimeout(timeout)
      gsap.killTweensOf(starsRef.current)
    }
  }, [currentPage])

  useEffect(() => {
    if (currentPage === 'home' || !waveContainerRef.current) return

    const container = waveContainerRef.current
    const stars: { element: HTMLDivElement; x: number; y: number; phase: number }[] = []
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    let animationFrame = 0

    for (let index = 0; index < 180; index++) {
      const star = document.createElement('div')
      const size = Math.random() * 4 + 2
      const x = Math.random() * window.innerWidth
      const y = Math.random() * window.innerHeight

      star.className = 'wave-star'
      star.style.left = `${x}px`
      star.style.top = `${y}px`
      star.style.width = `${size}px`
      star.style.height = `${size}px`
      star.style.opacity = `${Math.random() * 0.65 + 0.35}`
      container.appendChild(star)
      stars.push({ element: star, x, y, phase: Math.random() * Math.PI * 2 })
    }

    const handleMouseMove = (event: MouseEvent) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
    }

    const animateWave = (time: number) => {
      stars.forEach(({ element, x, y, phase }) => {
        const distanceX = x - pointer.x
        const distanceY = y - pointer.y
        const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)
        const influence = Math.max(0, 1 - distance / 800)
        const wave = Math.sin(distance * 0.045 - time * 0.004 + phase) * influence

        element.style.transform = `translate(${distanceX * influence * 0.12}px, ${wave * 28}px)`
        element.style.opacity = `${0.35 + influence * 0.65}`
      })
      animationFrame = requestAnimationFrame(animateWave)
    }

    window.addEventListener('mousemove', handleMouseMove)
    animationFrame = requestAnimationFrame(animateWave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrame)
    }
  }, [currentPage])

  useEffect(() => {
    if (currentPage !== 'about' && currentPage !== 'projects') return

    const animatedElements = document.querySelectorAll<HTMLElement>('.about-image, .project-frame')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-visible', entry.isIntersecting)
        })
      },
      { threshold: 0.2 },
    )

    animatedElements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [currentPage])

  useEffect(() => {
    if (!selectedImage) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedImage(null)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedImage])

  return (
    <>
      {currentPage === 'home' ? (
        <div className="app">
          <div ref={containerRef} className="stars-container"></div>
          <div className="content">
            <h1>Welcome to My Portfolio</h1>
            <button 
              ref={buttonRef} 
              className="start-button"
              onClick={startPortfolio}
            >
              Start
            </button>
            <p ref={startHintRef} className="start-hint">Press start to initialize</p>
          </div>
          <button
            type="button"
            className={`music-toggle${isMusicEnabled ? '' : ' music-off'}`}
            onClick={toggleMusic}
            aria-label={isMusicEnabled ? 'Disable background music' : 'Enable background music'}
            title={isMusicEnabled ? 'Disable background music' : 'Enable background music'}
          >
            {isMusicEnabled ? 'Sound: on' : 'Sound: off'}
          </button>
        </div>
      ) : currentPage === 'portfolio' ? (
        <div className="portfolioThings">
          <div ref={waveContainerRef} className="wave-stars-container"></div>
          <div className="portfolio-menu">
            <button className="projects-button" onClick={() => setCurrentPage('projects')}>Projects</button>
            <button className="projects-button" onClick={() => setCurrentPage('about')}>About Me</button>
            <button className="projects-button" onClick={() => setCurrentPage('contact')}>Contact</button>
          </div>
          <nav className="portfolio-nav" aria-label="Navegação principal">
            <div className="portfolio-home-controls">
              <button
                type="button"
                className={`music-toggle${isMusicEnabled ? '' : ' music-off'}`}
                onClick={toggleMusic}
                aria-label={isMusicEnabled ? 'Disable background music' : 'Enable background music'}
                title={isMusicEnabled ? 'Disable background music' : 'Enable background music'}
              >
                {isMusicEnabled ? 'Sound: on' : 'Sound: off'}
              </button>
              <button type="button" className="portfolio-nav-button" onClick={() => setCurrentPage('home')}>
                Home
              </button>
            </div>
            <button type="button" className="portfolio-nav-button-doom" onClick={() => setCurrentPage('doom')}>
              Doom
            </button>
          </nav>
        </div>
      ) : currentPage === 'doom' ? (
        <section className="doom-page">
          <iframe
            ref={doomFrameRef}
            className="doom-game"
            src="/doom/index.html"
            title="Doom em WebAssembly"
          />
          <div className="doom-controls">
            <button type="button" className="back-button" onClick={toggleDoomFullscreen}>
              {isDoomFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
            </button>
            <button type="button" className="back-button" onClick={() => setCurrentPage('portfolio')}>
              Voltar
            </button>
            <button type="button" className="back-button" onClick={() => setCurrentPage('home')}>
              Home
            </button>
          </div>
        </section>
      ) : (
        <section className={`detail-page ${currentPage}-page`}>
          <div ref={waveContainerRef} className="wave-stars-container"></div>
          <button
            type="button"
            className="back-button detail-back-top"
            onClick={() => setCurrentPage('portfolio')}
          >
            Back
          </button>
          <div className="detail-content">
            {currentPage === 'projects' && (
              <>
                <p className="page-label">Selected work</p>
                <div className="projects-gallery">
                  <title>Projects</title>
                  <a
                    className="project-frame"
                    href="https://vicenzomarramarco.github.io/CalculadoraCientificaAges/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Abrir o projeto Calculadora Científica"
                  >
                    <div className="frame-outer">
                      <div className="frame-inner">
                        <img src="/images/calculadora.png" alt="Calculadora" />
                      </div>
                    </div>
                    <h3>Calculadora Científica</h3>
                    <p className="project-description">Uma calculadora moderna com interface intuitiva</p>
                  </a>
                  <a
                    className="project-frame"
                    href="https://vicenzomarramarco.github.io/CambioDeMoeda/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Abrir o projeto Câmbio de Moeda"
                  >
                    <div className="frame-outer">
                      <div className="frame-inner">
                        <img src="/images/cambiomoeda.png" alt="Câmbio de Moeda" />
                      </div>
                    </div>
                    <h3>Câmbio de Moeda</h3>
                    <p className="project-description">Conversor de moedas em tempo real</p>
                  </a>
                </div>
              </>
            )}
            {currentPage === 'about' && (
              <div className="about-content">
                <section className="certificates-section">
                  <title>AboutMe</title>
                  <div className="about-text certificates-heading">
                    <p className="page-label">Meus certificados</p>
                    <h2>Conhecimentos e conquistas</h2>
                  </div>
                  <div className="certificates-gallery">
                    {[
                      { src: '/images/bancosql.jpg', alt: 'Certificado de banco de dados SQL' },
                      { src: '/images/java.jpg', alt: 'Certificado de Java' },
                      { src: '/images/certificadoservice.png', alt: 'Certificado de desenvolvimento de serviços' },
                    ].map((image) => (
                      <button
                        key={image.src}
                        type="button"
                        className="about-image certificate-image"
                        onClick={() => setSelectedImage(image)}
                        aria-label={`Ampliar ${image.alt}`}
                      >
                        <img src={image.src} alt={image.alt} />
                      </button>
                    ))}
                  </div>
                  <div className="technologies-section">
                    <h3>Tecnologias</h3>
                    <div className="technologies-gallery">
                      {[
                        { name: 'TypeScript', icon: 'typescript', color: '3178C6' },
                        { name: 'HTML', icon: 'html5', color: 'E34F26' },
                        { name: 'CSS', icon: 'css', color: '1572B6' },
                        { name: 'Java', icon: 'openjdk', color: 'FFFFFF' },
                        { name: 'React', icon: 'react', color: '61DAFB' },
                        { name: 'Tailwind', icon: 'tailwindcss', color: '06B6D4' },
                        { name: 'Python', icon: 'python', color: 'FFD43B' },
                        { name: 'FastAPI', icon: 'fastapi', color: '009688' },
                        { name: 'PostgreSQL', icon: 'postgresql', color: '4169E1' },
                        { name: 'Docker', icon: 'docker', color: '2496ED' },
                      ].map((technology) => (
                        <div className="technology-card" key={technology.name}>
                          <img
                            src={`https://cdn.simpleicons.org/${technology.icon}/${technology.color}`}
                            alt=""
                            aria-hidden="true"
                          />
                          <span>{technology.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
                <section className="about-section about-section-school">
                  <div className="about-text">
                    <p className="page-label">Minha formação</p>
                    <h1>Colégio La Salle Santo Antônio</h1>
                    <p>Eu fiz o ensino fundamental e o ensino médio no Colégio Lassalista, no período de (2013-2021), aonde me formei.</p>
                  </div>
                  <button
                    type="button"
                    className="about-image"
                    onClick={() => setSelectedImage({ src: '/images/lasalle.jpg', alt: 'Colégio La Salle Santo Antônio' })}
                    aria-label="Ampliar imagem do Colégio La Salle Santo Antônio"
                  >
                    <img src="/images/lasalle.jpg" alt="Colégio La Salle Santo Antônio" />
                  </button>
                </section>
                <section className="about-section about-section-university">
                  <button
                    type="button"
                    className="about-image"
                    onClick={() => setSelectedImage({ src: '/images/pucrs.jpg', alt: 'Pontifícia Universidade Católica do Rio Grande do Sul' })}
                    aria-label="Ampliar imagem da PUCRS"
                  >
                    <img src="/images/pucrs.jpg" alt="Pontifícia Universidade Católica do Rio Grande do Sul" />
                  </button>
                  <div className="about-text">
                    <h2>Pontifícia Universidade Católica do Rio Grande do Sul</h2>
                    <p>Iniciei minha jornada acadêmica na PUCRS em 2023/1, no curso de Engenharia de Software, aonde tive meu primeiro contato com a computação.</p>
                  </div>
                </section>
              </div>
            )}
            {currentPage === 'contact' && (
              <>
                 <title>Contact</title>
                  <p className="page-label">Let's talk</p>
                   <div className="social-links" aria-label="Redes sociais">
                     <a href="https://www.linkedin.com/in/vicenzo-marramarco-462165290" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                       <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6.5 8.5H3V21h3.5V8.5ZM4.75 3A2.05 2.05 0 1 0 4.75 7.1 2.05 2.05 0 0 0 4.75 3ZM21 13.85c0-3.76-2-5.5-4.67-5.5a4.02 4.02 0 0 0-3.58 1.97V8.5H9.25V21h3.5v-6.19c0-1.63.3-3.2 2.32-3.2 1.99 0 2.02 1.86 2.02 3.3V21H21v-7.15Z" />
                    </svg>
                  </a>
                  <a href="https://github.com/VicenzoMarramarco" target="_blank" rel="noreferrer" aria-label="GitHub">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 7.01c.85 0 1.71.12 2.51.37 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.35 4.69-4.58 4.94.36.31.68.92.68 1.86v2.53c0 .26.18.57.69.48A10 10 0 0 0 12 2Z" />
                    </svg>
                  </a>
                  <a href="https://www.instagram.com/marramarcovicenzo" target="_blank" rel="noreferrer" aria-label="Instagram">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" className="social-icon-dot" />
                    </svg>
                  </a>
                </div>
              </>
            )}
          </div>
        </section>
      )}
      <audio ref={backgroundAudioRef} src={backgroundAudioSource} autoPlay loop preload="auto" />
      {selectedImage && (
        <div className="image-modal" role="dialog" aria-modal="true" aria-label={selectedImage.alt} onClick={() => setSelectedImage(null)}>
          <button type="button" className="image-modal-close" onClick={() => setSelectedImage(null)} aria-label="Fechar imagem ampliada">
            &times;
          </button>
          <img src={selectedImage.src} alt={selectedImage.alt} onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </>
  )
}

export default App
