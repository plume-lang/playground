interface ErrorProps {
  error: string;
  description: string;
  goBack?: () => void;
}

export function Error({ error, description, goBack = () => window.history.back() }: ErrorProps) {
  return <main className="grid place-items-center h-full">
    <header className="text-center">
      <img src="/logo-bg.svg" className="w-24 rounded-3xl mx-auto mb-8" alt="" />
      <h1 className="text-3xl text-white font-bold mb-4">
        {error}
      </h1>
      <p className="max-w-md mx-auto text-white/60 mb-8">
        {description}
      </p>

      <button className="bg-hot-pink/20 text-hot-pink-200 py-2 px-6 rounded-lg font-medium tracking-wide" onClick={goBack}>
        Go back to previous page
      </button>
    </header>
  </main>
}