import { redirect } from 'next/navigation'

export default function RootPage() {
  // Automatically redirect to dashboard
  redirect('/dashboard')
}
