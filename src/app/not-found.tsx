import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="heading-section mt-2">Page not found</h1>
      <p className="mt-3 max-w-md text-sm text-ink-muted">The page you&apos;re looking for doesn&apos;t exist or may have moved.</p>
      <div className="mt-8 flex gap-2">
        <ButtonLink href="/shop" variant="dark">Shop the collection</ButtonLink>
        <ButtonLink href="/" variant="outline">Go home</ButtonLink>
      </div>
    </div>
  );
}
