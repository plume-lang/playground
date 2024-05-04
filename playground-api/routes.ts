import type { Route } from "#library/route";
import { RouteModule } from "#routes/compile";

export const routes: Route[] = [
  {
    route: '/api/compile',
    method: 'POST',
    handler: RouteModule.handleRequest,
  }
]