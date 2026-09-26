import { SetupCard } from '@/components/SetupCard'
import { env } from '@/lib/env'

const foundations = [
  {
    title: 'React + TypeScript',
    description: 'React 18 dengan TypeScript strict dan import alias @/.',
  },
  {
    title: 'Routing',
    description: 'React Router siap untuk route owner, admin, dan tentor.',
  },
  {
    title: 'Server state',
    description: 'TanStack Query tersedia untuk integrasi API dan cache data.',
  },
  {
    title: 'Design tokens',
    description: 'Token GrowDu telah dipetakan ke CSS custom properties.',
  },
] as const

export function SetupPage() {
  return (
    <main className="setup-page">
      <section className="setup-hero" aria-labelledby="setup-title">
        <div className="setup-hero__brand" aria-label="GrowDu">
          <span className="setup-hero__logo" aria-hidden="true">
            G
          </span>
          <span>GrowDu</span>
        </div>

        <div className="setup-hero__content">
          <span className="eyebrow">Frontend foundation</span>
          <h1 id="setup-title">Project siap dikembangkan</h1>
          <p>
            Fondasi dashboard GrowDu sudah aktif. Mulai implementasi dari app
            shell, autentikasi, lalu modul operasional sesuai dokumentasi MVP.
          </p>
        </div>

        <dl className="environment-card">
          <div>
            <dt>Environment</dt>
            <dd>{import.meta.env.MODE}</dd>
          </div>
          <div>
            <dt>API base URL</dt>
            <dd>{env.apiBaseUrl}</dd>
          </div>
        </dl>
      </section>

      <section className="setup-content" aria-labelledby="foundation-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Baseline</span>
            <h2 id="foundation-title">Fondasi yang tersedia</h2>
          </div>
          <span className="section-heading__count">{foundations.length} item</span>
        </div>

        <div className="setup-grid">
          {foundations.map((foundation) => (
            <SetupCard key={foundation.title} {...foundation} />
          ))}
        </div>

        <SetupCard
          title="App shell & autentikasi"
          description="Langkah berikutnya: bangun layout berbasis role dan sambungkan alur login ke API backend."
          status="next"
        />
      </section>
    </main>
  )
}

