import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import StationaerForm from '@/components/StationaerForm'

export default async function StationaerNeuPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <StationaerForm userEmail={user.email ?? ''} userId={user.id} projectId={null} initialData={null} />
}
