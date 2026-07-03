export interface Work {
  id: string
  slug: string
  title: string
  category: WorkCategory
  categoryLabel: string
  year: string
  description: string
  summary: string
  role: string
  tools: string
  accent: string
  surface: string
  featured?: boolean
  href: string
  coverImageUrl?: string
  coverImageAlt?: string
  galleryImages?: WorkImage[]
}

export type WorkCategory = 'branding' | 'photography' | 'web' | 'graphic'

export interface WorkImage {
  url: string
  alt?: string
}

export const workCategories: { slug: WorkCategory; label: string }[] = [
  { slug: 'branding', label: 'Branding' },
  { slug: 'photography', label: 'Photography' },
  { slug: 'web', label: 'Web' },
  { slug: 'graphic', label: 'Graphic' },
]

export const works: Work[] = [
  {
    id: '01',
    slug: 'loop-identity-system',
    title: 'Loop Identity System',
    category: 'branding',
    categoryLabel: 'Branding',
    year: '2026',
    description: 'A flexible identity system for a small cultural studio.',
    summary:
      'Logo direction, color rules, and a compact visual language built for print and web touchpoints.',
    role: 'Logo / Visual Identity / Art Direction',
    tools: 'Illustrator / Photoshop',
    accent: '#ff8a3d',
    surface: '#eee8df',
    featured: true,
    href: '/works/loop-identity-system',
  },
  {
    id: '02',
    slug: 'ritual-roast-packaging',
    title: 'Ritual Roast Packaging',
    category: 'branding',
    categoryLabel: 'Branding',
    year: '2025',
    description: 'Coffee packaging with a warm mark system and simple shelf rhythm.',
    summary:
      'A placeholder packaging project focused on label hierarchy, repeatable patterns, and product family logic.',
    role: 'Packaging / Brand Assets',
    tools: 'Illustrator / Photoshop',
    accent: '#a64d2a',
    surface: '#f0dfcd',
    href: '/works/ritual-roast-packaging',
  },
  {
    id: '03',
    slug: 'north-pier-frames',
    title: 'North Pier Frames',
    category: 'photography',
    categoryLabel: 'Photography',
    year: '2025',
    description: 'A quiet photo study about light, concrete, and water edges.',
    summary:
      'A temporary photography series placeholder for sequencing, tonal direction, and cover composition tests.',
    role: 'Photography / Retouching / Color',
    tools: 'Lightroom / Photoshop',
    accent: '#4f7c90',
    surface: '#dce7e8',
    featured: true,
    href: '/works/north-pier-frames',
  },
  {
    id: '04',
    slug: 'after-rain-study',
    title: 'After Rain Study',
    category: 'photography',
    categoryLabel: 'Photography',
    year: '2024',
    description: 'Street details after rain, edited as a compact visual essay.',
    summary:
      'A placeholder image set for testing photography layout, spacing, and a softer editorial pace.',
    role: 'Photography / Editing',
    tools: 'Lightroom',
    accent: '#5c6f64',
    surface: '#e3e8df',
    href: '/works/after-rain-study',
  },
  {
    id: '05',
    slug: 'etsu-portfolio-system',
    title: 'Etsu Portfolio System',
    category: 'web',
    categoryLabel: 'Web',
    year: '2026',
    description: 'A personal portfolio system with playful navigation and visual rhythm.',
    summary:
      'Homepage direction, interaction pacing, works structure, and a future-friendly content model.',
    role: 'Web Design / Frontend Direction',
    tools: 'Next.js / CSS Modules',
    accent: '#363636',
    surface: '#ecebe6',
    featured: true,
    href: '/works/etsu-portfolio-system',
  },
  {
    id: '06',
    slug: 'archive-console',
    title: 'Archive Console',
    category: 'web',
    categoryLabel: 'Web',
    year: '2025',
    description: 'An experimental interface for browsing creative notes and assets.',
    summary:
      'A placeholder web project exploring dense information, small controls, and repeatable card systems.',
    role: 'UI Design / Interaction',
    tools: 'Figma / Next.js',
    accent: '#3267d6',
    surface: '#dfe7f6',
    href: '/works/archive-console',
  },
  {
    id: '07',
    slug: 'daily-board',
    title: 'Daily Board',
    category: 'web',
    categoryLabel: 'Web',
    year: '2024',
    description: 'A simple dashboard concept for routine planning and visual notes.',
    summary:
      'A compact screen design placeholder for testing lists, filters, and utility-first composition.',
    role: 'UI / Visual System',
    tools: 'Figma',
    accent: '#7a6ad8',
    surface: '#e7e1f3',
    href: '/works/daily-board',
  },
  {
    id: '08',
    slug: 'type-signal-posters',
    title: 'Type Signal Posters',
    category: 'graphic',
    categoryLabel: 'Graphic',
    year: '2025',
    description: 'Poster experiments using bold type, signal shapes, and tight contrast.',
    summary:
      'A graphic design placeholder for poster hierarchy, repeated motifs, and print-focused rhythm.',
    role: 'Poster / Typography',
    tools: 'Illustrator / Photoshop',
    accent: '#e6402f',
    surface: '#f2ded8',
    featured: true,
    href: '/works/type-signal-posters',
  },
  {
    id: '09',
    slug: 'festival-foldout',
    title: 'Festival Foldout',
    category: 'graphic',
    categoryLabel: 'Graphic',
    year: '2024',
    description: 'A folded event guide concept with modular grids and strong section marks.',
    summary:
      'A placeholder editorial project for testing booklet pacing, information blocks, and cover logic.',
    role: 'Editorial / Print',
    tools: 'InDesign / Illustrator',
    accent: '#2d8c65',
    surface: '#dceadf',
    href: '/works/festival-foldout',
  },
  {
    id: '10',
    slug: 'symbol-sheet',
    title: 'Symbol Sheet',
    category: 'graphic',
    categoryLabel: 'Graphic',
    year: '2023',
    description: 'Small symbol explorations arranged as a practical graphic library.',
    summary:
      'A placeholder icon and mark study for testing how small graphics behave inside project cards.',
    role: 'Icon / Graphic System',
    tools: 'Illustrator',
    accent: '#111111',
    surface: '#e9e4da',
    href: '/works/symbol-sheet',
  },
  {
    id: '11',
    slug: 'quiet-object-series',
    title: 'Quiet Object Series',
    category: 'photography',
    categoryLabel: 'Photography',
    year: '2023',
    description: 'Still-life image direction for objects, texture, and soft studio shadows.',
    summary:
      'A temporary photography placeholder for testing object-led project presentation and detail pages.',
    role: 'Photography / Direction',
    tools: 'Lightroom / Photoshop',
    accent: '#b5a26c',
    surface: '#ebe5d4',
    href: '/works/quiet-object-series',
  },
]
