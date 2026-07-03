import { defineField, defineType } from 'sanity'

const categoryOptions = [
  { title: 'Branding', value: 'branding' },
  { title: 'Photography', value: 'photography' },
  { title: 'Web', value: 'web' },
  { title: 'Graphic', value: 'graphic' },
]

export const workType = defineType({
  name: 'work',
  title: 'Work',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: categoryOptions,
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'summary',
      title: 'Project Summary',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
    }),
    defineField({
      name: 'tools',
      title: 'Tools',
      type: 'string',
    }),
    defineField({
      name: 'accent',
      title: 'Accent Color',
      type: 'string',
      initialValue: '#363636',
      description: 'Hex color used by the placeholder design, for example #ff8a3d.',
    }),
    defineField({
      name: 'surface',
      title: 'Surface Color',
      type: 'string',
      initialValue: '#ecebe6',
      description: 'Hex background color used when this work has no uploaded image.',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'galleryImages',
      title: 'Gallery Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'coverImage',
      category: 'category',
      year: 'year',
    },
    prepare({ title, media, category, year }) {
      return {
        title,
        subtitle: [category, year].filter(Boolean).join(' / '),
        media,
      }
    },
  },
})
