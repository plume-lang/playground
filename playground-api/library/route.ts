export interface Route {
  route: string | RegExp;
  method: string;
  handler: (req: Request) => Promise<Response>;
}

export const CORS_HEADERS = {
  headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST',
      'Access-Control-Allow-Headers': 'Content-Type',
  },
};