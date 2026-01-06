export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="max-w-md rounded-2xl border border-red-900/60 bg-zinc-900/80 p-6 text-zinc-50 shadow-xl">
        <h1 className="text-lg font-semibold text-red-400">
          There was a problem signing you in
        </h1>
        <p className="mt-2 text-sm text-zinc-300">
          Your login or sign up request failed. This usually means:
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-300">
          <li>Wrong email or password</li>
          <li>The account hasn&apos;t been created yet (try Sign up first)</li>
          <li>
            Or Supabase credentials / redirect URLs are misconfigured in your
            project settings
          </li>
        </ul>
        <a
          href="/login"
          className="mt-5 inline-flex w-full justify-center rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
        >
          Back to login
        </a>
      </div>
    </main>
  )
}


