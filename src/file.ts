import { Terminal } from "@xterm/xterm";
import { Dispatch, SetStateAction } from "react";
import { z } from "zod";

export interface PlumeFile {
  name: string;
  size: number;
  id: string;
  content: string;
}

export function prettySize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export const dataValidation = z.object({
  name: z.string(),
  size: z.number().min(0).max(1024 * 1024),
  id: z.string().uuid(),
  content: z.string(),
});

export type State<T> = Dispatch<SetStateAction<T>>;

export async function saveFile(file: PlumeFile, newContent: string, setLocalContent: State<PlumeFile[]>) {
  const fileLength = newContent.length;
  
  if (fileLength === file.size || newContent == file.content) return;

  try {
    const res = await fetch('/api/save-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...file,
        content: newContent,
        size: fileLength,
      }),
    });

    if (!res.ok) {
      console.error('Failed to save file');
    } else {
      setLocalContent(files => {
        const newFiles = [...files];

        const newFile = newFiles.splice(newFiles.findIndex(f => f.id === file.id), 1)[0];

        newFile.content = newContent;
        newFile.size = fileLength;
        newFiles.unshift(newFile);

        return newFiles;
      });
    }
  } catch (error) {
    console.error(error);
  }
}

export const validateResponse = z.union([
  z.object({ stdout: z.string() }),
  z.object({ error: z.string().min(15) })
]);


export async function runFile(file: PlumeFile, content: string, term: Terminal | null) {
  if (!term) return;
  try {
    const res = await fetch('/api/run-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...file,
        content,
      }),
    });
  
    const jsonRes = await res.json();

    const data = validateResponse.parse(jsonRes);
  
    if ('error' in data)
      return term.writeln(data.error);
  
    term.writeln(data.stdout);
  } catch (error) {
    console.error(error);
  }
}