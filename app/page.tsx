import { redirect } from 'next/navigation'

/**
 * CreatorFlow opens in the workspace, not a marketing landing page.
 * A creator arrives here to decide what to make and publish next.
 */
export default function HomePage() {
  redirect(process.env.DEMO_MODE === 'true' ? '/dashboard' : '/auth/signin')
}
