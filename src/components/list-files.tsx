import { PlumeFile, prettySize } from "@/file";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { PropsWithChildren } from "react";

export function List({ children }: PropsWithChildren) {
  return <ul className="flex flex-col gap-8 gap-y-4 mt-4 mb-16">
    {children}
  </ul>
}

export function RecentFile({ name, size, id }: PlumeFile) {
  if (!name.endsWith('.plm')) throw new Error('Invalid file extension');
  
  return <Link href="/files/[slug]" as={`/files/${id}`} className="border border-neutral-300 p-4 rounded-lg px-6 grid grid-cols-3 items-center">
    <div className="inline-flex items-center gap-2">
      <h3 className="text-lg font-mono text-neutral-800">
        {name}
      </h3>
      <span className="text-neutral-400">-</span>
      <span className="text-sm font-medium text-neutral-800/70">
        {prettySize(size)}
      </span>
    </div>

    <div className="col-span-2 justify-end grid">
      <DotsHorizontalIcon className="text-neutral-800/50 h-5 w-5" />
    </div>
  </Link>;
}