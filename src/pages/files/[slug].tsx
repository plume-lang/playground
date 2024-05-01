'use client';

import { useParams } from "next/navigation";
import { useCallback, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import Image from "next/image";
import { useWindowSize } from "@uidotdev/usehooks";
import { setupLanguage, setupTheme } from "@/plume-language";
import { FilePlusIcon, PlayIcon, RocketIcon, Share1Icon, Share2Icon } from "@radix-ui/react-icons";

const defaultPlumeCode = `// Welcome to the Plume Playground!
println("Hello, world!")`;

export default function CodeEditor() {
  const params = useParams() ?? { slug: '' };
  if (!params || !('slug' in params))
    return <h1>Not found</h1>;

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const size = useWindowSize();
  
  const onMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    setupTheme(monaco);
    setupLanguage(monaco);

    monaco.editor.setTheme('plume-dark');
  }, []);

  return <>
    <nav className="bg-zinc-900 h-16 border-b grid grid-cols-5 border-b-zinc-600">
      <Image src="/logo.svg" alt="Plume logo" width={64} height={64} />
      <span className="font-mono flex-auto text-white text-center col-span-3 self-center">
        your-file-name.plm
      </span>
      <ul className="justify-self-end flex items-center gap-x-4">
        <button>
          <FilePlusIcon className="text-white w-6 h-6" />
        </button>
        <button>
          <Share1Icon className="text-white w-6 h-6" />
        </button>
        <button className="pr-4">
          <PlayIcon className="text-white w-6 h-6" />
        </button>
      </ul>
    </nav>
    <Editor
      height={size.height ? size.height - 64 : '100vh'}
      defaultValue={defaultPlumeCode}
      language="plume"
      theme="plume-dark"
      options={{
        fontSize: 18,
        tabSize: 2,
        fontFamily: 'var(--font-mono)',
        fontLigatures: true,
      }}
      onMount={onMount}
    />
  </>;
}