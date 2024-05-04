export interface Route {
  route: string | RegExp;
  method: string;
  handler: (req: Request) => Promise<Response>;
}