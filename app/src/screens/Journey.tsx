import { useCopy } from '@/copy'

export default function Journey() {
  const t = useCopy()
  return (
    <section>
      <h1 className="text-2xl">{t.tabs.journey}</h1>
    </section>
  )
}
