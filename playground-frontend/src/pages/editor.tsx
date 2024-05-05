import { Link, NavigateFunction, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { Error } from "#components/error";
import { RenderEditor } from "#components/monaco-editor";
import { MouseEventHandler, TouchEventHandler, useCallback, useEffect, useRef, useState } from "react";
import { defaultPlumeCode } from "#root/library/plume";
import { RenderTerminal } from "#components/terminal";
import { editor } from "monaco-editor";
import { SaveIcon, ShareIcon } from "lucide-react";
import { PlumeFile, State, execRawCode, fetchFile, saveFile } from "#root/library/file";
import { useLocalStorage } from "@uidotdev/usehooks";

const paramsValidator = z.object({
  id: z.string().uuid(),
});

interface EditorProps {
  isLocal?: boolean;
}

export default function Editor({ isLocal = false }: EditorProps) {
  const params = useParams();
  const [files] = useLocalStorage<PlumeFile[]>('files', []);

  const [plumeFile, setPlumeFile] = useState<PlumeFile | null>(null);
  const [loading, setLoading] = useState(true);

  const parsedParams = paramsValidator.safeParse(params);
  if (!parsedParams.success) {
    return <Error
      error="Invalid URL received"
      description="This generally happens when the URL is malformed or the ID is not a valid UUID. If you believe this is a server error, please let us know."
    />;
  }

  useEffect(() => {
    if (!params.id) return;
    if (!parsedParams.success) return setLoading(false);

    const id = parsedParams.data?.id;

    async function getFile(uuid: string) {
      try {
        const res = await fetchFile(uuid);

        if (res) {
          setPlumeFile(res);
        }
      } catch(e) {}
    }

    if (isLocal) {
      setPlumeFile(files.find(f => f.id === id && f.isLocal) ?? null);
      setLoading(false);
    } else {
      getFile(id)
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    }
  }, [params]);

  if (!loading) {
    if (!plumeFile) {
      return <Error
        error="File not found"
        description="The file you're trying to access could not be found. It may have been deleted or the URL is incorrect."
      />;
    }
  
    return <CodeEditor plumeFile={plumeFile} />;
  }
}

async function uploadFile(file: PlumeFile, navigate: NavigateFunction, setFiles: State<PlumeFile[]>) {
  if (!file.isLocal) return;

  file.isLocal = false;

  await saveFile(file, () => {});
  setFiles(files => {
    const newFiles = [...files];
    const index = newFiles.findIndex(f => f.id === file.id);

    if (index !== -1) {
      newFiles[index].isLocal = false;
    }

    return newFiles;
  });
  navigate(`/editor/${file.id}`);
}

function CodeEditor({ plumeFile }: { plumeFile: PlumeFile }) {
  const resizerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const firstHalfRef = useRef<HTMLDivElement>(null);
  const secondHalfRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [termContent, setTermContent] = useState('');
  const [,setFiles] = useLocalStorage<PlumeFile[]>('files', []);
  const navigate = useNavigate();

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = useCallback((e) => {
    const startPos = {
      x: e.clientX,
      y: e.clientY,
    };
    if (!firstHalfRef.current) return;
    const currentLeftHeight = firstHalfRef.current.getBoundingClientRect().height;

    const handleMouseMove = (e: MouseEvent) => {
      const dy = e.clientY - startPos.y;
      updateHeight(currentLeftHeight, dy);
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
    const currentLeftHeight = firstHalfRef.current.getBoundingClientRect().height;

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const dy = touch.clientY - startPos.y;
      updateHeight(currentLeftHeight, dy);
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

  const updateHeight = (currentLeftHeight: number, dy: number) => {
    const container = containerRef.current;
    const firstHalfEle = firstHalfRef.current;
    const secondHalfEle = secondHalfRef.current;

    if (!container || !firstHalfEle || !secondHalfEle) return;

    const containerHeight = container.getBoundingClientRect().height;
    const delta = currentLeftHeight + dy;

    const newFirstHalfHeight = delta - 96;
    const newSecondHalfHeight = containerHeight - newFirstHalfHeight - 96;

    firstHalfEle.style.height = `${newFirstHalfHeight}px`;
    secondHalfEle.style.height = `${newSecondHalfHeight}px`;
  };

  const updateCursor = () => {
    const container = containerRef.current;
    const firstHalfEle = firstHalfRef.current;
    const resizerEle = resizerRef.current;
    const secondHalfEle = secondHalfRef.current;

    if (!container || !firstHalfEle || !resizerEle || !secondHalfEle) {
      return;
    }

    resizerEle.style.cursor = 'ns-resize';
    document.body.style.cursor = 'ns-resize';
    firstHalfEle.style.userSelect = 'none';
    firstHalfEle.style.pointerEvents = 'none';
    secondHalfEle.style.userSelect = 'none';
    secondHalfEle.style.pointerEvents = 'none';
  };

  const resetCursor = () => {
    const container = containerRef.current;
    const firstHalfEle = firstHalfRef.current;
    const resizerEle = resizerRef.current;
    const secondHalfEle = secondHalfRef.current;

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
  

  useEffect(() => {
    const platform = navigator.userAgent;
    const modKey = platform.includes('Mac') ? 'metaKey' : 'ctrlKey';

    const shortcuts = async (event: KeyboardEvent) => {
      if (event[modKey] && event.key === 's') {
        event.preventDefault();
        const content = editorRef.current?.getValue() ?? '';

        if (plumeFile) {
          // Save the file
          plumeFile.code = content;
          plumeFile.lastModified = Date.now();
          await saveFile(plumeFile, setFiles);
        }

        setTermContent(await execRawCode(content));
      }
    }

    document.addEventListener('keydown', shortcuts);

    return () => {
      document.removeEventListener('keydown', shortcuts);
    };
  }, []);

  return <main className="" ref={containerRef}>
    <nav className="h-16 grid grid-cols-5">
      <Link to="/" className="col-span-1 items-center flex">
        <img src="/logo.svg" className="w-16 h-16 rounded-full ml-2" alt="Plume logo" />
        <h1 className="text-xl font-bold text-white/90 flex items-center">
          Plume Playground
        </h1>
      </Link>

      <div className="col-span-3 justify-self-center self-center">
        <span className="text-white/70 font-mono">
          {plumeFile?.fileName ?? 'untitled.plm'}
        </span>
      </div>

      <ul className="col-span-1 self-center justify-self-end mr-8 flex gap-6">
        <SaveIcon className="w-6 h-6 text-white/70" />
        <ShareIcon onClick={() => uploadFile(plumeFile, navigate, setFiles)} className="w-6 h-6 text-white/70" />
      </ul>
    </nav>

    <RenderEditor
      editorRef={editorRef}
      bindRef={firstHalfRef}
      content={plumeFile?.code ?? defaultPlumeCode} />

    <div className="group h-4 mb-4">
      <span 
        className="h-px block w-full bg-white/10 group-hover:h-2 transition-all duration-150 select-none touch-none cursor-ns-resize"
        ref={resizerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      />
    </div>

    <RenderTerminal content={termContent} terminalRef={secondHalfRef} />
  </main>;
}
