import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import StationaerForm from '@/components/StationaerForm'

export default async function StationaerEditPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!project) redirect('/dashboard')

  return (
    <StationaerForm
      userEmail={user.email ?? ''}
      userId={user.id}
      projectId={id}
      initialData={project.form_data as Record<string, string>}
    />
  )
}
