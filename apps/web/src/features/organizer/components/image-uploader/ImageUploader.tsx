import React, { type DragEvent, useId, useRef, useState } from 'react';
import type { EventImage } from '@/shared/api/types';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import {
  DropZone,
  HiddenInput,
  ImageActions,
  ImageList,
  ImageTile,
  Thumb,
  UploaderError,
  UploaderHint,
  UploaderLabel,
  StyledUploader
} from './styles';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export type ImageUploaderProps = {
  images: EventImage[];
  onChange: (images: EventImage[]) => void;
  /** Uploads one file and resolves with the stored image. */
  onUpload: (file: File) => Promise<EventImage>;
  maxImages?: number;
  maxSizeMb?: number;
  error?: string;
  label?: string;
};

/**
 * Upload, reorder and remove promo images. The first image is the cover.
 * Files are checked here for fast feedback; the API re-checks the bytes.
 */
export const ImageUploader = ({
  images,
  onChange,
  onUpload,
  maxImages = 6,
  maxSizeMb = 5,
  error,
  label = 'Promo images'
}: ImageUploaderProps) => {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [localError, setLocalError] = useState<string>();
  const shownError = localError ?? error;
  const room = maxImages - images.length;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      return;
    }
    setLocalError(undefined);
    const files = Array.from(fileList);
    if (files.length > room) {
      setLocalError(`You can add up to ${maxImages} images.`);
    }
    const valid = files.slice(0, Math.max(room, 0)).filter((file) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setLocalError('Use a JPG, PNG or WebP image.');
        return false;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        setLocalError(`Images must be ${maxSizeMb} MB or smaller.`);
        return false;
      }
      return true;
    });

    setUploading(valid.length);
    const results = await Promise.allSettled(valid.map(onUpload));
    setUploading(0);
    // Keep the chosen order; report the first failure, if any.
    const added = results.flatMap((result) =>
      result.status === 'fulfilled' ? [result.value] : []
    );
    const failure = results.find((result) => result.status === 'rejected');
    if (failure) {
      const { reason } = failure as PromiseRejectedResult;
      setLocalError(
        reason instanceof Error
          ? reason.message
          : 'The image could not be uploaded. Please try again.'
      );
    }
    if (added.length > 0) {
      onChange([...images, ...added]);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) {
      return;
    }
    const next = [...images];
    const [moved] = next.splice(from, 1);
    if (moved) {
      next.splice(to, 0, moved);
      onChange(next);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    void handleFiles(event.dataTransfer.files);
  };

  return (
    <StyledUploader
      role="group"
      aria-labelledby={`${inputId}-label`}
      aria-describedby={shownError ? `${hintId} ${errorId}` : hintId}
    >
      <UploaderLabel id={`${inputId}-label`}>{label}</UploaderLabel>
      <UploaderHint id={hintId}>
        Up to {maxImages} JPG, PNG or WebP images, {maxSizeMb} MB each. The
        first image is the cover.
      </UploaderHint>

      {images.length > 0 ? (
        <ImageList>
          {images.map((image, index) => (
            <ImageTile key={image.id}>
              <Thumb
                src={image.url}
                alt={index === 0 ? 'Cover image' : `Promo image ${index + 1}`}
              />
              {index === 0 ? <Badge tone="info">Cover</Badge> : null}
              <ImageActions>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  aria-label={`Move image ${index + 1} earlier`}
                >
                  <Icon name="chevronLeft" size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => move(index, index + 1)}
                  disabled={index === images.length - 1}
                  aria-label={`Move image ${index + 1} later`}
                >
                  <Icon name="chevronRight" size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    onChange(images.filter((item) => item.id !== image.id))
                  }
                  aria-label={`Remove image ${index + 1}`}
                >
                  <Icon name="trash" size={16} />
                </Button>
              </ImageActions>
            </ImageTile>
          ))}
        </ImageList>
      ) : null}

      {room > 0 ? (
        <DropZone
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <HiddenInput
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            multiple
            onChange={(event) => void handleFiles(event.target.files)}
          />
          <Button
            variant="secondary"
            size="sm"
            isLoading={uploading > 0}
            onClick={() => inputRef.current?.click()}
          >
            <Icon name="upload" size={16} /> Upload images
          </Button>
          <span>or drag and drop here</span>
        </DropZone>
      ) : null}

      {shownError ? (
        <UploaderError id={errorId} role="alert">
          {shownError}
        </UploaderError>
      ) : null}
    </StyledUploader>
  );
};
