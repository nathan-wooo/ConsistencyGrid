'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/server'
import { prisma } from '@/app/utils/prisma'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Supabase login error:', error.message)
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Supabase signup error:', error.message)
    redirect('/error')
  }

  if (data.user && data.user.email) {
    try {
      await prisma.user.create({
        data: {
          id: data.user.id,
          email: data.user.email,
        },
      })
    } catch (e) {
      console.log('User sync note:', e)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}