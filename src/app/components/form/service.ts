import axios from 'axios';
import { PDFDocument } from 'pdf-lib';

const CACHE_KEY = 'images';

interface BookInfoResponse {
  accessibleBook: boolean;
  bookConfig: string;
}

export interface BookConfig {
  URL: URL;
  HomeURL: string;
  RightToLeft: string;
  appLogoIcon: string;
  backGroundImgURL: string;
  largePath: string;
  normalPath: string;
  startPage: number;
  thumbPath: string;
  title: string;
  totalPageCount: number;
}

export async function getBookInfo(stringUrl: string): Promise<BookConfig> {
  const url = new URL(stringUrl.trim());
  const allowedPaths = ['/eBook.html', '/mEBook.html'].map((s) =>
    s.toLowerCase(),
  );
  const allowedHosts = ['www.myeschoolhome.com', 'myeschoolhome.com'].map((s) =>
    s.toLowerCase(),
  );
  if (
    !allowedHosts.includes(url.host.toLowerCase()) ||
    !allowedPaths.includes(url.pathname.toLowerCase())
  ) {
    throw new Error('Not supported book url');
  }
  const bookId = url.searchParams.get('name');
  if (!bookId) {
    throw new Error('Missing book name');
  }
  const response = await axios.post<BookInfoResponse>(
    'https://cors.ali-yusuf.com/',
    { ebookNewName: bookId, userId: null },
    {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        Authorization: 'Bearer null',
      },
      params: {
        url: 'https://www.myeschoolhome.com/library/webservice/ebooks/getEbookConfig',
      },
    },
  );
  let data: BookConfig;
  try {
    data = JSON.parse(response.data.bookConfig);
  } catch (e: unknown) {
    throw new Error("Can't parse response data.");
  }
  return { ...data, URL: url };
}

export function getImageURL(bookConfig: BookConfig) {
  return (id: number): string =>
    `https://cors.ali-yusuf.com/?url=${bookConfig.URL.origin}${bookConfig.largePath}${id}.jpg`;
}

export async function getBookImages(
  bookConfig: BookConfig,
  callback?: (progress: number) => void,
): Promise<ArrayBuffer[]> {
  let currentProgress = 0;
  const processSteps = 2;
  const getProgress = (progress = 0) => {
    currentProgress += progress || 1;
    return Math.floor(currentProgress / processSteps);
  };

  const imageURLGen = getImageURL(bookConfig);
  const images: string[] = [];
  for (let i = bookConfig.startPage; i <= bookConfig.totalPageCount; i++) {
    images.push(imageURLGen(i));
  }

  const result: Promise<ArrayBuffer>[] = [];
  if ('caches' in window) {
    await caches.open(CACHE_KEY).then(async (cache) => {
      await cache.addAll(images);
      callback?.(getProgress(images.length));
      const promises = (await cache.keys()).map((key) =>
        cache.match(key).then((data) => {
          if (!data) {
            throw new Error(`Missing image, Url: ${key.url}`);
          }
          callback?.(getProgress());
          return data.arrayBuffer();
        }),
      );
      result.push(...promises);
    });
  } else {
    const promises = images.map((src) => {
      return new Promise<ArrayBuffer>((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const img = new Image();
        img.src = src;
        img.onload = () => {
          callback?.(getProgress());
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          canvas.toBlob((b) => {
            if (b) {
              b.arrayBuffer()
                .then((arr) => {
                  callback?.(getProgress());
                  resolve(arr);
                })
                .catch(reject);
            } else {
              reject(new Error(`Empty image blob, Url: ${src}`));
            }
            canvas.remove();
          }, 'image/jpeg');
        };
        img.crossOrigin = 'anonymous';
        img.onerror = (e) => {
          canvas.remove();
          reject(e);
        };
      });
    });
    result.push(...promises);
  }

  return Promise.all(result);
}

export async function createPDFFromImages(
  images: ArrayBuffer[],
  callback?: (progress: number) => void,
): Promise<Uint8Array> {
  let currentProgress = 0;
  const processSteps = 2;
  const getProgress = (progress = 0) => {
    currentProgress += progress || 1;
    return Math.floor(currentProgress / processSteps);
  };
  const pdfDoc = await PDFDocument.create();
  const promises = images.map((image) => {
    return pdfDoc.embedJpg(image);
  });
  const pdfImages = await Promise.all(promises);
  callback?.(getProgress(pdfImages.length));
  pdfImages.forEach((image) => {
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
    });
  });
  callback?.(getProgress(pdfImages.length));
  return pdfDoc.save();
}

export function downloadFileFromBlob(blob: Blob, fileName: string): void {
  const fileUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', fileUrl);
  a.setAttribute('download', fileName);
  a.style.visibility = 'hidden';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => {
    URL.revokeObjectURL(fileUrl);
  }, 0);
}

export async function clearCache(): Promise<void> {
  if ('caches' in window) {
    await caches.delete(CACHE_KEY);
  }
}
