import { Monaco } from "@monaco-editor/react";
import { tw } from "#library/tailwind";

export function setupTheme(monaco: Monaco) {
  monaco.editor.defineTheme('plume-dark', {
    base: "vs-dark",
    colors: {
      "editor.background": tw.colors.zinc[900],
      "editor.foreground": tw.colors.zinc[200],
      "editor.lineHighlightBackground": tw.colors.zinc[800],
    },
    inherit: true,
    rules: [
      {
        token: 'function',
        foreground: '#FFE682',
      },
      {
        token: 'keyword',
        foreground: '#FF66C4',
      },
      {
        token: 'string',
        foreground: tw.colors.green[400],
      },
      {
        token: 'string.escape',
        foreground: tw.colors.blue[300],
      },
      {
        token: 'comment',
        foreground: tw.colors.zinc[500],
      },
      {
        token: 'interface',
        foreground: tw.colors.zinc[200],
        fontStyle: 'italic',
      },
      {
        token: 'variable',
        foreground: tw.colors.zinc[200],
      }
    ],
  });
}