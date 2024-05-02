'use client'

import { List, RecentFile } from "@/components/list-files";
import { PlumeFile, State, dataValidation } from "@/file";
import Image from "next/image";
import { useIsClient, useLocalStorage } from "@uidotdev/usehooks";
import { uniqueNamesGenerator, starWars, adjectives } from "unique-names-generator";
import { NextRouter, useRouter } from "next/router";

export default function Home() {
  const isClient = useIsClient();

  if (!isClient) return null;

  return <HomePage />;
}

async function createFile(setFiles: State<PlumeFile[]>, router: NextRouter) {
  const generated = uniqueNamesGenerator({
    dictionaries: [adjectives, starWars],
    length: 2,
    style: 'lowerCase',
    separator: ' ',
  });
  const fileName = generated.split(' ').join('-');

  const res = await fetch('/api/create-file', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: `${fileName}.plm` }),
  });
  
  if (!res.ok) throw new Error('Failed to create file');

  const data = dataValidation.parse(await res.json());

  setFiles(files => [data, ...files]);

  router.push("/files/[slug]", `/files/${data.id}`);
}

function HomePage() {
  const [files, setFiles] = useLocalStorage<PlumeFile[]>('files', []);
  const router = useRouter();

  return <>
    <header className="p-8 text-center max-w-5xl mx-auto mt-32">
      <Image
        priority
        src="/logo-bg.svg"
        alt="Plume logo"
        className="rounded-3xl mx-auto"
        width={128}
        height={128}
      />
      <h1 className="text-4xl font-black mt-8 text-white">
        The Plume Playground
      </h1>
      <p className="mt-4 text-lg font-mono max-w-xl mx-auto text-white/70">
        Test Plume&lsquo;s latest features directly in your browser, with no need to install anything!
      </p>
    </header>

    <main className="max-w-3xl mx-auto mt-8">
      <nav className="flex flex-row items-center">
        <span className="flex-initial text-white/50">
          Recently edited files
        </span>
        
        <ul className="flex flex-auto items-center justify-end">
          <button className="bg-hot-pink-400 py-2 px-6 text-lg rounded-lg font-medium text-white focus:outline-none" onClick={() => createFile(setFiles, router)}>
            Start coding
          </button>
        </ul>
      </nav>

      {files.length > 0
        ? <>
            <List>
              {files.map(file => <RecentFile key={file.id} {...file} />)}
            </List>
            <span className="mt-4 inline-block mb-16 text-zinc-200/50 italic cursor-pointer hover:underline" onClick={() => setFiles([])}>
              Clear file cache
            </span>
          </>
        : <p className="text-white/70 mt-16 text-lg text-center">
            No files have been edited yet.
          </p>
      }
    </main>
  </>;
}