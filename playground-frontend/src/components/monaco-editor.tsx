import { MutableRefObject, useCallback } from "react";
import { editor } from "monaco-editor";
import { useWindowSize } from "@uidotdev/usehooks";
import { setupTheme } from "#root/library/theme";
import { setupLanguage } from "#root/library/plume";
import Editor, { OnMount } from "@monaco-editor/react";

interface RenderEditorProps {
  editorRef: MutableRefObject<editor.IStandaloneCodeEditor | null>;
  content: string;
  bindRef: MutableRefObject<HTMLDivElement | null>;
}

export function RenderEditor({ editorRef, content, bindRef }: RenderEditorProps) {
  const size = useWindowSize();

  const onMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    setupTheme(monaco);
    setupLanguage(monaco);

    monaco.editor.setTheme('plume-dark');
  }, [editorRef]);

  return <Editor
    height={size.height ? 2 * size.height / 3 - 96 : '100%'}
    width="100%"
    defaultValue={content}
    language="plume"
    loading={null}
    theme="plume-dark"
    className="border-t border-white/10"
    wrapperProps={{ ref: bindRef }}
    options={{
      fontSize: 18,
      tabSize: 2,
      padding: { top: 16, bottom: 16 },
      fontFamily: 'Fira code',
      fontLigatures: true,
      automaticLayout: true,
    }}
    onMount={onMount}
  />
}