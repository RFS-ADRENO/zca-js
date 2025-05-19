export type AttachmentSource =
    | string
    | {
          data: Buffer;
          filename: `${string}.${string}`;
          metadata: {
              totalSize: number;
              width?: number;
              height?: number;
          };
      };
