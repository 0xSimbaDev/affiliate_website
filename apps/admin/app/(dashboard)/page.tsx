import { redirect } from 'next/navigation'

export default function DashboardPage() {
  // Redirect to sites list by default
  redirect('/sites')
}
