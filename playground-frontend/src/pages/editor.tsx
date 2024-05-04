import { useParams } from "react-router-dom";
import { z } from "zod";
import { Error } from "#components/error";
import { RenderEditor } from "#components/monaco-editor";
import { MouseEventHandler, TouchEventHandler, useCallback, useEffect, useRef, useState } from "react";
import { defaultPlumeCode } from "#root/library/plume";
import { RenderTerminal } from "#components/terminal";
import { editor } from "monaco-editor";
import { SaveIcon, ShareIcon } from "lucide-react";

const paramsValidator = z.object({
  id: z.string().uuid(),
});

export default function Editor({ isEmpty = false }: { isEmpty?: boolean }) {
  const params = useParams();
  const editor = useRef(null);
  const bindRef = useRef(null);
  
  if (isEmpty) return <EmptyEditor />;

  const parsedParams = paramsValidator.safeParse(params);

  if (!parsedParams.success) {
    return <Error
      error="Invalid URL received"
      description="This generally happens when the URL is malformed or the ID is not a valid UUID. If you believe this is a server error, please let us know."
    />;
  }

  // const { id } = parsedParams.data;

  return <RenderEditor
    editorRef={editor}
    bindRef={bindRef}
    content={defaultPlumeCode} />;
}

function EmptyEditor() {
  const resizerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const firstHalfRef = useRef<HTMLDivElement>(null);
  const secondHalfRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [termContent, setTermContent] = useState('');

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

    console.log(window.innerHeight, newFirstHalfHeight, newSecondHalfHeight)
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
    const modKey = navigator.platform.includes('Mac') ? 'metaKey' : 'ctrlKey';

    const shortcuts = async (event: KeyboardEvent) => {
      if (event[modKey] && event.key === 's') {
        event.preventDefault();
        const content = editorRef.current?.getValue() ?? '';
        
        const response = await fetch(`http://localhost:6989/api/compile`, {
          method: 'POST',
          body: JSON.stringify({
            code: content,
            fileName: 'main.plm',
          })
        });

        const json = await response.json();

        setTermContent(json.output);
      }
    }

    document.addEventListener('keydown', shortcuts);

    return () => {
      document.removeEventListener('keydown', shortcuts);
    };
  }, []);

  return <main className="" ref={containerRef}>
    <nav className="h-16 grid grid-cols-5">
      <div className="col-span-1 items-center flex">
        <img src="/logo.svg" className="w-16 h-16 rounded-full ml-2" alt="Plume logo" />
        <h1 className="text-xl font-bold text-white/90 flex items-center">
          Plume Playground
        </h1>
      </div>

      <div className="col-span-3 justify-self-center self-center">
        <span className="text-white/70 font-mono">
          your-file.plm
        </span>
      </div>

      <ul className="col-span-1 self-center justify-self-end mr-8 flex gap-6">
        <SaveIcon className="w-6 h-6 text-white/70" />
        <ShareIcon className="w-6 h-6 text-white/70" />
      </ul>
    </nav>

    <RenderEditor
      editorRef={editorRef}
      bindRef={firstHalfRef}
      content={defaultPlumeCode} />

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
