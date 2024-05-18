import { PlumeFile, State } from "#root/library/file";
import { defaultPlumeCode } from "#root/library/plume";
import { useLocalStorage } from "@uidotdev/usehooks";
import { ChangeEventHandler, useCallback, useRef } from "react";
import { Link, NavigateFunction, useNavigate } from "react-router-dom";
import { uniqueNamesGenerator, animals, colors } from "unique-names-generator";

function createFile(setFiles: State<PlumeFile[]>, redirect: NavigateFunction) {
  const uuid = crypto.randomUUID();
  const fileName = uniqueNamesGenerator({ dictionaries: [colors, animals], separator: ' ' }).replace(/\s+/g, '-');

  const newFile: PlumeFile = {
    fileName: `${fileName}.plm`,
    id: uuid,
    code: defaultPlumeCode,
    lastModified: Date.now(),
    isLocal: true,
  };
  
  setFiles(files => [...files, newFile]);

  redirect(`/editor/local/${uuid}`);
}

function formatDate(timestamp: number) {
  const date = new Date(timestamp);

  return `${date.toLocaleDateString()} - ${date.getHours()}:${date.getMinutes()}`;
}

export default function App() {
  const [files, setFiles] = useLocalStorage<PlumeFile[]>('files', []);
  const navigate = useNavigate();
  const inputFile = useRef<HTMLInputElement>(null);

  const handleFileUpload: ChangeEventHandler<HTMLInputElement> = useCallback(async (event) => {
    event.stopPropagation();
    event.preventDefault();

    if (!event.target.files) return;
    const file = event.target.files[0];

    const content = await file.text();
    const uuid = crypto.randomUUID();
    const fileName = file.name;

    const newFile: PlumeFile = {
      fileName,
      id: uuid,
      code: content,
      lastModified: Date.now(),
      isLocal: true,
    };

    setFiles(files => [...files, newFile]);

    navigate(`/editor/local/${uuid}`);
  }, []);

  return <main className="grid place-items-center h-full px-8">
    <input type='file' id='file' onChange={handleFileUpload} ref={inputFile} className="hidden" />
    <header className="text-center">
      <img src="/logo-bg.svg" className="w-24 rounded-3xl mx-auto mb-8" alt="" />
      <h1 className="text-3xl text-white font-bold mb-4">
        Welcome to the Plume Playground
      </h1>
      <p className="max-w-md mx-auto text-white/60 mb-8">
        Learn and discover the Plume programming language. Explore its features and capabilities. Share your code with others and learn from the community.
      </p>

      <ul className="flex justify-center max-md:flex-col gap-4 max-w-md mx-auto">
        <button
          className="bg-hot-pink/20 text-hot-pink-200 py-2 px-6 rounded-lg font-medium tracking-wide w-1/2 max-md:w-full" 
          onClick={() => createFile(setFiles, navigate)}>
          Start coding
        </button>
        <button 
          className="bg-hot-pink/20 text-hot-pink-200 py-2 px-6 rounded-lg font-medium tracking-wide w-1/2 max-md:w-full" 
          onClick={() => inputFile.current?.click()}>
          Open local file
        </button>
      </ul>

      <ul className="max-w-xl mx-auto flex flex-col gap-y-2 mt-8">
        {files.sort((a, b) => b.lastModified - a.lastModified).map(file => 
          <Link to={file.isLocal ? `/editor/local/${file.id}` : `/editor/${file.id}`} key={file.id} className=" border-white/10 items-center rounded-lg grid max-md:grid-cols-2 md:grid-cols-4 gap-3">
            <span className="font-mono text-white/90 max-md:text-sm md:text-lg text-left md:col-span-2">
              {file.fileName}
            </span>
            <span className="bg-mustard/20 justify-self-end text-mustard-200 font-medium px-3 rounded-full w-min max-md:hidden">
              {file.isLocal && 'Local'}
            </span>
            <span className="flex-auto justify-end text-right text-sm text-white/60">
              {formatDate(file.lastModified)}
            </span>
          </Link>
        )}
      </ul>
    </header>
  </main>
}