export interface Work {
  id: string
  title: string
  category: string
  year: string
  description: string
  href: string
}

export const works: Work[] = [
  {
    id: '01',
    title: 'Project One',
    category: 'Web Design',
    year: '2024',
    description: 'A placeholder project — something crafted with care.',
    href: '/works/project-one',
  },
  {
    id: '02',
    title: 'Project Two',
    category: 'Branding',
    year: '2024',
    description: 'Identity work, mark-making, and visual language.',
    href: '/works/project-two',
  },
  {
    id: '03',
    title: 'Project Three',
    category: 'Motion',
    year: '2023',
    description: 'Moving images and time-based storytelling.',
    href: '/works/project-three',
  },
]
