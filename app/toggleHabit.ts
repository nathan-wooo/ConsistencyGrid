'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/app/utils/prisma'

interface ToggleHabitArgs {
  habitId: string
  date: string // ISO yyyy-mm-dd
}

export async function toggleHabit({ habitId, date }: ToggleHabitArgs) {
  const targetDate = new Date(date)
  // normalize to UTC midnight to match how you store dates
  targetDate.setUTCHours(0, 0, 0, 0)

  const existing = await prisma.habitLog.findFirst({
    where: {
      habitId,
      date: targetDate,
    },
  })

  if (existing) {
    await prisma.habitLog.delete({
      where: { id: existing.id },
    })
  } else {
    await prisma.habitLog.create({
      data: {
        habitId,
        date: targetDate,
        value: 1,
      },
    })
  }

  revalidatePath('/', 'page')
}


