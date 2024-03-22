import * as Buffer from 'buffer';

export interface IUploadFile {
  _id: string;
  file: IFileBuffer;
}

interface IFileBuffer {
  originalname: string;
  buffer: Buffer;
}
