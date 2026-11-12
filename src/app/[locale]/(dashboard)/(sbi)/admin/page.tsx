import { redirect } from 'next/navigation'

export default function AdminRedirect(): void {
  redirect('/others')
}
