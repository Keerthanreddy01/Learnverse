import { ReelItem } from '../types'

/**
 * Direct MP4 video streams hosted on Cloudinary
 */
export const CLOUDINARY_WATER_CYCLE_VIDEO =
  'https://res.cloudinary.com/aovh9hgj/video/upload/v1789143357/water_cycle_biology.mp4'

export const CLOUDINARY_EVAPORATION_VIDEO =
  'https://res.cloudinary.com/aovh9hgj/video/upload/v1789144068/What_is_Evaporation_kids.mp4'

export const CLOUDINARY_STATES_OF_MATTER_VIDEO =
  'https://res.cloudinary.com/aovh9hgj/video/upload/v1789185481/Let_s_Learn_3_STATES_OF_MATTER_shorts_explore_sciencefacts.mp4'

export const CLOUDINARY_KINETIC_PROJECT_VIDEO =
  'https://res.cloudinary.com/aovh9hgj/video/upload/v1789185948/Video_Project_6.mp4'

/**
 * ============================================================================
 * FEATURED MOBILE REELS (Direct MP4 Native Playback)
 * ============================================================================
 * Plays directly via expo-video VideoView with native hardware acceleration.
 * ============================================================================
 */
export const TEMPORARY_FEATURED_REELS: ReelItem[] = [
  {
    id: 'featured-reel-1',
    sourceType: 'direct',
    title: 'Photosynthesis & Water Cycle Dynamics',
    subject: 'Cellular Biology',
    curriculumTitle: 'Bioenergetics • ATP & Hydrologic Dynamics',
    subtopicId: 'sub-photosynthesis-water',
    subtopicTitle: 'Photosynthesis & Solar Transpiration',
    description: 'Solar energy drives water uptake and photolysis in plant chloroplasts, releasing oxygen and storing glucose.',
    learningObjective: 'Understand how solar photons power water molecule dissociation in photosynthesis.',
    duration: 15,
    videoUrl: CLOUDINARY_WATER_CYCLE_VIDEO,
    createdAt: new Date().toISOString(),
    isGenerated: true,
    status: 'ready',
    audioWaveform: [0.4, 0.8, 0.6, 0.9, 0.7, 0.5, 0.8, 0.6],
  },
  {
    id: 'featured-reel-2',
    sourceType: 'direct',
    title: 'Hydrologic Cycle & What is Evaporation',
    subject: 'Thermodynamics & Earth Science',
    curriculumTitle: 'Earth Science • Hydrologic Cycle',
    subtopicId: 'sub-evaporation',
    subtopicTitle: 'What is Evaporation & Solar Heat',
    description: 'Solar thermal energy energizes liquid water molecules to overcome surface tension and transition into atmospheric vapor.',
    learningObjective: 'Master the phase transition dynamics of water evaporation powered by solar radiation.',
    duration: 15,
    videoUrl: CLOUDINARY_EVAPORATION_VIDEO,
    createdAt: new Date().toISOString(),
    isGenerated: true,
    status: 'ready',
    audioWaveform: [0.3, 0.7, 0.9, 0.6, 0.8, 0.5, 0.9, 0.4],
  },
  {
    id: 'featured-reel-3',
    sourceType: 'direct',
    title: '3 States of Matter: Solid, Liquid & Gas',
    subject: 'Physical Chemistry',
    curriculumTitle: 'Matter & Thermodynamics • Fundamental States',
    subtopicId: 'sub-states-of-matter',
    subtopicTitle: 'Atomic Structure & Phase Properties',
    description: 'Examine how thermal kinetic energy alters molecular spacing and bonds across solid, liquid, and gaseous phases.',
    learningObjective: 'Differentiate between solids, liquids, and gases based on particle kinetic motion and bond structures.',
    duration: 15,
    videoUrl: CLOUDINARY_STATES_OF_MATTER_VIDEO,
    createdAt: new Date().toISOString(),
    isGenerated: true,
    status: 'ready',
    audioWaveform: [0.5, 0.9, 0.7, 0.4, 0.8, 0.6, 0.9, 0.5],
  },
  {
    id: 'featured-reel-4',
    sourceType: 'direct',
    title: 'Kinetic Molecular Theory & Phase Dynamics',
    subject: 'Thermal Physics',
    curriculumTitle: 'Thermodynamics • Molecular Dynamics',
    subtopicId: 'sub-kinetic-dynamics',
    subtopicTitle: 'Kinetic Theory & Energy Exchange',
    description: 'Understand how heat transfer drives microscopic molecular vibrations, phase transitions, and state changes.',
    learningObjective: 'Analyze how temperature increases kinetic energy and prompts state transitions.',
    duration: 15,
    videoUrl: CLOUDINARY_KINETIC_PROJECT_VIDEO,
    createdAt: new Date().toISOString(),
    isGenerated: true,
    status: 'ready',
    audioWaveform: [0.6, 0.8, 0.5, 0.9, 0.7, 0.6, 0.8, 0.7],
  },
]

