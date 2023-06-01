import { join, resolve, isAbsolute } from 'path';
import { stat } from 'fs';

interface FileResult {
  ok: boolean;
  errorMessage?: string;
  absolutePath?: string;
}

const exists = (path: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    stat(path, (err, stats) => {
      if (err) {
        reject(`Path ${path} doesn't exist!`);
      }
      else {
        resolve();
      }
    })
  })
}

export const toAbsolutePath = (path: string): string => {
  let usedPath;

  if (isAbsolute(path)) {
    usedPath = path;
  } else {
    usedPath = resolve(process.cwd(), path);
  }

  return usedPath;
}

export const checkFileOrPath = async (path: string): Promise<FileResult> => {
  const absolutePath = toAbsolutePath(path);
  try {
    const pathExists = await exists(absolutePath);
    return {
      ok: true,
      absolutePath: absolutePath,
    }
  } catch (err: any) {
    return {
      ok: false,
      errorMessage: err.toString(),
    }
  }
}