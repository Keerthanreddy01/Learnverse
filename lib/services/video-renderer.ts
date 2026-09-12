import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { REEL_DURATION_SECONDS, VisualSlideCue } from './script-generator'

function resolveFfmpegPath(): string {
  if (ffmpegPath && fs.existsSync(ffmpegPath)) {
    return ffmpegPath
  }

  const isWin = process.platform === 'win32'
  const binaryName = isWin ? 'ffmpeg.exe' : 'ffmpeg'

  const directPath = path.join(process.cwd(), 'node_modules', 'ffmpeg-static', binaryName)
  if (fs.existsSync(directPath)) {
    return directPath
  }

  const pnpmDir = path.join(process.cwd(), 'node_modules', '.pnpm')
  if (fs.existsSync(pnpmDir)) {
    try {
      const entries = fs.readdirSync(pnpmDir)
      for (const entry of entries) {
        if (entry.startsWith('ffmpeg-static')) {
          const candidate = path.join(pnpmDir, entry, 'node_modules', 'ffmpeg-static', binaryName)
          if (fs.existsSync(candidate)) {
            return candidate
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  return ffmpegPath || 'ffmpeg'
}

const activeFfmpegPath = resolveFfmpegPath()
if (activeFfmpegPath) {
  ffmpeg.setFfmpegPath(activeFfmpegPath)
}

export interface RenderMetadata {
  subtopicTitle?: string
  documentTitle?: string
  subject?: string
  narrationScript?: string
}

export interface RenderedVideoResult {
  videoBuffer: Buffer
  durationSeconds: number
  fileSizeBytes: number
  contentType: string
}

type TopicType =
  | 'evaporation'
  | 'condensation'
  | 'precipitation'
  | 'water-cycle'
  | 'genetics-biology'
  | 'neural-network-cs'
  | 'physics-waves'
  | 'general-science'

export function detectTopicType(metadata?: RenderMetadata, slides: VisualSlideCue[] = []): TopicType {
  const title = (metadata?.subtopicTitle || '').toLowerCase()
  const docTitle = (metadata?.documentTitle || '').toLowerCase()
  const subject = (metadata?.subject || '').toLowerCase()
  const script = (metadata?.narrationScript || '').toLowerCase()
  const slideText = slides
    .map((s) => `${s.mainHeadline} ${s.subHeadline} ${s.chapterTitle} ${s.keyFormulaOrTakeaway}`)
    .join(' ')
    .toLowerCase()

  // 1. Prioritize specific subtopic title first so topics never get cross-mapped!
  if (title.includes('condens') || title.includes('dew')) return 'condensation'
  if (title.includes('precipitat') || title.includes('rain') || title.includes('snow') || title.includes('sleet') || title.includes('hail')) return 'precipitation'
  if (title.includes('evaporat') || title.includes('boil') || title.includes('steam')) return 'evaporation'
  if (title.includes('water cycle') || title.includes('runoff') || title.includes('infiltrat') || title.includes('collection') || title.includes('groundwater')) return 'water-cycle'
  if (title.includes('dna') || title.includes('crispr') || title.includes('gene') || title.includes('genetic') || title.includes('cell') || title.includes('mitosis') || title.includes('protein')) return 'genetics-biology'
  if (title.includes('neural') || title.includes('ai') || title.includes('machine learning') || title.includes('network') || title.includes('cloud') || title.includes('algorithm') || title.includes('software')) return 'neural-network-cs'
  if (title.includes('wave') || title.includes('quantum') || title.includes('frequency') || title.includes('photon') || title.includes('light') || title.includes('sound') || title.includes('physic')) return 'physics-waves'

  // 2. Strict content inspection
  if (title.includes('cycle') || docTitle.includes('cycle') || slideText.includes('water cycle') || script.includes('water cycle')) {
    return 'water-cycle'
  }
  if (script.includes('condens') || slideText.includes('condens') || script.includes('tiny droplets') || script.includes('form clouds')) {
    return 'condensation'
  }
  if (script.includes('precipitat') || slideText.includes('precipitat') || script.includes('heavy droplets fall') || script.includes('rain')) {
    return 'precipitation'
  }
  if (script.includes('evaporat') || slideText.includes('evaporat') || script.includes('heats liquid water') || script.includes('surface water')) {
    return 'evaporation'
  }
  if (subject.includes('bio') || docTitle.includes('bio') || script.includes('dna') || script.includes('cell')) {
    return 'genetics-biology'
  }
  if (subject.includes('cs') || subject.includes('computer') || script.includes('neural') || script.includes('algorithm')) {
    return 'neural-network-cs'
  }
  if (subject.includes('physic') || script.includes('wave') || script.includes('quantum')) {
    return 'physics-waves'
  }

  return 'general-science'
}

/**
 * Renders an 8-second animated educational motion graphics video.
 * Runs at 20 FPS (160 smoothly interpolated vector frames) with synchronized narration audio.
 */
export async function renderCurriculumVideo(
  slides: VisualSlideCue[],
  audioBuffer: Buffer,
  totalDurationSeconds: number = REEL_DURATION_SECONDS,
  onStage?: (event: 'frames-completed' | 'ffmpeg-completed') => void,
  metadata?: RenderMetadata
): Promise<RenderedVideoResult> {
  const binary = resolveFfmpegPath()
  ffmpeg.setFfmpegPath(binary)

  const tempDir = path.join(os.tmpdir(), `learnverse-anim-${Date.now()}-${Math.random().toString(36).substring(7)}`)
  fs.mkdirSync(tempDir, { recursive: true })

  const fps = 20 // 20 FPS gives 160 smoothly interpolated vector frames
  const totalFrames = fps * totalDurationSeconds
  const frameDuration = 1 / fps
  const topic = detectTopicType(metadata, slides)

  const audioFilePath = path.join(tempDir, 'narration.mp3')
  const outputMp4Path = path.join(tempDir, 'output.mp4')
  const concatListPath = path.join(tempDir, 'concat_list.txt')

  try {
    fs.writeFileSync(audioFilePath, audioBuffer)

    const slidePaths: string[] = []
    const concatLines: string[] = []

    // Render frames in concurrent batches of 16 for high speed
    const batchSize = 16
    for (let batchStart = 0; batchStart < totalFrames; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, totalFrames)
      const framePromises: Promise<void>[] = []

      for (let frameIdx = batchStart; frameIdx < batchEnd; frameIdx++) {
        const timeSec = frameIdx / fps
        const progress = timeSec / totalDurationSeconds

        const promise = (async () => {
          const svgContent = generateBrightAnimatedSvgFrame({
            timeSec,
            progress,
            totalDuration: totalDurationSeconds,
            topic,
            slides,
            metadata,
          })

          const pngBuffer = await sharp(Buffer.from(svgContent)).png().toBuffer()
          const framePngPath = path.join(tempDir, `frame_${String(frameIdx).padStart(4, '0')}.png`)
          fs.writeFileSync(framePngPath, pngBuffer)
          slidePaths[frameIdx] = framePngPath
        })()

        framePromises.push(promise)
      }

      await Promise.all(framePromises)
    }

    // Build FFmpeg concat list
    for (let i = 0; i < totalFrames; i++) {
      const normalizedPath = slidePaths[i].replace(/\\/g, '/')
      concatLines.push(`file '${normalizedPath}'`)
      concatLines.push(`duration ${frameDuration}`)
    }
    if (slidePaths.length > 0) {
      const lastPath = slidePaths[slidePaths.length - 1].replace(/\\/g, '/')
      concatLines.push(`file '${lastPath}'`)
    }

    fs.writeFileSync(concatListPath, concatLines.join('\n'))
    onStage?.('frames-completed')

    // Run FFmpeg to encode clean 8s MP4
    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(concatListPath)
        .inputOptions(['-f concat', '-safe 0'])
        .input(audioFilePath)
        .outputOptions([
          '-c:v libx264',
          '-pix_fmt yuv420p',
          '-r 30',
          '-c:a aac',
          '-b:a 128k',
          '-t', String(totalDurationSeconds),
          '-movflags +faststart',
        ])
        .output(outputMp4Path)
        .on('start', (cmdLine) => {
          console.log('[FFmpeg Animated Reel Started]:', cmdLine)
        })
        .on('error', (err, stdout, stderr) => {
          console.error('[FFmpeg Animated Reel Error]:', err?.message, stderr)
          reject(new Error(`FFmpeg rendering failed: ${err?.message || stderr}`))
        })
        .on('end', () => {
          console.log('[FFmpeg Animated Reel Complete]')
          onStage?.('ffmpeg-completed')
          resolve()
        })
        .run()
    })

    const videoBuffer = fs.readFileSync(outputMp4Path)
    return {
      videoBuffer,
      durationSeconds: totalDurationSeconds,
      fileSizeBytes: videoBuffer.length,
      contentType: 'video/mp4',
    }
  } finally {
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true })
      }
    } catch {
      // Ignore cleanup error
    }
  }
}

interface FrameParams {
  timeSec: number
  progress: number
  totalDuration: number
  topic: TopicType
  slides: VisualSlideCue[]
  metadata?: RenderMetadata
}

/**
 * Generates an educational motion graphics frame (1080x1920 vertical format).
 * Clear visual hierarchy:
 * - Top safe zone (y: 60-190): Title badge, animated progress line, dynamic phase callout pill.
 * - Center visual zone (y: 220-1650): 100% clean cinematic animation.
 * - Bottom area: reserved for web player captions.
 */
function generateBrightAnimatedSvgFrame({
  timeSec,
  progress,
  totalDuration,
  topic,
  slides,
  metadata,
}: FrameParams): string {
  const width = 1080
  const height = 1920
  const t = Math.max(0, Math.min(totalDuration, timeSec))
  const p = Math.max(0, Math.min(1, progress))

  const subtopicTitle = metadata?.subtopicTitle || slides[0]?.mainHeadline || 'Core Principle'
  const displayTitle = subtopicTitle

  // Smooth camera zoom & pan with gentle easing
  let cameraZoom = 1.0
  let cameraPanY = 0

  if (t < 2.0) {
    const ease = t / 2.0
    cameraZoom = 1.0 + ease * 0.04
    cameraPanY = -ease * 15
  } else if (t < 5.0) {
    const ease = (t - 2.0) / 3.0
    cameraZoom = 1.04 + ease * 0.08
    cameraPanY = -15 - ease * 40
  } else {
    const ease = (t - 5.0) / 3.0
    cameraZoom = 1.12 - ease * 0.04
    cameraPanY = -55 + ease * 35
  }

  // Active Scene Visual Rendering & Stage Labels
  let sceneSvg = ''
  let activeSceneLabel = ''

  switch (topic) {
    case 'evaporation':
      sceneSvg = renderBrightEvaporationScene(t, p)
      if (t < 2.5) activeSceneLabel = 'Phase 1: Solar Heat Energizes Surface Water'
      else if (t < 5.5) activeSceneLabel = 'Phase 2: Molecules Escape Liquid State'
      else activeSceneLabel = 'Phase 3: Rising Water Vapour Enters Sky'
      break

    case 'condensation':
      sceneSvg = renderBrightCondensationScene(t, p)
      if (t < 2.5) activeSceneLabel = 'Phase 1: Warm Vapour Reaches Cold Altitude'
      else if (t < 5.5) activeSceneLabel = 'Phase 2: Vapour Coalesces Around Nuclei'
      else activeSceneLabel = 'Phase 3: Droplets Form Visible Clouds'
      break

    case 'precipitation':
      sceneSvg = renderBrightPrecipitationScene(t, p)
      if (t < 2.5) activeSceneLabel = 'Phase 1: Cloud Droplets Grow in Weight'
      else if (t < 5.5) activeSceneLabel = 'Phase 2: Gravity Pulls Rainfall to Earth'
      else activeSceneLabel = 'Phase 3: Water Collects on Ground & Rivers'
      break

    case 'water-cycle':
      sceneSvg = renderBrightWaterCycleScene(t, p)
      if (t < 2.5) activeSceneLabel = 'Continuous Cycle: Evaporation from Oceans'
      else if (t < 5.0) activeSceneLabel = 'Condensation & Cloud Movement over Land'
      else activeSceneLabel = 'Precipitation, Surface Runoff & Infiltration'
      break

    case 'genetics-biology':
      sceneSvg = renderBrightGeneticsScene(t, p)
      activeSceneLabel = 'Molecular DNA Double Helix Targeting'
      break

    case 'neural-network-cs':
      sceneSvg = renderBrightNeuralNetworkScene(t, p)
      activeSceneLabel = 'Synaptic Neural Weight Propagation'
      break

    case 'physics-waves':
      sceneSvg = renderBrightPhysicsWavesScene(t, p)
      activeSceneLabel = 'Electromagnetic Wave Energy & Frequency'
      break

    default:
      sceneSvg = renderBrightGeneralScienceScene(t, p)
      activeSceneLabel = 'Core Scientific Principle in Motion'
      break
  }

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Deep Atmospheric Glow Filters -->
        <filter id="glowFilter" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <!-- Dynamic Sky Background Gradients based on topic -->
        ${
          topic === 'condensation'
            ? `
          <linearGradient id="mainBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0B132B"/>
            <stop offset="35%" stop-color="#1C2541"/>
            <stop offset="70%" stop-color="#2D4059"/>
            <stop offset="100%" stop-color="#4A6572"/>
          </linearGradient>
        `
            : topic === 'precipitation'
            ? `
          <linearGradient id="mainBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1E293B"/>
            <stop offset="40%" stop-color="#334155"/>
            <stop offset="80%" stop-color="#475569"/>
            <stop offset="100%" stop-color="#64748B"/>
          </linearGradient>
        `
            : `
          <linearGradient id="mainBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0284C7"/>
            <stop offset="40%" stop-color="#38BDF8"/>
            <stop offset="75%" stop-color="#BAE6FD"/>
            <stop offset="100%" stop-color="#F0F9FF"/>
          </linearGradient>
        `
        }

        <!-- Water Gradients -->
        <linearGradient id="waterSurfaceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.9"/>
          <stop offset="20%" stop-color="#0284C7"/>
          <stop offset="65%" stop-color="#0369A1"/>
          <stop offset="100%" stop-color="#0C4A6E"/>
        </linearGradient>

        <!-- Sun Radial Glow -->
        <radialGradient id="sunAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFFBEB"/>
          <stop offset="40%" stop-color="#FDE047"/>
          <stop offset="75%" stop-color="#F59E0B"/>
          <stop offset="100%" stop-color="#EA580C" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <!-- Background Canvas -->
      <rect width="${width}" height="${height}" fill="url(#mainBgGrad)"/>

      <!-- Camera Zoom/Pan Container for Cinematic Motion -->
      <g transform="translate(540, 960) scale(${cameraZoom.toFixed(4)}) translate(-540, ${(-960 + cameraPanY).toFixed(2)})">
        ${sceneSvg}
      </g>

      <!-- TOP SAFE ZONE: Elegant Glassmorphism Header -->
      <g transform="translate(50, 55)">
        <rect x="0" y="0" width="${Math.min(560, Math.max(340, displayTitle.length * 14 + 70))}" height="52" rx="26" fill="#090D16" fill-opacity="0.82" stroke="#38BDF8" stroke-width="1.2" stroke-opacity="0.5"/>
        <circle cx="26" cy="26" r="7" fill="#38BDF8" filter="url(#softGlow)"/>
        <text x="44" y="33" fill="#FFFFFF" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="700" letter-spacing="0.3">${escapeXml(displayTitle.length > 30 ? displayTitle.substring(0, 30) + '...' : displayTitle)}</text>
      </g>

      <!-- 8-Second High-Precision Progress Line -->
      <g transform="translate(50, 122)">
        <rect x="0" y="0" width="980" height="5" rx="2.5" fill="#090D16" fill-opacity="0.35"/>
        <rect x="0" y="0" width="${Math.max(16, Math.round(980 * p))}" height="5" rx="2.5" fill="#38BDF8" filter="url(#softGlow)"/>
      </g>

      <!-- Active Phase Pill (Placed Safely in Upper Area, Leaving Center & Lower Screen Open) -->
      ${
        activeSceneLabel && t < 7.2
          ? `
        <g transform="translate(50, 142)">
          <rect x="0" y="0" width="460" height="38" rx="19" fill="#090D16" fill-opacity="0.75" stroke="#38BDF8" stroke-width="1" stroke-opacity="0.4"/>
          <circle cx="19" cy="19" r="4.5" fill="#38BDF8"/>
          <text x="32" y="24" fill="#BAE6FD" font-family="system-ui, sans-serif" font-size="14" font-weight="600" letter-spacing="0.2">${escapeXml(activeSceneLabel)}</text>
        </g>
      `
          : ''
      }
    </svg>
  `
}

/**
 * SCENE 1: EVAPORATION
 * Rich fluid water dynamics, warm solar radiation with rotating corona,
 * molecular vibration and phase transition into rising buoyant vapour plumes.
 */
function renderBrightEvaporationScene(t: number, p: number): string {
  const sunX = 860
  const sunY = 320
  const sunRadius = 115 + 6 * Math.sin(t * 3.5)

  // Rotating solar flare rays
  const sunRays = Array.from({ length: 14 })
    .map((_, i) => {
      const angle = (i * (360 / 14) + t * 18) * (Math.PI / 180)
      const x1 = sunX + 130 * Math.cos(angle)
      const y1 = sunY + 130 * Math.sin(angle)
      const length = 175 + 20 * Math.sin(t * 4 + i)
      const x2 = sunX + length * Math.cos(angle)
      const y2 = sunY + length * Math.sin(angle)
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#FDE047" stroke-width="4.5" stroke-linecap="round" opacity="0.75"/>`
    })
    .join('\n')

  // Light energy beams radiating towards the lake
  const lightBeams = [0, 1, 2, 3]
    .map((i) => {
      const phase = ((t * 0.4 + i * 0.25) % 1)
      const startX = sunX - 60 - i * 50
      const startY = sunY + 70 + i * 25
      const endX = 200 + i * 200
      const endY = 1250
      const curX = startX + (endX - startX) * phase
      const curY = startY + (endY - startY) * phase
      return `
        <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="#FEF08A" stroke-width="2" stroke-dasharray="25 18" opacity="0.3"/>
        <circle cx="${curX.toFixed(1)}" cy="${curY.toFixed(1)}" r="6" fill="#FFFBEB" opacity="0.85" filter="url(#glowFilter)"/>
      `
    })
    .join('\n')

  // Multi-layered fluid water waves
  const waterLevel = 1200
  const waveAmp1 = 14 + 5 * Math.sin(t * 5)
  const waveAmp2 = 18 + 7 * Math.sin(t * 4 + 1.5)
  const wavePath1 = `M 0 ${waterLevel} Q 270 ${waterLevel - waveAmp1} 540 ${waterLevel + waveAmp1} T 1080 ${waterLevel} V 1920 H 0 Z`
  const wavePath2 = `M 0 ${waterLevel + 30} Q 270 ${waterLevel + 30 + waveAmp2} 540 ${waterLevel + 30 - waveAmp2} T 1080 ${waterLevel + 30} V 1920 H 0 Z`

  // Thermal convection shimmer waves rising from surface
  const heatShimmer = [180, 360, 540, 720, 900]
    .map((x, idx) => {
      const yShift = ((t * 110 + idx * 45) % 240)
      const curY = waterLevel - 20 - yShift
      const amp = 16 * Math.sin(t * 6 + idx)
      return `
        <path d="M ${x} ${curY} Q ${x + amp} ${curY - 40} ${x} ${curY - 80} T ${x} ${curY - 140}" stroke="#FDE047" stroke-width="2.5" fill="none" opacity="${Math.max(0, 0.6 - yShift / 300).toFixed(2)}" stroke-linecap="round"/>
      `
    })
    .join('\n')

  // H2O molecules vibrating and escaping
  const molecules = Array.from({ length: 12 })
    .map((_, i) => {
      const baseX = 100 + i * 80
      const isEscaping = t > 2.2 && i % 2 === 0
      let mx = baseX
      let my = waterLevel + 60

      if (isEscaping) {
        const riseProgress = t - 2.2
        const speed = 190 + (i % 4) * 45
        my = waterLevel + 60 - ((riseProgress * speed + i * 40) % 950)
        mx = baseX + 40 * Math.sin(t * 4 + i * 1.5)
      } else {
        const vibSpeed = t > 1.2 ? 26 : 8
        const vibAmp = t > 1.2 ? 9 : 3
        mx += Math.sin(t * vibSpeed + i) * vibAmp
        my += Math.cos(t * vibSpeed + i * 2) * (vibAmp * 0.7)
      }

      const opacity = my < 380 ? Math.max(0, (my - 280) / 100) : 0.95

      return `
        <g transform="translate(${mx.toFixed(1)}, ${my.toFixed(1)})" opacity="${opacity.toFixed(2)}">
          <!-- Oxygen atom -->
          <circle cx="0" cy="0" r="14" fill="#EF4444" stroke="#B91C1C" stroke-width="2" filter="url(#softGlow)"/>
          <!-- Hydrogen bond 1 -->
          <line x1="0" y1="0" x2="-12" y2="-12" stroke="#CBD5E1" stroke-width="3"/>
          <circle cx="-12" cy="-12" r="7.5" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.5"/>
          <!-- Hydrogen bond 2 -->
          <line x1="0" y1="0" x2="12" y2="-12" stroke="#CBD5E1" stroke-width="3"/>
          <circle cx="12" cy="-12" r="7.5" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.5"/>
        </g>
      `
    })
    .join('\n')

  // Rising buoyant vapour plumes & steam clouds
  let vapourStream = ''
  if (t > 2.0) {
    vapourStream = Array.from({ length: 18 })
      .map((_, i) => {
        const laneX = 120 + i * 50
        const speed = 160 + (i % 5) * 35
        const dist = ((t - 2.0) * speed + i * 65) % 900
        const vy = waterLevel - 30 - dist
        const vx = laneX + 35 * Math.sin(t * 3.5 + i * 1.2)
        const vSize = 14 + (i % 3) * 8
        const vOpacity = vy < 350 ? Math.max(0, (vy - 250) / 100) : 0.75

        return `
          <g transform="translate(${vx.toFixed(1)}, ${vy.toFixed(1)})" opacity="${vOpacity.toFixed(2)}">
            <circle cx="0" cy="0" r="${vSize}" fill="#FFFFFF" opacity="0.6" filter="url(#glowFilter)"/>
            <circle cx="0" cy="0" r="${(vSize * 0.65).toFixed(1)}" fill="#BAE6FD" opacity="0.85"/>
          </g>
        `
      })
      .join('\n')
  }

  return `
    <!-- Distant hills for environmental scale -->
    <path d="M -20 1220 Q 260 1060 540 1160 T 1100 1100 L 1100 1260 L -20 1260 Z" fill="#059669" opacity="0.65"/>
    <path d="M -20 1240 Q 200 1120 480 1200 T 1100 1160 L 1100 1280 L -20 1280 Z" fill="#10B981" opacity="0.85"/>

    <!-- Radiant Sun with Atmospheric Aura -->
    <g>
      <circle cx="${sunX}" cy="${sunY}" r="${sunRadius + 75}" fill="url(#sunAura)"/>
      <circle cx="${sunX}" cy="${sunY}" r="${sunRadius}" fill="#FBBF24" filter="url(#glowFilter)"/>
      <circle cx="${sunX}" cy="${sunY}" r="${(sunRadius * 0.75).toFixed(1)}" fill="#FEF08A"/>
      ${sunRays}
    </g>

    <!-- Solar Energy Transfer Beams -->
    ${lightBeams}

    <!-- Heat Convection Shimmer -->
    ${heatShimmer}

    <!-- Rising Vapour Particles -->
    ${vapourStream}

    <!-- Clear Layered Lake Body -->
    <g>
      <path d="${wavePath2}" fill="#0284C7" opacity="0.6"/>
      <path d="${wavePath1}" fill="url(#waterSurfaceGrad)"/>
      <path d="${wavePath1}" stroke="#7DD3FC" stroke-width="4.5" fill="none" opacity="0.95"/>
      <!-- Internal liquid molecules -->
      ${molecules}
    </g>
  `
}

/**
 * SCENE 2: CONDENSATION
 * High-altitude cooling, condensation nuclei nucleation,
 * droplets coalescing into dynamic, billowy volumetric cloud decks.
 */
function renderBrightCondensationScene(t: number, p: number): string {
  const cloudScale = Math.min(1.3, 0.8 + (t / 8.0) * 0.5)
  const cloudX = 540
  const cloudY = 620

  // Rising warm water vapour gas streams cooling as they ascend
  const risingVapourParticles = Array.from({ length: 22 })
    .map((_, i) => {
      const baseX = 160 + i * 36
      const speed = 140 + (i % 4) * 30
      const yPos = 1600 - ((t * speed + i * 70) % 1100)
      const xPos = baseX + 25 * Math.sin(t * 3 + i)
      const size = 9 + (i % 3) * 5
      // Turns bluer and more defined as it approaches cold condensation zone
      const isCold = yPos < 900
      const fill = isCold ? '#38BDF8' : '#FFFFFF'
      const opacity = yPos > 1450 ? 0.9 : yPos < 650 ? Math.max(0, (yPos - 520) / 130) : 0.85

      return `<circle cx="${xPos.toFixed(1)}" cy="${yPos.toFixed(1)}" r="${size}" fill="${fill}" opacity="${opacity.toFixed(2)}" filter="url(#glowFilter)"/>`
    })
    .join('\n')

  // Microscopic Condensation Nuclei (aerosol seed particles with orbital capture rings)
  const nuclei = [
    { x: 380, y: 720 },
    { x: 540, y: 660 },
    { x: 700, y: 730 },
    { x: 460, y: 840 },
    { x: 620, y: 820 },
  ]
    .map((n, idx) => {
      const ringScale = 1 + 0.3 * Math.sin(t * 4 + idx)
      return `
        <g transform="translate(${n.x}, ${n.y})">
          <circle cx="0" cy="0" r="9" fill="#FBBF24" filter="url(#glowFilter)"/>
          <circle cx="0" cy="0" r="${(22 * ringScale).toFixed(1)}" fill="none" stroke="#38BDF8" stroke-width="2" stroke-dasharray="5 4" opacity="0.7"/>
        </g>
      `
    })
    .join('\n')

  // Glistening coalesced liquid micro-droplets swarming into cloud mass
  const droplets = Array.from({ length: 26 })
    .map((_, i) => {
      const angle = (i * 24 + t * 20) * (Math.PI / 180)
      const orbitR = (90 + (i % 5) * 35) * cloudScale
      const dx = cloudX + orbitR * Math.cos(angle)
      const dy = cloudY + (orbitR * 0.55) * Math.sin(angle)
      const dSize = 7 + (i % 4) * 3.5

      return `
        <g transform="translate(${dx.toFixed(1)}, ${dy.toFixed(1)})">
          <circle cx="0" cy="0" r="${dSize}" fill="#0284C7" filter="url(#glowFilter)"/>
          <circle cx="-2" cy="-2" r="${(dSize * 0.4).toFixed(1)}" fill="#E0F2FE"/>
        </g>
      `
    })
    .join('\n')

  return `
    <!-- High Altitude Cold Troposphere Atmosphere Indicator Lines -->
    <g opacity="0.4">
      <line x1="80" y1="920" x2="1000" y2="920" stroke="#38BDF8" stroke-width="2" stroke-dasharray="14 10"/>
      <text x="100" y="905" fill="#38BDF8" font-family="system-ui, sans-serif" font-size="16" font-weight="700">Cold Air Boundary (0°C Dew Point)</text>
    </g>

    <!-- Rising Gas Vapour Plumes -->
    ${risingVapourParticles}

    <!-- Microscopic Nucleation Centers -->
    ${nuclei}

    <!-- Volumetric Expanding Cumulus Cloud Deck -->
    <g transform="translate(${cloudX}, ${cloudY}) scale(${cloudScale.toFixed(3)}) translate(-${cloudX}, -${cloudY})">
      <!-- Ambient Back Shadow -->
      <circle cx="${cloudX - 220}" cy="${cloudY + 20}" r="140" fill="#475569" opacity="0.5"/>
      <circle cx="${cloudX + 220}" cy="${cloudY + 20}" r="135" fill="#475569" opacity="0.5"/>
      <circle cx="${cloudX}" cy="${cloudY - 90}" r="170" fill="#64748B" opacity="0.4"/>

      <!-- Mid Volumetric Cloud Lobes -->
      <circle cx="${cloudX - 170}" cy="${cloudY}" r="140" fill="#E2E8F0" opacity="0.95"/>
      <circle cx="${cloudX + 170}" cy="${cloudY}" r="130" fill="#E2E8F0" opacity="0.95"/>
      <circle cx="${cloudX - 80}" cy="${cloudY + 60}" r="120" fill="#CBD5E1"/>
      <circle cx="${cloudX + 90}" cy="${cloudY + 60}" r="115" fill="#CBD5E1"/>

      <!-- Front Highlighted Cloud Center -->
      <circle cx="${cloudX}" cy="${cloudY - 70}" r="160" fill="#FFFFFF" filter="url(#softGlow)"/>
      <circle cx="${cloudX - 60}" cy="${cloudY - 20}" r="130" fill="#FFFFFF"/>
      <circle cx="${cloudX + 60}" cy="${cloudY - 20}" r="125" fill="#FFFFFF"/>
    </g>

    <!-- Coalesced Liquid Droplets Orbiting inside Cloud Base -->
    ${droplets}
  `
}

/**
 * SCENE 3: PRECIPITATION
 * Heavy saturated nimbostratus clouds, falling rain streaks with realistic angles,
 * water collection, and concentric ground splash ripples.
 */
function renderBrightPrecipitationScene(t: number, p: number): string {
  const rainCount = 42
  const rainStreaks = Array.from({ length: rainCount })
    .map((_, i) => {
      const baseX = 40 + i * 24
      const fallSpeed = 950 + (i % 6) * 70
      const curY = 560 + ((t * fallSpeed + i * 38) % 960)
      const curX = baseX + (curY - 560) * 0.14
      const length = 52 + (i % 4) * 20
      const opacity = curY > 1460 ? Math.max(0, (1520 - curY) / 60) : 0.85

      return `
        <line x1="${curX.toFixed(1)}" y1="${curY.toFixed(1)}" x2="${(curX + length * 0.14).toFixed(1)}" y2="${(curY + length).toFixed(1)}" stroke="#38BDF8" stroke-width="${3 + (i % 3)}" stroke-linecap="round" opacity="${opacity.toFixed(2)}"/>
      `
    })
    .join('\n')

  // Water collection surface ripples and splashes at bottom
  const splashes = [160, 320, 500, 680, 860, 960]
    .map((x, idx) => {
      const phase = (t * 4.2 + idx * 0.6) % 1
      const rx = 12 + phase * 45
      const ry = 5 + phase * 16
      const opacity = 1 - phase

      return `
        <ellipse cx="${x}" cy="1520" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="none" stroke="#7DD3FC" stroke-width="2.5" opacity="${opacity.toFixed(2)}"/>
        <circle cx="${(x - 8 + phase * 16).toFixed(1)}" cy="${(1512 - phase * 22).toFixed(1)}" r="3" fill="#BAE6FD" opacity="${opacity.toFixed(2)}"/>
      `
    })
    .join('\n')

  return `
    <!-- Saturated Dark Rain Clouds Deck -->
    <g transform="translate(540, 480)">
      <circle cx="-260" cy="0" r="160" fill="#1E293B"/>
      <circle cx="260" cy="0" r="150" fill="#1E293B"/>
      <circle cx="0" cy="-110" r="190" fill="#334155" filter="url(#glowFilter)"/>
      <circle cx="-130" cy="40" r="150" fill="#1E293B"/>
      <circle cx="130" cy="40" r="145" fill="#1E293B"/>
      <circle cx="0" cy="50" r="160" fill="#0F172A"/>
    </g>

    <!-- Falling Raindrop Streaks -->
    ${rainStreaks}

    <!-- Landscape Water Collection Layer & Ripples -->
    <g>
      <rect x="0" y="1520" width="1080" height="400" fill="url(#waterSurfaceGrad)"/>
      <line x1="0" y1="1520" x2="1080" y2="1520" stroke="#7DD3FC" stroke-width="4.5"/>
      ${splashes}
    </g>
  `
}

/**
 * SCENE 4: WATER CYCLE PANORAMA
 * A full landscape cutaway: Ocean on left, mountains on right,
 * continuous cyclic loop linking Evaporation -> Condensation -> Precipitation -> Runoff.
 */
function renderBrightWaterCycleScene(t: number, p: number): string {
  // Animated cyclic particle loop traveling around the cycle pathway
  const cycleLoopParticles = Array.from({ length: 12 })
    .map((_, i) => {
      const progress = ((t * 0.18 + i / 12) % 1)
      let px = 0
      let py = 0

      // Quadrant 1: Evaporation (Ocean up to sky)
      if (progress < 0.25) {
        const sub = progress / 0.25
        px = 240 + sub * 80
        py = 1350 - sub * 750
      }
      // Quadrant 2: Condensation & drift toward mountains
      else if (progress < 0.5) {
        const sub = (progress - 0.25) / 0.25
        px = 320 + sub * 480
        py = 600 - Math.sin(sub * Math.PI) * 50
      }
      // Quadrant 3: Precipitation over mountains
      else if (progress < 0.75) {
        const sub = (progress - 0.5) / 0.25
        px = 800 + sub * 40
        py = 600 + sub * 600
      }
      // Quadrant 4: Surface Runoff & Infiltration back to Ocean
      else {
        const sub = (progress - 0.75) / 0.25
        px = 840 - sub * 600
        py = 1200 + sub * 150
      }

      return `
        <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="10" fill="#38BDF8" filter="url(#glowFilter)"/>
        <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="5" fill="#FFFFFF"/>
      `
    })
    .join('\n')

  return `
    <!-- Mountain Peaks (Right) -->
    <polygon points="680,1350 860,650 1040,1350" fill="#475569"/>
    <polygon points="760,1350 920,540 1080,1350" fill="#334155"/>
    <!-- Snow caps -->
    <polygon points="860,650 820,770 900,770" fill="#F8FAFC"/>
    <polygon points="920,540 880,660 960,660" fill="#F8FAFC"/>

    <!-- Rolling Green River Basin (Center) -->
    <path d="M 320 1350 Q 520 1150 720 1350 Z" fill="#10B981"/>
    <!-- River Runoff path back to ocean -->
    <path d="M 840 1200 Q 640 1260 380 1350" stroke="#0284C7" stroke-width="12" fill="none" stroke-linecap="round"/>

    <!-- Ocean Body (Left) -->
    <rect x="0" y="1320" width="380" height="600" fill="url(#waterSurfaceGrad)"/>
    <path d="M 0 1320 Q 95 1305 190 1320 T 380 1320" stroke="#7DD3FC" stroke-width="4" fill="none"/>

    <!-- Cloud Deck over Mountains (Top Right) -->
    <g transform="translate(800, 580)">
      <circle cx="-70" cy="0" r="70" fill="#CBD5E1"/>
      <circle cx="70" cy="0" r="65" fill="#CBD5E1"/>
      <circle cx="0" cy="-35" r="85" fill="#FFFFFF" filter="url(#softGlow)"/>
    </g>

    <!-- Solar Aura over Ocean (Top Left) -->
    <g transform="translate(240, 420)">
      <circle cx="0" cy="0" r="80" fill="url(#sunAura)"/>
      <circle cx="0" cy="0" r="55" fill="#FBBF24" filter="url(#softGlow)"/>
    </g>

    <!-- Continuous Energy Particle Stream Connecting the Entire Cycle -->
    ${cycleLoopParticles}
  `
}

/**
 * SCENE 5: GENETICS & BIOLOGY
 * Smooth 3D rotating DNA double helix with glowing nucleotide rungs.
 */
function renderBrightGeneticsScene(t: number, p: number): string {
  const rungs = Array.from({ length: 18 })
    .map((_, i) => {
      const y = 380 + i * 58
      const angle = t * 3.4 + i * 0.4
      const x1 = 540 + Math.sin(angle) * 180
      const x2 = 540 - Math.sin(angle) * 180
      const zScale = 0.8 + 0.3 * Math.cos(angle)
      const color1 = i % 2 === 0 ? '#10B981' : '#0284C7'
      const color2 = i % 2 === 0 ? '#F59E0B' : '#EF4444'

      return `
        <g>
          <line x1="${x1.toFixed(1)}" y1="${y}" x2="${x2.toFixed(1)}" y2="${y}" stroke="#64748B" stroke-width="4.5" opacity="${zScale.toFixed(2)}"/>
          <circle cx="${x1.toFixed(1)}" cy="${y}" r="${(15 * zScale).toFixed(1)}" fill="${color1}" filter="url(#glowFilter)"/>
          <circle cx="${x2.toFixed(1)}" cy="${y}" r="${(15 * zScale).toFixed(1)}" fill="${color2}" filter="url(#glowFilter)"/>
        </g>
      `
    })
    .join('\n')

  return `<g>${rungs}</g>`
}

/**
 * SCENE 6: NEURAL NETWORKS & CS
 */
function renderBrightNeuralNetworkScene(t: number, p: number): string {
  const nodes = [
    { x: 300, y: 520 }, { x: 300, y: 740 }, { x: 300, y: 960 },
    { x: 540, y: 440 }, { x: 540, y: 640 }, { x: 540, y: 840 }, { x: 540, y: 1040 },
    { x: 780, y: 640 }, { x: 780, y: 840 },
  ]

  const connections = [
    [0, 3], [0, 4], [1, 4], [1, 5], [2, 5], [2, 6],
    [3, 7], [4, 7], [5, 8], [6, 8],
  ]

  const lines = connections
    .map(([a, b], idx) => {
      const n1 = nodes[a]
      const n2 = nodes[b]
      const pulse = ((t * 3.5 + idx * 0.35) % 1)
      const px = n1.x + (n2.x - n1.x) * pulse
      const py = n1.y + (n2.y - n1.y) * pulse

      return `
        <line x1="${n1.x}" y1="${n1.y}" x2="${n2.x}" y2="${n2.y}" stroke="#64748B" stroke-width="3"/>
        <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="9" fill="#38BDF8" filter="url(#glowFilter)"/>
      `
    })
    .join('\n')

  const circles = nodes
    .map((n) => `<circle cx="${n.x}" cy="${n.y}" r="26" fill="#0284C7" stroke="#38BDF8" stroke-width="3" filter="url(#glowFilter)"/>`)
    .join('\n')

  return `<g>${lines}${circles}</g>`
}

/**
 * SCENE 7: PHYSICS & WAVE OSCILLATIONS
 */
function renderBrightPhysicsWavesScene(t: number, p: number): string {
  const wavePoints: string[] = []
  for (let x = 80; x <= 1000; x += 10) {
    const y = 800 + Math.sin((x / 90) + t * 4.5) * 140
    wavePoints.push(`${x},${y.toFixed(1)}`)
  }

  return `
    <g>
      <polyline points="${wavePoints.join(' ')}" fill="none" stroke="#38BDF8" stroke-width="8" stroke-linecap="round" filter="url(#glowFilter)"/>
      <circle cx="280" cy="${(800 + Math.sin(280 / 90 + t * 4.5) * 140).toFixed(1)}" r="18" fill="#F59E0B" filter="url(#glowFilter)"/>
      <circle cx="540" cy="${(800 + Math.sin(540 / 90 + t * 4.5) * 140).toFixed(1)}" r="18" fill="#10B981" filter="url(#glowFilter)"/>
      <circle cx="800" cy="${(800 + Math.sin(800 / 90 + t * 4.5) * 140).toFixed(1)}" r="18" fill="#EF4444" filter="url(#glowFilter)"/>
    </g>
  `
}

/**
 * SCENE 8: GENERAL SCIENCE PROCESS
 */
function renderBrightGeneralScienceScene(t: number, p: number): string {
  const pulse = 1 + Math.sin(t * 3.5) * 0.09
  return `
    <g transform="translate(540, 800) scale(${pulse.toFixed(3)}) translate(-540, -800)">
      <circle cx="540" cy="800" r="240" fill="none" stroke="#38BDF8" stroke-width="5" stroke-dasharray="24 14" filter="url(#glowFilter)"/>
      <circle cx="540" cy="800" r="140" fill="#090D16" stroke="#0284C7" stroke-width="6"/>
      <path d="M 490 800 L 530 840 L 595 765" fill="none" stroke="#38BDF8" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  `
}

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
