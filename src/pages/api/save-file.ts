import { PlumeFile, dataValidation } from "@/file";
import { defaultPlumeCode } from "@/plume-language";
import { randomUUID } from "crypto";
import { fstatSync, statSync, writeFileSync } from "fs";
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

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {

  if (req.method === 'POST') {
    const body = req.body;

    try {
      // Validating file name format
      const file: PlumeFile = dataValidation.parse(body) as z.infer<typeof dataValidation>;

      const { size, content, id } = file;

      if (size !== content.length) 
        return res.status(400).json({ error: 'Size does not match content length' });

      writeFileSync(`./server/files/${id}.json`, JSON.stringify(file), 'utf-8');
      
      return res.status(200).json(file);
    } catch (error) {
      return res.status(400).json({ error: error as string });
    }
  }

  return res.status(405).end();
}
