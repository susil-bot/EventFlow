import styled from 'styled-components';
import { BREAKPOINTS, Design } from '@/shared/styles/tokens';
import { visuallyHidden } from '@/shared/styles/visually-hidden';

/**
 * A raised card of buttons. The editor keeps it in view under the site
 * header on wide screens; on phones it docks to the bottom of the screen.
 */
export const StyledEditorActions = styled.div.withConfig({
  displayName: 'EditorActions'
})`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 45;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-end;
  gap: var(${Design.Space.Sm});
  padding: var(${Design.Space.Sm}) var(${Design.Space.Md});
  border-top: 1px solid var(${Design.Color.Border});
  background: var(${Design.Color.Surface});
  box-shadow: var(${Design.Shadow.Raised});

  @media (min-width: ${BREAKPOINTS.md}) {
    position: static;
    border: 0;
    padding: var(${Design.Space.Sm});
  }

  .visually-hidden {
    ${visuallyHidden}
  }

  /* Phones: one row that never wraps or overflows. */
  @media not all and (min-width: ${BREAKPOINTS.md}) {
    gap: var(${Design.Space.Xs});
    padding: var(${Design.Space.Xs}) var(${Design.Space.Sm});
    padding-bottom: calc(
      var(${Design.Space.Xs}) + env(safe-area-inset-bottom, 0px)
    );

    > * {
      flex: none;
    }

    /* Save and Publish share whatever width is left. */
    > .grow {
      flex: 1 1 0;
      min-width: 0;
      padding-inline: var(${Design.Space.Sm});
      letter-spacing: 0.06em;
      white-space: nowrap;
    }

    /* Preview keeps its accessible name but shows only the eye icon. */
    .action-label {
      ${visuallyHidden}
    }

    > a,
    > .icon-on-phone {
      justify-content: center;
      width: 48px;
      padding: 0;
    }

    /* The bar sits at the bottom, so its menu opens upwards. */
    ul[role='menu'] {
      top: auto;
      bottom: calc(100% + var(${Design.Space.Xs}));
      left: 0;
      right: auto;
    }
  }
`;

export const PreviewLink = styled.a.withConfig({
  displayName: 'EditorPreviewLink'
})`
  display: inline-flex;
  align-items: center;
  gap: var(${Design.Space.Xs});
  min-height: 48px;
  padding: 12px 24px;
  border: 1px solid var(${Design.Color.BorderStrong});
  border-radius: var(${Design.Radius.Control});
  background: var(${Design.Color.Surface});
  color: var(${Design.Color.Text});
  font-size: var(${Design.Font.SizeSm});
  font-weight: 500;
  letter-spacing: 0.12em;
  text-decoration: none;
  text-transform: uppercase;

  &:hover {
    background: var(${Design.Color.SurfaceMuted});
  }

  &:focus-visible {
    outline: 3px solid var(${Design.Color.Focus});
    outline-offset: 2px;
  }
`;

export const ExitButton = styled.button.withConfig({
  displayName: 'EditorExitButton'
})`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  min-height: 48px;
  border: 0;
  background: transparent;
  color: var(${Design.Color.Text});
  cursor: pointer;

  &:hover {
    background: var(${Design.Color.SurfaceMuted});
  }

  &:focus-visible {
    outline: 3px solid var(${Design.Color.Focus});
    outline-offset: 2px;
  }
`;
