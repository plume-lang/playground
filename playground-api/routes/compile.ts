import { Docker, promiseExec } from "#root/library/docker";
import { z } from "zod";
import path from "path";
import { unlink, exists } from "node:fs/promises";
import { CORS_HEADERS } from "#root/library/route";

export namespace Compiler {
  interface CodeRequest {
    code: string;
    id?: string;
  }

  function validateBody(body: any): CodeRequest {
    const bodyValidator = z.object({
      code: z.string(),
      id: z.string().uuid().optional(),
    });

    return bodyValidator.parse(body);
  }

  async function compile(fileName: string, code: string): Promise<Docker.Result> {
    const tmpPath = '/' + path.join('exchange', 'tmp', fileName);

    await Bun.write(tmpPath, code);
    
    const res = await Docker.run('plume-compiler', `tmp/${fileName}`);
    await unlink(tmpPath);

    return res;
  }

  async function run(fileName: string): Promise<Docker.Result> {
    const tmpPath = '/' + path.join('exchange', 'tmp', fileName);

    if (!await exists(tmpPath)) {
      return {
        exitCode: 1,
        output: 'File not found',
      }
    }

    const res = await Docker.run('plume-interpreter', `tmp/${fileName}`);

    await unlink(tmpPath);

    return res;
  }

  export async function handleRequest(req: Request): Promise<Response> {
    const body = await req.json();
    const { code, id } = validateBody(body);

    const fileName = id ?? `${crypto.randomUUID()}.plm`;

    const res = await compile(fileName, code);
    
    if (res.exitCode !== 0) {
      return new Response(JSON.stringify(res), { status: 400, ...CORS_HEADERS });
    }

    const newFileName = fileName.replace('.plm', '.js');
    const runRes = await run(newFileName);

    if (runRes.exitCode !== 0) {
      return new Response(JSON.stringify(runRes), { status: 400, ...CORS_HEADERS });
    }

    return new Response(JSON.stringify({ output: runRes.output }), { status: 200, ...CORS_HEADERS });
  }
}