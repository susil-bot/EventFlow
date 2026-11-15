import styled from 'styled-components';
import { Design } from '@/shared/styles/tokens';

export const MapFrame = styled.div.withConfig({
  displayName: 'VenueMap'
})<{ $height: number; $editable: boolean }>`
  /* Leaflet's panes use z-indexes up to 1000; keep them inside the map so
     they never cover the sticky header or the editor's action bar. */
  position: relative;
  z-index: 0;
  isolation: isolate;
  width: 100%;
  height: ${({ $height }) => $height}px;
  border: 1px solid var(${Design.Color.Border});
  background: var(${Design.Color.SurfaceMuted});
  font-family: var(${Design.Font.Family});
  cursor: ${({ $editable }) => ($editable ? 'crosshair' : 'grab')};

  .leaflet-container {
    font: inherit;
  }

  .leaflet-control-attribution {
    font-size: var(${Design.Font.SizeXs});
  }

  /* Teardrop pin drawn in CSS; the tip sits on the venue. */
  .venue-map-pin span {
    display: block;
    width: 28px;
    height: 28px;
    border: 3px solid var(${Design.Color.Surface});
    border-radius: 50% 50% 50% 0;
    background: var(${Design.Color.Primary});
    box-shadow: var(${Design.Shadow.Raised});
    transform: rotate(-45deg);
  }

  .leaflet-marker-draggable {
    cursor: move;
  }

  .leaflet-container:focus-visible {
    outline: 3px solid var(${Design.Color.Focus});
    outline-offset: 2px;
  }
`;
