import { List, RecentFile } from "@/components/list-files";
import { PlumeFile } from "@/file";
import { v4 } from "uuid";
import Image from "next/image";

export function createFiles(n: number): PlumeFile[] {
  return Array.from({ length: n }, (_, i) => ({
    id: v4(),
    name: `file-${i}.plm`,
    size: 1096 * (i + 1),
  }));
}

export default function Home() {
  return <>
    <header className="p-8 text-center max-w-5xl mx-auto mt-32">
      <Image
        src="/logo-bg.svg"
        alt="Plume logo"
        className="rounded-3xl mx-auto"
        width={128}
        height={128}
      />
      <h1 className="text-4xl font-black mt-8 text-neutral-800">
        The Plume Playground
      </h1>
      <p className="mt-4 text-lg font-mono max-w-xl mx-auto text-neutral-800/70">
        Test Plume&lsquo;s latest features directly in your browser, with no need to install anything!
      </p>
    </header>

    <main className="max-w-3xl mx-auto mt-8">
      <nav className="flex flex-row items-center">
        <span className="flex-initial text-neutral-800/50">
          Recently edited files
        </span>
        
        <ul className="flex flex-auto items-center justify-end">
          <button className="bg-hot-pink py-2 px-6 text-lg rounded-lg font-medium text-white focus:outline-none">
            Start coding
          </button>
        </ul>
      </nav>

      <List>
        {createFiles(5).map(file => <RecentFile key={file.id} {...file} />)}
      </List>
    </main>
  </>;
}
