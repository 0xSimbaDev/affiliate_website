import { redirect } from 'next/navigation'

/**
 * Root page - redirects to the default site.
 *
 * In production, the proxy middleware handles domain routing.
 * This page only exists as a fallback and for development.
 *
 * Domain routing examples:
 * - thegaminghubguide.com -> /demo-gaming/
 * - techflow.com -> /demo-tech/
 * - demo-gaming.localhost:3000 -> /demo-gaming/
 * - localhost:3000?site=demo-tech -> /demo-tech/
 */
export default function Home() {
  // The proxy middleware should rewrite this to /{siteSlug}/
  // but if someone reaches this page directly, redirect to default site
  redirect('/demo-gaming')
}
