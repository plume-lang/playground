import { PlumeFile, dataValidation } from "@/file";
import { exec, spawn, spawnSync } from "child_process";
import fs, { createWriteStream, rmSync, statSync, writeFileSync } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import dockerode from 'dockerode';
import path from "path";
import { Writable } from "stream";
import { StringDecoder } from "string_decoder";
import { stderr } from "process";

type Data = { stdout: string } | { error: string };

function getAppRootDir () {
  let currentDir = __dirname
  while(!fs.existsSync(path.join(currentDir, 'package.json'))) {
    currentDir = path.join(currentDir, '..')
  }
  if (process.env.NODE_ENV === 'development') {
    currentDir = path.join(currentDir, '..')
  }
  return currentDir
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
}

const compile = (file: string) => {
  const server = path.join(getAppRootDir(), 'server');
  return spawnSync(path.resolve(server, 'compiler', 'bin', 'plumec'), [file], { cwd: server })
}

interface ContainerOutput {
  stdout?: string;
  stderr?: Error;
  status: number;
}

const run = async (container: string, ...args: string[]): Promise<ContainerOutput> => new Promise(async (resolve, reject) => {
  const res = await spawn('docker', ['run', '-v', './server/tmp/:/isolated/tmp', '--platform', 'linux/amd64', container, ...args]);
  
  res.stderr.on('data', (data) => {
    reject({ stderr: data.toString('utf-8'), status: 1 });
  });

  res.stdout.on('data', async (data) => {
    resolve({ stdout: data.toString('utf-8'), status: 0 });
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

      const rootPath = path.join(getAppRootDir(), 'server');

      writeFileSync(path.resolve(rootPath, `tmp/${id}.plm`), content, 'utf-8');

      const compilRes = compile(`tmp/${id}.plm`);
      
      rmSync(path.resolve(rootPath, `tmp/${id}.plm`));

      if (compilRes.status && compilRes.status !== 0) {
        return res.status(400).json({ 
          error: compilRes.stderr.toString('utf-8') 
        });
      }

      const bytecodeFile = path.resolve(rootPath, `tmp/${id}.bin`);

      if (!statSync(bytecodeFile).isFile()) {
        return res.status(400).json({ error: 'Compilation failed' });
      }

      const execRes = await run('plume-interpreter', `tmp/${id}.bin`);

      if (execRes.status && execRes.status !== 0 && execRes.stderr) {
        return res.status(400).json({ 
          error: execRes.stderr.message
        });
      }

      rmSync(bytecodeFile);
      
      if (!execRes.stdout) {
        return res.status(400).json({ error: 'Execution failed' });
      }

      res.status(200).json({ stdout: execRes.stdout });
    } catch (error) {
      res.status(400).json({ error: error as string });
    }
    
  }
}
