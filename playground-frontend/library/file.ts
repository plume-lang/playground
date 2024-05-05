import { Dispatch, SetStateAction } from "react";
import { z } from "zod";

export type State<T> = Dispatch<SetStateAction<T>>;

export interface PlumeFile {
  fileName: string;
  id: string;
  code: string;
  lastModified: number;
  isLocal?: boolean;
}

export function prettySize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export const fileValidator = z.object({
  name: z.string().min(1).endsWith('.plm'),
  id: z.string().uuid(),
  code: z.string().min(0).max(1024 * 1024),
  lastModified: z.date(),
});

const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function execRawCode(code: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/compile`, {
    method: 'POST',
    body: JSON.stringify({ code }),
  });

  const data = await res.json();

  return data.output;
}

export async function saveFile(file: PlumeFile, setFiles: State<PlumeFile[]>): Promise<string> {
  if (!file.isLocal) {
    const newPlumeFile = {
      id: file.id,
      fileName: file.fileName,
      code: file.code,
      lastModified: file.lastModified,
    };

    const res = await fetch(`${API_URL}/api/save-file`, {
      method: 'POST',
      body: JSON.stringify(newPlumeFile),
    });
  
    const data = await res.json();
  
    return data.id;
  } else {
    setFiles(files => {
      const newFiles = [...files];
      const index = newFiles.findIndex(f => f.id === file.id);
  
      if (index === -1) {
        newFiles.push(file);
      } else {
        newFiles[index] = file;
      }
  
      return newFiles;
    });
  
    return file.id;
  }
}

export async function execFile(file: PlumeFile): Promise<string> {
  const res = await fetch(`${API_URL}/api/compile`, {
    method: 'POST',
    body: JSON.stringify(file),
  });

  const data = await res.json();

  return data.output;
}

export async function fetchFile(id: string): Promise<PlumeFile | null> {
  const res = await fetch(`${API_URL}/api/file/${id}`);
  const data = await res.json();

  return data.error ? null : data;
}