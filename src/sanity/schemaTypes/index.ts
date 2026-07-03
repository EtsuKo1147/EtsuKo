import { type SchemaTypeDefinition } from 'sanity'
import { workType } from './work'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [workType],
}
