import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/server'
import { prisma } from '@/app/utils/prisma'
import { toggleHabit } from './toggleHabit'
import { LogOut, Plus } from 'lucide-react'

function getLast7Days() {
  const days: Date[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(d)
  }

  return days
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const last7Days = getLast7Days()

  const habits = await prisma.habit.findMany({
    where: {
      userId: user.id,
    },
    include: {
      logs: {
        where: {
          date: {
            gte: last7Days[0],
            lte: last7Days[last7Days.length - 1],
          },
        },
      },
    }
  })

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              ConsistencyGrid
            </h1>
            <p className="text-sm text-zinc-400">
              Welcome back, {user.email ?? 'friend'}.
            </p>
          </div>
          <form action={handleSignOut}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-100 shadow-sm hover:bg-zinc-800"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </header>

        <section className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              This week
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Tap a square to mark a day as complete.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-sm hover:bg-emerald-400"
          >
            <Plus className="h-4 w-4" />
            New Habit
          </button>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="mb-3 flex justify-end gap-1 text-[10px] font-medium text-zinc-500">
            {last7Days.map((day) => (
              <span key={day.toISOString()} className="w-8 text-center">
                {day.toLocaleDateString(undefined, {
                  weekday: 'short',
                }).slice(0, 1)}
              </span>
            ))}
          </div>

          {habits.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              No habits yet. Click <span className="font-semibold">New Habit</span> to get started.
            </p>
          ) : (
            <ul className="space-y-2">
              {habits.map((habit) => (
                <li
                  key={habit.id}
                  className="flex items-center justify-between gap-4 rounded-xl bg-zinc-900/80 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-lg">
                      {habit.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-100">
                        {habit.title}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Goal: {habit.dailyGoal} / day
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {last7Days.map((day) => {
                      const hasLog = habit.logs.some((log) =>
                        isSameDay(new Date(log.date), day),
                      )

                      const colorClass = hasLog
                        ? habit.color || 'bg-emerald-500'
                        : 'bg-zinc-800'

                      const intensityClass =
                        hasLog && habit.dailyGoal > 1
                          ? 'opacity-100'
                          : hasLog
                            ? 'opacity-90'
                            : 'opacity-50'

                      return (
                        <form
                          key={day.toISOString()}
                          action={async () => {
                            'use server'
                            await toggleHabit({
                              habitId: habit.id,
                              date: day.toISOString().slice(0, 10),
                            })
                          }}
                        >
                          <button
                            type="submit"
                            className={`h-7 w-7 rounded-md ${colorClass} ${intensityClass} transition hover:scale-105 hover:opacity-100`}
                            aria-label={`Toggle ${habit.title} for ${day.toDateString()}`}
                          />
                        </form>
                      )
                    })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
