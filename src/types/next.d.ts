
// Type declarations for Next.js API handlers
declare module 'next' {
  export interface NextApiRequest {
    method: string;
    body: any;
    query: { [key: string]: string | string[] };
    headers: any;
  }
  
  export interface NextApiResponse {
    status(code: number): NextApiResponse;
    json(data: any): void;
  }
}
