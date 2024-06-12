import { tw } from "#root/library/tailwind";
import { useWindowSize } from "@uidotdev/usehooks";
import Convert from "ansi-to-html";
import { MutableRefObject } from "react";

interface RenderTerminalProps {
  terminalRef: MutableRefObject<HTMLDivElement | null>;
  content: string;
}

function setupANSI() {
  const convert = new Convert({
    colors: [
      tw.colors.zinc["950"],
      tw.colors.red["600"],
      tw.colors.green["500"],
      tw.colors.yellow["600"],
      tw.colors.blue["600"],
      tw.colors.fuchsia["600"],
      tw.colors.cyan["600"],
      tw.colors.zinc["300"],
      tw.colors.zinc["700"],
      tw.colors.red["400"],
      tw.colors.green["400"],
      tw.colors.yellow["400"],
      tw.colors.blue["400"],
      tw.colors.pink["400"],
      tw.colors.cyan["400"],
      tw.colors.white,
    ],
    escapeXML: true
  });

  return convert;
}

export function RenderTerminal({ content, terminalRef }: RenderTerminalProps) {
  const convert = setupANSI();
  const converted = convert.toHtml(content);
  const size = useWindowSize();

  return <div
    className="w-full h-full bg-zinc-900 text-zinc-200 font-mono whitespace-break-spaces px-8 overflow-y-auto"
    ref={terminalRef} 
    style={{
      height: size.height ? size.height / 3 : '100%'
      
    }}
    dangerouslySetInnerHTML={{ __html: converted }} />;
}