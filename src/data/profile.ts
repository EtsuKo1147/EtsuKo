export const profileCopy = {
  en: {
    lead: [
      'A visual designer interested in web design,',
      'graphic design, illustration and photography.',
      'Currently exploring AI-assisted workflows',
      'in design, creating bold, playful visuals and',
      'interactive works.',
    ],
    items: [
      {
        label: 'Name',
        value: ['KoEtsu'],
      },
      {
        label: 'Education',
        value: ['Kobe Design University, M.A.'],
      },
      {
        label: 'Creative Skills',
        value: [
          'Web Design / UI Design',
          'Graphic Design / Logo Design / VI Design',
          'Poster Design / Banner Design / Illustration',
          'Photography / Photo Retouching / Color Grading',
        ],
      },
      {
        label: 'Main Tools',
        value: ['Photoshop / Illustrator / Lightroom / Codex / Claude Code'],
      },
      {
        label: 'Hobbies & Interests',
        value: ['Motorcycling / Drawing', 'Action Games / Board Games'],
      },
    ],
    languageLabel: 'Language',
    languageSwitch: '<Jp/En>',
  },
  jp: {
    lead: [
      '私はWebデザイン、グラフィックデザイン、イラスト、',
      '写真に興味を持つビジュアルデザイナーです。',
      'デザインにおけるAIを活用したワークフローを探求しながら、',
      '大胆で遊び心のあるビジュアル表現や',
      'インタラクティブな作品を制作しています。',
    ],
    items: [
      {
        label: '名　前',
        value: ['胡 越 / Ko Etsu'],
      },
      {
        label: '学　歴',
        value: ['神戸芸術工科大学 修士'],
      },
      {
        label: '制作スキル',
        value: [
          'Webデザイン / UIデザイン / グラフィックデザイン',
          'ロゴデザイン / ビジュアルアイデンティティデザイン',
          'ポスターデザイン / バナーデザイン / イラストレーション',
          '写真撮影 / 写真レタッチ / カラーグレーディング',
        ],
      },
      {
        label: '主な使用ツール',
        value: ['Photoshop / Illustrator / Lightroom / Codex / Claude Code'],
      },
      {
        label: '趣味・関心',
        value: ['バイク / 絵を描くこと', 'アクションゲーム / ボードゲーム'],
      },
    ],
    languageLabel: '言語',
    languageSwitch: '<En/Jp>',
  },
} as const

export type ProfileLanguage = keyof typeof profileCopy
