import type { Meta, StoryObj } from '@storybook/react-vite';
import { ImageUploader } from './ImageUploader';

const placeholder = (hue: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="100%" height="100%" fill="hsl(${hue} 60% 70%)"/></svg>`
  )}`;

const meta: Meta<typeof ImageUploader> = {
  title: 'Patterns/ImageUploader',
  component: ImageUploader,
  args: {
    images: [],
    onChange: () => undefined,
    onUpload: async () => ({ id: `img-${Date.now()}`, url: placeholder(200) })
  }
};

export default meta;

type Story = StoryObj<typeof ImageUploader>;

export const Empty: Story = {};
export const WithImages: Story = {
  args: {
    images: [
      { id: 'img-1', url: placeholder(20) },
      { id: 'img-2', url: placeholder(140) }
    ]
  }
};
export const WithError: Story = {
  args: {
    error: 'One of the images could not be found. Please upload it again.'
  }
};
