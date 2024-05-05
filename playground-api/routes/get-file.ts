import { z } from "zod";
import { uniqueNamesGenerator, animals, colors } from "unique-names-generator";
import path from "path";
import { Docker } from "#root/library/docker";
import { stat, unlink } from 'node:fs/promises';
import { CORS_HEADERS } from "#root/library/route";

export namespace FileGetter {
  function validateBody(body: any): string {
    const bodyValidator = z.string().uuid();

    return bodyValidator.parse(body);
  }

  export async function handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const id = validateBody(url.pathname.split('/').pop());

    const jsonPath = '/' + path.join('exchange', 'files', `${id}.json`);
    const json = await Bun.file(jsonPath);

    if (!await json.exists()) {
      return new Response(JSON.stringify({ error: 'File not found' }), { status: 404, ...CORS_HEADERS });
    }

    const content = await json.text();

    return new Response(content, { status: 200, ...CORS_HEADERS });
  }
}