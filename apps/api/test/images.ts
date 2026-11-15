import { crc32, deflateSync } from 'node:zlib';
import sharp from 'sharp';

type Format = 'png' | 'jpeg' | 'webp';

/** A real (decodable) solid-colour image for upload tests. */
export const makeImage = (
  format: Format,
  { width = 8, height = 8 }: { width?: number; height?: number } = {}
): Promise<Buffer> =>
  sharp({
    create: { width, height, channels: 3, background: '#1f6f80' }
  })
    .toFormat(format)
    .toBuffer();

/** A JPEG carrying EXIF with a GPS position and an artist name. */
export const makeJpegWithGps = (): Promise<Buffer> =>
  sharp({
    create: { width: 16, height: 12, channels: 3, background: '#c33' }
  })
    .jpeg()
    .withExif({
      IFD0: { Artist: 'Asha Attendee' },
      IFD3: { GPSLatitudeRef: 'N', GPSLatitude: '13/1 4/1 0/1' }
    })
    .toBuffer();

const chunk = (type: string, data: Buffer) => {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
};

/**
 * A tiny PNG whose header claims 20,000 × 20,000 pixels: the shape of a
 * decompression bomb. Only a few bytes long, so it passes the size limit.
 */
export const makePixelBomb = (): Buffer => {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(20_000, 0);
  header.writeUInt32BE(20_000, 4);
  header.writeUInt8(8, 8); // bit depth
  header.writeUInt8(2, 9); // truecolour
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(Buffer.alloc(64))),
    chunk('IEND', Buffer.alloc(0))
  ]);
};
