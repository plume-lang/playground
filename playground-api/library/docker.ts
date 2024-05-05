import { customLog } from "#library/logger";
import path from 'path';
import { exec } from 'node:child_process';
import { unlink } from 'node:fs/promises';

export async function promiseExec(cmd: string) {
  interface Result {
    stdout: string;
    stderr: string;
    exitCode: number;
  }

  return new Promise<Result>((resolve) => {
    exec(cmd, (error, stdout, stderr) => {
      resolve({
        exitCode: error?.code ?? 0,
        stdout: stdout,
        stderr: stderr,
      });
    });
  });
}

export namespace Docker {
  export interface Result {
    exitCode: number;
    output: string;
  }

  export const serverPath = process.env.SERVER_PATH || path.join(path.dirname(Bun.main), 'server');

  export async function run(containerName: string, ...args: string[]): Promise<Result> {
    customLog('DOCKER', `Running Docker container ${containerName}`);

    // Run the container
    const tmpPath = path.resolve(serverPath, 'tmp');

    const isARM = process.env.PLATFORM === 'arm64';
    const platform = isARM ? '--platform linux/amd64' : '';
    
    const logFile = path.resolve(tmpPath, `log_${Date.now()}.log`);

    const res = await promiseExec(`docker run -v ${tmpPath}:/isolated/tmp ${platform} ${containerName} ${args} &> ${logFile}`);

    const output = await Bun.file(logFile);
    const outputStr = await output.text();
    
    await unlink(logFile);

    return {
      exitCode: res.exitCode ?? 0,
      output: outputStr,
    };
  }
}
