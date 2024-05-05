import { customLog } from "#library/logger";
import path from 'path';
import { exec } from 'node:child_process';
import { unlink } from 'node:fs/promises';

interface Result {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function promiseExec(cmd: string): Promise<Result> {
  return new Promise((resolve) => {
    exec(cmd, (err, stdout, stderr) => {
      resolve({
        stdout,
        stderr,
        exitCode: err?.code ?? 0,
      });
    });
  })
}

export namespace Docker {
  export interface Result {
    exitCode: number;
    output: string;
  }

  export const serverPath = path.join(path.dirname(Bun.main), 'server');

  export async function run(containerName: string, ...args: string[]): Promise<Result> {
    customLog('DOCKER', `Running Docker container ${containerName}`);

    const volumePath = path.resolve(process.env.EXCHANGE_PATH ?? '', 'tmp');
    const logPath = '/exchange/tmp';
    
    const logFile = path.join(logPath, `log_${Date.now()}.log`);
    const statusFile = path.join(logPath, `status_${Date.now()}.log`);

    await promiseExec(`(docker run -v ${volumePath}:/isolated/tmp ${containerName} ${args}; echo $?> ${statusFile}) | tee ${logFile}`);

    const output = await Bun.file(logFile);
    const outputStr = await output.text();

    const status = await Bun.file(statusFile);
    const statusStr = await status.text();
    const exitCode = parseInt(statusStr);
    
    await unlink(logFile);
    await unlink(statusFile);

    return {
      exitCode: exitCode,
      output: outputStr,
    };
  }
}
