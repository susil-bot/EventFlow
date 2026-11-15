import request from 'supertest';
import sharp from 'sharp';
import { pool } from '../src/db/pool';
import { MAX_IMAGE_SIDE } from '../src/modules/uploads/sanitize';
import { localDiskStore } from '../src/modules/uploads/storage/local-disk';
import { app, createUser, resetDatabase, type TestUser } from './factories';
import { makeImage, makeJpegWithGps, makePixelBomb } from './images';

afterAll(() => pool.end());
beforeEach(resetDatabase);

const upload = (user: TestUser, bytes: Buffer, type: string) =>
  request(app)
    .post('/api/uploads/images')
    .set('Cookie', user.cookie)
    .set('Content-Type', type)
    .send(bytes);

/** Downloads a stored image the way the browser would. */
const fetchStored = async (url: string): Promise<Buffer> => {
  const response = await request(app)
    .get(url)
    .buffer(true)
    .parse((res, done) => {
      const parts: Buffer[] = [];
      res.on('data', (part: Buffer) => parts.push(part));
      res.on('end', () => done(null, Buffer.concat(parts)));
    })
    .expect(200);
  return response.body as Buffer;
};

describe('image upload sanitising', () => {
  let organizer: TestUser;
  beforeEach(async () => {
    organizer = await createUser('ORGANIZER');
  });

  it('removes EXIF metadata such as the GPS position', async () => {
    const original = await makeJpegWithGps();
    expect((await sharp(original).metadata()).exif).toBeDefined();

    const uploaded = await upload(organizer, original, 'image/jpeg').expect(
      201
    );
    const stored = await fetchStored(uploaded.body.data.url);

    const meta = await sharp(stored).metadata();
    expect(meta.format).toBe('jpeg');
    expect(meta.exif).toBeUndefined();
    expect(stored.includes(Buffer.from('Asha Attendee'))).toBe(false);
  });

  it('keeps the detected format and scales large images down', async () => {
    const wide = await makeImage('webp', { width: 3000, height: 1500 });

    const uploaded = await upload(organizer, wide, 'image/webp').expect(201);
    expect(uploaded.body.data.url).toMatch(/\.webp$/);

    const meta = await sharp(
      await fetchStored(uploaded.body.data.url)
    ).metadata();
    expect(meta).toMatchObject({
      format: 'webp',
      width: MAX_IMAGE_SIDE,
      height: MAX_IMAGE_SIDE / 2
    });
  });

  it('drops anything appended after the picture', async () => {
    const png = await makeImage('png');
    const polyglot = Buffer.concat([
      png,
      Buffer.from('<script>alert(1)</script>')
    ]);

    const uploaded = await upload(organizer, polyglot, 'image/png').expect(201);
    const stored = await fetchStored(uploaded.body.data.url);

    expect(stored.includes(Buffer.from('<script>'))).toBe(false);
  });

  it('refuses a file that starts like an image but is not one', async () => {
    const fake = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0
    ]);

    const response = await upload(organizer, fake, 'image/png').expect(415);

    expect(response.body.error.code).toBe('UNSUPPORTED_IMAGE');
  });

  it('refuses huge dimensions before decoding (decompression bomb)', async () => {
    const response = await upload(
      organizer,
      makePixelBomb(),
      'image/png'
    ).expect(413);

    expect(response.body.error).toMatchObject({
      code: 'FILE_TOO_LARGE',
      message: 'Image resolution is too high. The maximum is 40 megapixels.'
    });
  });
});

describe('local disk store', () => {
  it('only accepts server-generated keys, so no path can escape UPLOAD_DIR', async () => {
    await expect(
      localDiskStore.put('../../etc/passwd', Buffer.from('x'), 'image/png')
    ).rejects.toThrow('Refusing unexpected upload key');
    await expect(localDiskStore.remove('../secret.png')).rejects.toThrow(
      'Refusing unexpected upload key'
    );
  });
});
