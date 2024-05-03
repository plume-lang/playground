'use client';

import { useParams } from "next/navigation";
import { MouseEventHandler, MutableRefObject, TouchEventHandler, useCallback, useEffect, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import Image from "next/image";
import { useIsClient, useLocalStorage, useWindowSize } from "@uidotdev/usehooks";
import { setupLanguage, setupTheme } from "@/plume-language";
import { DownloadIcon, PlayIcon, Share1Icon } from "@radix-ui/react-icons";
import Link from "next/link";
import { z } from "zod";
import { GetServerSideProps, Metadata, ResolvingMetadata } from "next";
import { PlumeFile, dataValidation, runFile, saveFile, saveLocalStorage } from "@/file";
import { existsSync, readFileSync } from "fs";
import { useURL } from "@/hooks/use-url";
import dynamic from "next/dynamic";
import { FitAddon } from "@xterm/addon-fit";
import { CanvasAddon } from "@xterm/addon-canvas";
import type { Terminal } from "@xterm/xterm";
import { tw } from "@/tailwind";
import path from "path";
import Head from "next/head";

export async function generateMetadata(
  { plumeFile }: { plumeFile: PlumeFile }
): Promise<Metadata> {

  return {
    title: `Plume - ${plumeFile.name}`,
    description: 'Write, compile and run Plume code online with just one click.',
  };
}

export default function CodeEditor({ plumeFile }: { plumeFile: PlumeFile }) {
  const isClient = useIsClient();

  if (!isClient) return null;

  // Check if window, document and self are defined
  if (typeof window === 'undefined' || typeof document === 'undefined' || typeof self === 'undefined')
    return null;

  return <>
    <Head>
      <title>Plume - {plumeFile.name}</title>
      <meta name="description" content="An online playground for the Plume programming language" />
    </Head>
    <EditorComponent plumeFile={plumeFile} />
  </>;
}

function EditorComponent({ plumeFile }: { plumeFile: PlumeFile }) {
  const termRef = useRef<{ term: Terminal, div: HTMLDivElement } | null>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const firstHalfRef = useRef<HTMLDivElement>(null);

  const fitAddon = new FitAddon();
  
  const [, setLocalContent] = useLocalStorage<PlumeFile[]>('files', []);

  const url = useURL();
  const params = useParams() ?? { slug: '' };
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    const unloadCallback = async (event: BeforeUnloadEvent) => {
      event.preventDefault();

      const content = editorRef.current?.getValue() ?? '';
      await saveFile(plumeFile, content, setLocalContent);

      return "New file content will be automatically saved on page close or refresh";
    };

    const modKey = navigator.platform.includes('Mac') ? 'metaKey' : 'ctrlKey';

    const shortcuts = async (event: KeyboardEvent) => {
      if (event[modKey] && event.key === 's') {
        event.preventDefault();
        const content = editorRef.current?.getValue() ?? '';
        await saveFile(plumeFile, content, setLocalContent);
      }
    }

    window.addEventListener("beforeunload", unloadCallback);
    window.addEventListener("keydown", shortcuts);
    return () => {
      window.removeEventListener("beforeunload", unloadCallback);
      window.removeEventListener("keydown", shortcuts);
    }
  }, [plumeFile, setLocalContent]);

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = useCallback((e) => {
    const startPos = {
      x: e.clientX,
      y: e.clientY,
    };
    if (!firstHalfRef.current) return;
    const currentLeftWidth = firstHalfRef.current.getBoundingClientRect().width;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startPos.x;
      updateWidth(currentLeftWidth, dx);
      updateCursor();
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      resetCursor();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const handleTouchStart: TouchEventHandler<HTMLDivElement> = useCallback((e) => {
    const touch = e.touches[0];
    const startPos = {
      x: touch.clientX,
      y: touch.clientY,
    };
    if (!firstHalfRef.current) return;
    const currentLeftWidth = firstHalfRef.current.getBoundingClientRect().width;

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const dx = touch.clientX - startPos.x;
      updateWidth(currentLeftWidth, dx);
      updateCursor();
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);

      resetCursor();
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  }, []);

  if (!params || !('slug' in params))
    return <h1>Not found</h1>;

  saveLocalStorage(plumeFile, setLocalContent);

  const updateWidth = (currentLeftWidth: number, dx: number) => {
    const container = containerRef.current;
    const firstHalfEle = firstHalfRef.current;

    if (!container || !firstHalfEle) {
      return;
    }

    const containerWidth = container.getBoundingClientRect().width;
    const delta = currentLeftWidth + dx;
    const newFirstHalfWidth = delta * 100 / containerWidth;
    if (!termRef.current) return;

    const term: any = termRef.current.term;
    const cellWidth = term._core._renderService.dimensions.css.cell.width;

    const computeCols = (containerWidth: number): number => {
      return Math.max(2, Math.floor(containerWidth / cellWidth));
    }

    const elementStyle = window.getComputedStyle(termRef.current.div);
    const elementPadding = {
      right: parseInt(elementStyle.getPropertyValue('padding-right')),
      left: parseInt(elementStyle.getPropertyValue('padding-left'))
    };
    const elementPaddingHor = elementPadding.right + elementPadding.left;

    const parent = termRef.current.div.parentElement;
    if (!parent) return;

    const termWidth = window.innerWidth - delta - 12 - elementPaddingHor;

    const newCols = computeCols(termWidth - elementPaddingHor ?? 0);
    const rows = termRef.current.term.rows;

    if (newCols < 40) return;

    firstHalfEle.style.width = `${newFirstHalfWidth}%`;
    termRef.current.term.resize(newCols, rows);
  };

  const updateCursor = () => {
    const container = containerRef.current;
    const firstHalfEle = firstHalfRef.current;
    const resizerEle = resizerRef.current;
    const secondHalfEle = termRef.current?.div;

    if (!container || !firstHalfEle || !resizerEle || !secondHalfEle) {
      return;
    }

    resizerEle.style.cursor = 'ew-resize';
    document.body.style.cursor = 'ew-resize';
    firstHalfEle.style.userSelect = 'none';
    firstHalfEle.style.pointerEvents = 'none';
    secondHalfEle.style.userSelect = 'none';
    secondHalfEle.style.pointerEvents = 'none';
  };

  const resetCursor = () => {
    const container = containerRef.current;
    const firstHalfEle = firstHalfRef.current;
    const resizerEle = resizerRef.current;
    const secondHalfEle = termRef.current?.div;

    if (!container || !firstHalfEle || !resizerEle || !secondHalfEle) {
      return;
    }

    resizerEle.style.removeProperty('cursor');
    document.body.style.removeProperty('cursor');
    firstHalfEle.style.removeProperty('user-select');
    firstHalfEle.style.removeProperty('pointer-events');
    secondHalfEle.style.removeProperty('user-select');
    secondHalfEle.style.removeProperty('pointer-events');
  };

  return <>
    <nav className="bg-zinc-900 h-16 border-b grid grid-cols-5 border-b-zinc-600">
      <Link href="/" className="w-16 inline-block">
        <Image priority src="/logo.svg" alt="Plume logo" width={64} height={64} />
      </Link>
      <span className="font-mono flex-auto text-white text-center col-span-3 self-center">
        {plumeFile.name}
      </span>
      <ul className="justify-self-end flex items-center gap-x-4">
        <button onClick={() => {
          const content = editorRef.current?.getValue() ?? '';
          const lines = content.split(/\r?\n/g);

          const blob = new Blob(lines, { type: 'text/plain' });

          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = plumeFile.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          URL.revokeObjectURL(a.href);
        }}>
          <DownloadIcon className="text-white w-6 h-6" />
        </button>
        <button onClick={() => navigator.clipboard.writeText(url)}>
          <Share1Icon className="text-white w-6 h-6" />
        </button>
        <button className="pr-4" onClick={() => runFile(plumeFile, editorRef.current?.getValue() ?? '', termRef?.current?.term ?? null)}>
          <PlayIcon className="text-white w-6 h-6" />
        </button>
      </ul>
    </nav>
    <div
      className="flex"
      ref={containerRef}>
      <RenderEditor bindRef={firstHalfRef} editorRef={editorRef} plumeFile={plumeFile} />

      <span 
        className="h-screen w-3 block bg-zinc-900 hover:bg-zinc-800 select-none touch-none cursor-ew-resize"
        ref={resizerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      ></span>

      <RenderTerminal fitAddon={fitAddon} termRef={termRef} />
    </div>
  </>;
}

function RenderEditor({ editorRef, plumeFile, bindRef }: { 
  editorRef: MutableRefObject<editor.IStandaloneCodeEditor | null>,
  plumeFile: PlumeFile,
  bindRef: MutableRefObject<HTMLDivElement | null> }) {
  const size = useWindowSize();

  const onMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    setupTheme(monaco);
    setupLanguage(monaco);

    monaco.editor.setTheme('plume-dark');
  }, [editorRef]);

  return <Editor
    height={size.height ? size.height - 64 : '100vh'}
    width={size.width ? (2 * size.width / 3) - 12 : '100vw'}
    defaultValue={plumeFile.content}
    language="plume"
    loading={null}
    theme="plume-dark"
    wrapperProps={{ ref: bindRef }}
    options={{
      fontSize: 18,
      tabSize: 2,
      fontFamily: 'var(--font-mono)',
      fontLigatures: true,
      automaticLayout: true,
    }}
    onMount={onMount}
  />
}

function RenderTerminal({ termRef, fitAddon }: { termRef: MutableRefObject<{ term: Terminal, div: HTMLDivElement } | null>, fitAddon: FitAddon }) {
  const TerminalComponent = dynamic(() => import('@/components/terminal'), { ssr: false });

  const canvasAddon = new CanvasAddon();
  const addons = [fitAddon, canvasAddon];
  
  return <div className="flex-initial w-[calc(33.3%-12px)]">
    <TerminalComponent
      options={{
        convertEol: true,
        cursorBlink: false,
        disableStdin: true,
        fontSize: 18,

        theme: {
          background: tw.colors.zinc[900],
          foreground: tw.colors.zinc[200],
        },
        windowOptions: {
          maximizeWin: true,
        }
      }}
      bindRef={termRef}
      addons={addons}
      onMount={() => fitAddon.fit()}
      className="p-4 h-full"
    />
  </div>
}

export const getServerSideProps = (async (context) => {
  const validateSlug = z.string().uuid();
  const serverPath = process.env.SERVER_PATH || 'server';

  if (!context.params) return { notFound: true };
  if (!('slug' in context.params)) return { notFound: true };

  const slug = validateSlug.parse(context.params.slug);

  const filePath = path.resolve(serverPath, `files/${slug}.json`);

  if (!existsSync(filePath)) return { notFound: true };

  const content = readFileSync(filePath, 'utf-8');
  const plumeFile = JSON.parse(content);

  return { props: { plumeFile: dataValidation.parse(plumeFile) } };

}) satisfies GetServerSideProps<{ plumeFile: PlumeFile }>
