import { PlumeFile, dataValidation } from "@/file";
import { spawnSync } from "child_process";
import { rmSync, statSync, writeFileSync } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = { stdout: string } | { error: string };

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
      const file: PlumeFile = dataValidation.parse(body);

      const { content, id } = file;

      writeFileSync(`./server/tmp/${id}.plm`, content, 'utf-8');

      const compilRes = spawnSync('docker', ['run', '-v', './server/tmp/:/isolated/tmp', '--platform', 'linux/amd64', 'plume-compiler', `tmp/${id}.plm`], { stdio: ['inherit', 'inherit', 'pipe'] });
      
      rmSync(`./server/tmp/${id}.plm`);

      if (compilRes.status !== 0) {
        return res.status(400).json({ error: compilRes.stderr.toString('utf-8') });
      }

      const bytecodeFile = `server/tmp/${id}.bin`;

      if (!statSync(bytecodeFile).isFile()) {
        return res.status(400).json({ error: 'Compilation failed' });
      }

      const execRes = spawnSync('docker', ['run', '-v', './server/tmp/:/isolated/tmp', '--platform', 'linux/amd64', 'plume-interpreter', `tmp/${id}.bin`]);

      rmSync(bytecodeFile);

      if (execRes.status !== 0) {
        return res.status(400).json({ error: execRes.stderr.toString('utf-8') });
      }
      
      res.status(200).json({ stdout: execRes.stdout.toString('utf-8') });
    } catch (error) {
      res.status(400).json({ error: error as string });
    }
    
  }
}
