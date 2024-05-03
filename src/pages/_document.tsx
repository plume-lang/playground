import { Metadata } from "next";
import { Html, Head, Main, NextScript } from "next/document";

export const metadata: Metadata = {
  title: 'The Plume Playground',
  description: 'An online playground for the Plume programming language',
}

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>Plume Playground</title>
        <meta name="description" content="An online playground for the Plume programming language" />
        <link rel="shortcut icon" href="/logo-bg.svg" type="image/x-icon" />
      </Head>
      <body className="bg-zinc-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
