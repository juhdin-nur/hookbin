export interface UploadedFile {
  field: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface CapturedRequest {
  id: string;
  bucketId: string;
  method: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: unknown;
  files: UploadedFile[];
  ip: string;
  timestamp: string;
}
