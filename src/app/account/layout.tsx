import { logout } from "@/actions/auth";
import { AccountNav } from "@/components/account/account-nav";

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <div className="container-page py-10">
      <p className="eyebrow">My account</p>
      <div className="mt-6 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        <aside className="flex flex-col gap-4">
          <AccountNav />
          <form action={logout}>
            <button type="submit" className="label-caps text-ink-muted underline hover:text-ink">Sign out</button>
          </form>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
