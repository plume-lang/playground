import { PlumeFile, dataValidation } from "@/file";
import { spawn } from "child_process";
import { rmSync, writeFileSync } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";

type Data = { stdout: string } | { error: string };

const serverPath = process.env.SERVER_PATH || 'server';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
}

const compile = async (file: string): Promise<ContainerOutput> => new Promise(async (resolve) => {
  const compilerPath = path.resolve(serverPath, 'compiler', 'bin', 'plumec');
  const res = await spawn(compilerPath, [file], { cwd: path.resolve(serverPath, '..'), stdio: ['pipe', 'pipe', 'pipe']});
  
  let stdout = '';
  let stderr = '';
  
  res.stdout.on('data', (data) => {
    stdout += data.toString('utf-8');
  });

  res.stderr.on('data', (data) => {
    stderr += data.toString('utf-8');
  });

  res.on('close', (status) => {
    resolve({ stdout, stderr, status: status || 0 });
  });
});

interface ContainerOutput {
  stdout?: string;
  stderr?: string;
  status: number;
}

const run = async (container: string, ...args: string[]): Promise<ContainerOutput> => new Promise(async (resolve) => {
  const res = await spawn('docker', ['run', '-v', './server/tmp/:/isolated/tmp', '--platform', 'linux/amd64', container, ...args]);
  
  let stdout = '';
  let stderr = '';
  
  res.stdout.on('data', (data) => {
    stdout += data.toString('utf-8');
  });

  res.stderr.on('data', (data) => {
    stderr += data.toString('utf-8');
  });

  res.on('close', (status) => {
    resolve({ stdout, stderr, status: status || 0 });
  });
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {

  if (req.method === 'POST') {
    const body = req.body;

    try {
      // Validating file name format
      const file: PlumeFile = dataValidation.parse(body);

      const { content, id } = file;

      const modulePath = path.resolve(serverPath, `tmp/${id}.plm`);
      writeFileSync(modulePath, content, 'utf-8');

      const compilRes = await run('plume-compiler', `tmp/${id}.plm`);
      
      rmSync(modulePath);

      if (compilRes.status && compilRes.status !== 0) {
        return res.status(502).json({ 
          error: compilRes.stderr || 'Compilation failed'
        });
      }

      const bytecodeFile = path.resolve(serverPath, `tmp/${id}.bin`);

      const execRes = await run('plume-interpreter', `tmp/${id}.bin`);

      if (execRes.status && execRes.status !== 0) {
        return res.status(502).json({ 
          error: execRes.stderr || 'Execution failed'
        });
      }

      rmSync(bytecodeFile);
      
      if (!execRes.stdout) {
        return res.status(502).json({ error: 'Execution failed' });
      }

      return res.status(200).json({ stdout: execRes.stdout });
    } catch (error: any) {
      return res.status(502).json({ error: error.toString() });
    }
    
  }

  res.status(405).end();
}
