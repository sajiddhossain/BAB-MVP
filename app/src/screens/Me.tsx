import { useCopy } from '@/copy'

export default function Me() {
  const t = useCopy()
  return (
    <section>
      <h1 className="text-2xl">{t.me.title}</h1>
      <p className="mt-2 text-[15px] text-ink-soft">{t.me.collectingBody}</p>
    </section>
  )
}
