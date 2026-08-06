import { useCopy } from '@/copy'

export default function Today() {
  const t = useCopy()
  return (
    <section>
      <h1 className="text-2xl">{t.tabs.today}</h1>
      <p className="mt-2 text-[15px] text-ink-soft">{t.today.fresh.body}</p>
    </section>
  )
}
