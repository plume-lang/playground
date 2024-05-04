import type { Route } from "#library/route";
import { Compiler } from "#routes/compile";
import { FileGetter } from "./routes/get-file";
import { FileSaver } from "./routes/save-file";

export const routes: Route[] = [
  {
    route: '/api/compile',
    method: 'POST',
    handler: Compiler.handleRequest,
  },
  {
    route: '/api/save-file',
    method: 'POST',
    handler: FileSaver.handleRequest,
  },
  {
    route: /\/api\/file\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/,
    method: 'GET',
    handler: FileGetter.handleRequest,
  }
]