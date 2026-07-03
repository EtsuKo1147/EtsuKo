import { getWorks } from '@/sanity/lib/works'
import WorksView from './WorksView'

export const metadata = { title: 'Works — Etsu.' }

export default async function WorksPage() {
  const works = await getWorks()

  return <WorksView works={works} />
}
