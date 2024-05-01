import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Fira_Code, Noto_Sans } from "next/font/google";

const mono = Fira_Code({ 
  subsets: ["latin"], 
  variable: '--font-mono',
});

const sans = Noto_Sans({ 
  subsets: ["latin"], 
  variable: '--font-sans',
});

export default function App({ Component, pageProps }: AppProps) {
  return <>
    <style jsx global>
    {`
      :root {
        --font-sans: ${sans.style.fontFamily};
        --font-mono: ${mono.style.fontFamily};
      }
    `}
    </style>
    <Component {...pageProps} />
  </>;
}
