import { z } from "zod";
import { uniqueNamesGenerator, animals, colors } from "unique-names-generator";
import path from "path";
import { Docker } from "#root/library/docker";
import { stat, unlink } from 'node:fs/promises';
import { CORS_HEADERS } from "#root/library/route";

export namespace FileSaver {
  interface FileRequest {
    fileName?: string;
    id?: string;
    code: string;
  }

  function validateBody(body: any): FileRequest {
    const bodyValidator = z.object({
      fileName: z.string().min(4).endsWith('.plm').optional(),
      id: z.string().uuid().optional(),
      code: z.string().min(0).max(1024 * 1024),
    });

    return bodyValidator.parse(body);
  }

  export async function handleRequest(req: Request): Promise<Response> {
    const body = await req.json();
    const { fileName, code, id } = validateBody(body);

    const finalFileName = fileName ?? uniqueNamesGenerator({ dictionaries: [colors, animals], separator: ' ' }).replaceAll(/\s+/, '-');
    const finalUuid = id ?? crypto.randomUUID();
    const jsonPath = '/' + path.join('exchange', 'files', `${finalUuid}.json`);

    // Create the JSON file
    const json = JSON.stringify({ 
      id,
      fileName: finalFileName,
      code,
      lastModified: Date.now(),
    });

    // Save the file
    await Bun.write(jsonPath, json);

    // Delete the file after a week
    deleteAfterDelay(jsonPath);

    return new Response(JSON.stringify({ id: finalUuid }), { status: 200, ...CORS_HEADERS });
  }

  export const FILE_RETENTION = 1000 * 60 * 60 * 24 * 7; // 7 days

  async function deleteAfterDelay(path: string) {
    await Bun.sleep(FILE_RETENTION);

    const { mtimeMs: lastModified } = await stat(path);
    
    if (Date.now() - lastModified > FILE_RETENTION) {
      return await unlink(path);
    }

    return await deleteAfterDelay(path);
  }
}