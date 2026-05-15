import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Exclude /admin/* from next-intl locale routing — admin is internal, no locale prefix.
  matcher: "/((?!api|admin|_next|_vercel|.*\\..*).*)",
};
