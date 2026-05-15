/**
 * The login page uses the admin root layout (which provides the <html> shell)
 * but we need to override the sidebar. Since Next.js App Router composes
 * layouts from root down, and the root admin layout already wraps in
 * <html><body>, we cannot nest another <html> here.
 *
 * Instead, we override the admin layout ONLY for the login route by checking
 * at the layout level. The sidebar is rendered in AdminSidebar which is a
 * Client Component that can check the path — but the cleanest pattern for
 * login is a full-page takeover without the sidebar grid.
 *
 * We achieve this by rendering the login page inside a portal-like wrapper
 * that uses `fixed inset-0 z-50` so it visually covers the sidebar/content
 * grid. The sidebar is still rendered in DOM but hidden behind.
 *
 * For a cleaner separation, see `page.tsx` which uses `fixed inset-0` styling.
 */
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
