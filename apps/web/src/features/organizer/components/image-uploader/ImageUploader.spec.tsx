import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ImageUploader } from './ImageUploader';

const png = (name = 'cover.png') =>
  new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], name, {
    type: 'image/png'
  });

describe('<ImageUploader />', () => {
  it('uploads chosen files and adds them after the existing images', async () => {
    const onChange = vi.fn();
    const onUpload = vi.fn(async () => ({
      id: 'new',
      url: '/uploads/new.png'
    }));
    const { container } = render(
      <ImageUploader
        images={[{ id: 'old', url: '/uploads/old.png' }]}
        onChange={onChange}
        onUpload={onUpload}
      />
    );

    await userEvent.upload(
      container.querySelector('input[type="file"]') as HTMLInputElement,
      png()
    );

    expect(onUpload).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([
      { id: 'old', url: '/uploads/old.png' },
      { id: 'new', url: '/uploads/new.png' }
    ]);
  });

  it('rejects files that are too large without uploading them', async () => {
    const onUpload = vi.fn();
    const { container } = render(
      <ImageUploader
        images={[]}
        onChange={vi.fn()}
        onUpload={onUpload}
        maxSizeMb={0.000001}
      />
    );

    await userEvent.upload(
      container.querySelector('input[type="file"]') as HTMLInputElement,
      png()
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/MB or smaller/);
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('moves an image to the cover position and removes images', async () => {
    const onChange = vi.fn();
    const images = [
      { id: 'a', url: '/uploads/a.png' },
      { id: 'b', url: '/uploads/b.png' }
    ];
    render(
      <ImageUploader images={images} onChange={onChange} onUpload={vi.fn()} />
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Move image 2 earlier' })
    );
    expect(onChange).toHaveBeenLastCalledWith([images[1], images[0]]);

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove image 1' })
    );
    expect(onChange).toHaveBeenLastCalledWith([images[1]]);
  });
});
