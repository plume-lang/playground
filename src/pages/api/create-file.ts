import { PlumeFile, dataValidation } from "@/file";
import { defaultPlumeCode } from "@/plume-language";
import { randomUUID } from "crypto";
import { writeFileSync } from "fs";
import { readFile, unlink } from "fs/promises";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { z } from "zod";

type Data = PlumeFile | { error: string };

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
}

const serverPath = process.env.SERVER_PATH || 'server';

const filenameValidation = z.string().min(1).max(100).endsWith('.plm');
const requestValidation = z.object({ name: filenameValidation });

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {

  if (req.method === 'POST') {
    const body = req.body;

    try {
      // Validating file name format
      const { name } = requestValidation.parse(body);

      const size = defaultPlumeCode.length;
      const plumeFile: PlumeFile = {
        name,
        size,
        id: randomUUID(),
        content: defaultPlumeCode,
        lastModified: Date.now()
      };

      const filePath = path.resolve(serverPath, `files/${plumeFile.id}.json`);

      writeFileSync(filePath, JSON.stringify(plumeFile), 'utf-8');

      deleteAfterDelay(filePath);
      
      return res.status(200).json(plumeFile);
    } catch (error) {
      return res.status(400).json({ error: error as string });
    }
  }

  return res.status(405).end();
}

const delay = 1000 * 60 * 60 * 24 * 7 * 4;

async function deleteAfterDelay(file: string) {
  await new Promise(() => {
    setTimeout(async () => {
      try {
        const content = await readFile(file, 'utf-8');
        const data = JSON.parse(content);

        const parsedData = dataValidation.parse(data);

        const now = Date.now();

        if (now - parsedData.lastModified > delay) {
          await unlink(file);
        } else {
          await deleteAfterDelay(file);
        }
      } catch (error) {}
    }, delay);
  });
}