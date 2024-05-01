import { PlumeFile } from "@/file";
import { defaultPlumeCode } from "@/plume-language";
import { randomUUID } from "crypto";
import { writeFileSync } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
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
      };

      writeFileSync(`./server/files/${plumeFile.id}.json`, JSON.stringify(plumeFile), 'utf-8');
      
      res.status(200).json(plumeFile);
    } catch (error) {
      res.status(400).json({ error: error as string });
    }
    
  }
}
