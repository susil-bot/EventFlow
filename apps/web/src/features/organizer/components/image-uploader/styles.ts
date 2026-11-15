import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';
import { visuallyHidden } from '@/shared/styles/visually-hidden';

export const StyledUploader = styled.div.withConfig({
  displayName: 'ImageUploader'
})`
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Xs});
`;

export const UploaderLabel = styled.span.withConfig({
  displayName: 'ImageUploaderLabel'
})`
  font-size: var(${Design.Font.SizeSm});
  font-weight: 600;
`;

export const UploaderHint = styled.p.withConfig({
  displayName: 'ImageUploaderHint'
})`
  font-size: var(${Design.Font.SizeSm});
  color: var(${Design.Color.TextMuted});
`;

export const UploaderError = styled.p.withConfig({
  displayName: 'ImageUploaderError'
})`
  font-size: var(${Design.Font.SizeSm});
  color: var(${Design.Color.Danger});
`;

export const ImageList = styled.ul.withConfig({
  displayName: 'ImageUploaderList'
})`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(${Design.Space.Sm});
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const ImageTile = styled.li.withConfig({
  displayName: 'ImageUploaderTile'
})`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(${Design.Space.Xxs});
  padding: var(${Design.Space.Xxs});
  border: 1px solid var(${Design.Color.Border});
  border-radius: var(${Design.Radius.Md});
  background: var(${Design.Color.SurfaceMuted});

  > span {
    position: absolute;
    top: var(${Design.Space.Xs});
    left: var(${Design.Space.Xs});
  }
`;

export const Thumb = styled.img.withConfig({
  displayName: 'ImageUploaderThumb'
})`
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: var(${Design.Radius.Sm});
`;

export const ImageActions = styled.div.withConfig({
  displayName: 'ImageUploaderActions'
})`
  display: flex;
  justify-content: center;
  gap: var(${Design.Space.Xxs});
`;

export const DropZone = styled.div.withConfig({
  displayName: 'ImageUploaderDropZone'
})`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(${Design.Space.Sm});
  padding: var(${Design.Space.Md});
  border: 1px dashed var(${Design.Color.Border});
  border-radius: var(${Design.Radius.Md});
  font-size: var(${Design.Font.SizeSm});
  color: var(${Design.Color.TextMuted});
`;

export const HiddenInput = styled.input.withConfig({
  displayName: 'ImageUploaderInput'
})`
  ${visuallyHidden}
`;
