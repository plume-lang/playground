import { Dispatch, SetStateAction } from "react";
import { z } from "zod";

export type State<T> = Dispatch<SetStateAction<T>>;

export interface PlumeFile {
  name: string;
  size: number;
  id: string;
  content: string;
  lastModified?: number;
}

export function prettySize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export const fileValidator = z.object({
  name: z.string().min(1).endsWith('.plm'),
  size: z.number().min(0).max(1024 * 1024),
  id: z.string().uuid(),
  content: z.string().min(0).max(1024 * 1024),
  lastModified: z.date(),
});
