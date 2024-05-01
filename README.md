# The Plume Playground

Plume Playground is a website crafted with TailwindCSS, Next.js, Monaco, and XTerm that lets the user use Plume on the web without the need to install anything.

## Getting Started

First, you need to set up the server by installing Plume for Linux and extracting it into the `compiler` subfolder.

Then you need to build both compiler and interpreter docker images by running:
```bash
# Specifying platform to make it work on ARM systems
docker build server -t plume-compiler -f server/Dockerfile.compiler --platform linux/amd64

docker build server -t plume-interpreter -f server/Dockerfile.interpreter --platform linux/amd64
```

Finally, install the dependencies:

```bash
npm i -f # You might add the force flag due to XTerm beta dependencies
```

And then, run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed at [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
