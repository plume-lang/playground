import path from "path";
import { promiseExec } from "#api/library/docker";
import { which } from "bun";
import { LogLevel, customLog, log } from "#api/library/logger";

// Check for Docker installed

if (!which('docker')) {
  log(LogLevel.ERROR, 'Docker not found in path');
  process.exit(1);
}

// Build dockerfiles in the server directory

const compilerName = process.env.COMPILER ?? 'plume-compiler';
const interpreterName = process.env.INTERPRETER ?? 'plume-interpreter';

const serverPath = path.join(path.dirname(Bun.main), 'playground-api', 'server');

function createDockerfilePath(container: string): string {
  return path.resolve(serverPath, `Dockerfile.${container}`);
}

customLog('DOCKER', 'Building compiler image');
const cRes = await promiseExec(`docker build ${serverPath} -t ${compilerName} -f ${createDockerfilePath('compiler')}`);

if (cRes.exitCode !== 0) {
  log(LogLevel.ERROR, 'Failed to build compiler image');
  console.log(cRes.stderr);
  process.exit(1);
}

customLog('DOCKER', 'Building interpreter image');
const iRes = await promiseExec(`docker build ${serverPath} -t ${interpreterName} -f ${createDockerfilePath('interpreter')}`);

if (iRes.exitCode !== 0) {
  log(LogLevel.ERROR, 'Failed to build interpreter image');
  console.log(iRes.stderr);
  process.exit(1);
}

log(LogLevel.SUCCESS, 'Built both Docker images successfully');
