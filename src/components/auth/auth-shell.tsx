export function AuthShell({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: React.ReactNode }) {
  return (
    <div className="bg-canvas py-12 sm:py-20">
      <div className="container-page">
        <div className="mx-auto max-w-[440px] border border-line bg-white p-6 sm:p-10">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="heading-section mt-1">{title}</h1>
          <p className="mt-2 mb-8 text-sm text-ink-muted">{intro}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
