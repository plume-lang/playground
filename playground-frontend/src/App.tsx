export default function App() {
  return <main className="grid place-items-center h-full">
    <header className="text-center">
      <img src="/logo-bg.svg" className="w-24 rounded-3xl mx-auto mb-8" alt="" />
      <h1 className="text-3xl text-white font-bold mb-4">
        Welcome to the Plume Playground
      </h1>
      <p className="max-w-md mx-auto text-white/60 mb-8">
        Learn and discover the Plume programming language. Explore its features and capabilities. Share your code with others and learn from the community.
      </p>

      <ul className="flex justify-center gap-x-4">
        <button className="bg-hot-pink/20 text-hot-pink-200 py-2 px-6 rounded-lg font-medium tracking-wide">
          Start coding
        </button>
        <button className="bg-hot-pink/20 text-hot-pink-200 py-2 px-6 rounded-lg font-medium tracking-wide">
          Open local file
        </button>
      </ul>
    </header>
  </main>
}