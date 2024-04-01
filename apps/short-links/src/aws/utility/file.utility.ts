import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const editFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = uuidv4();
  callback(null, `${name}${randomName}${fileExtName}`);
};
