'use client';

import { useParams } from "next/navigation";
import { MutableRefObject, useCallback, useEffect, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import Image from "next/image";
import { useIsClient, useLocalStorage, useWindowSize } from "@uidotdev/usehooks";
import { setupLanguage, setupTheme } from "@/plume-language";
import { FilePlusIcon, PlayIcon, Share1Icon } from "@radix-ui/react-icons";
import Link from "next/link";
import { z } from "zod";
import { GetServerSideProps } from "next";
import { PlumeFile, dataValidation, runFile, saveFile, saveLocalStorage } from "@/file";
import { readFileSync } from "fs";
import { useURL } from "@/hooks/use-url";
import dynamic from "next/dynamic";
import { FitAddon } from "@xterm/addon-fit";
import { CanvasAddon } from "@xterm/addon-canvas";
import type { Terminal } from "@xterm/xterm";
import { tw } from "@/tailwind";

export default function CodeEditor({ plumeFile }: { plumeFile: PlumeFile }) {
  const isClient = useIsClient();

  if (!isClient) return null;

  // Check if window, document and self are defined
  if (typeof window === 'undefined' || typeof document === 'undefined' || typeof self === 'undefined')
    return null;

  return <EditorComponent plumeFile={plumeFile} />;
}

function EditorComponent({ plumeFile }: { plumeFile: PlumeFile }) {
  const termRef = useRef<Terminal | null>(null);
  const [,setLocalContent] = useLocalStorage<PlumeFile[]>('files', []);

  const url = useURL();
  const params = useParams() ?? { slug: '' };

  if (!params || !('slug' in params))
    return <h1>Not found</h1>;

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  saveLocalStorage(plumeFile, setLocalContent);

  useEffect(() => {
    const unloadCallback = async (event: BeforeUnloadEvent) => {
      event.preventDefault();

      const content = editorRef.current?.getValue() ?? '';
      await saveFile(plumeFile, content, setLocalContent);

      return "New file content will be automatically saved on page close or refresh";
    };
  
    window.addEventListener("beforeunload", unloadCallback);
    return () => window.removeEventListener("beforeunload", unloadCallback);
  }, []);

  return <>
    <nav className="bg-zinc-900 h-16 border-b grid grid-cols-5 border-b-zinc-600">
      <Link href="/" className="w-16 inline-block">
        <Image src="/logo.svg" alt="Plume logo" width={64} height={64} />
      </Link>
      <span className="font-mono flex-auto text-white text-center col-span-3 self-center">
        {plumeFile.name}
      </span>
      <ul className="justify-self-end flex items-center gap-x-4">
        <button onClick={() => saveFile(plumeFile, editorRef.current?.getValue() ?? '', setLocalContent)}>
          <FilePlusIcon className="text-white w-6 h-6" />
        </button>
        <button onClick={() => navigator.clipboard.writeText(url)}>
          <Share1Icon className="text-white w-6 h-6" />
        </button>
        <button className="pr-4" onClick={() => runFile(plumeFile, editorRef.current?.getValue() ?? '', termRef?.current)}>
          <PlayIcon className="text-white w-6 h-6" />
        </button>
      </ul>
    </nav>
    <div className="flex">
      <RenderEditor editorRef={editorRef} plumeFile={plumeFile} />
      <RenderTerminal termRef={termRef} />
    </div>
  </>;
}

function RenderEditor({ editorRef, plumeFile }: { editorRef: MutableRefObject<editor.IStandaloneCodeEditor | null>, plumeFile: PlumeFile }) {
  const size = useWindowSize();
    
  const onMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    setupTheme(monaco);
    setupLanguage(monaco);

    monaco.editor.setTheme('plume-dark');
  }, []);

  return <Editor
    height={size.height ? size.height - 64 : '100vh'}
    width={size.width ? 2 * size.width / 3 : '100vw'}
    defaultValue={plumeFile.content}
    language="plume"
    loading={null}
    theme="plume-dark"
    options={{
      fontSize: 18,
      tabSize: 2,
      fontFamily: 'var(--font-mono)',
      fontLigatures: true,
    }}
    onMount={onMount}
  />
}

function RenderTerminal({ termRef }: { termRef: MutableRefObject<Terminal | null> }) {
  const TerminalComponent = dynamic(() => import('@/components/terminal'), { ssr: false });

  const fitAddon = new FitAddon();
  const canvasAddon = new CanvasAddon();

  return <TerminalComponent 
    options={{
      convertEol: true,
      cursorBlink: false,
      disableStdin: true,
      fontSize: 18,

      theme: {
        background: tw.colors.zinc[900],
        foreground: tw.colors.zinc[200],
      },
    }} 
    bindRef={termRef}
    addons={[fitAddon, canvasAddon]}
    onMount={() => fitAddon.fit()}
    className="p-4 h-full flex-initial w-1/3"
  />
}

export const getServerSideProps = (async (context) => {
  const validateSlug = z.string().uuid();

  if (!context.params) return { notFound: true };
  if (!('slug' in context.params)) return { notFound: true };

  const slug = validateSlug.parse(context.params.slug);

  const content = readFileSync(`./server/files/${slug}.json`, 'utf-8');
  const plumeFile = JSON.parse(content);

  return { props: { plumeFile: dataValidation.parse(plumeFile) } };

}) satisfies GetServerSideProps<{ plumeFile: PlumeFile }>