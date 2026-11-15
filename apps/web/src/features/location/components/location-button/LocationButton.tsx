import React from 'react';
import { Icon } from '@/shared/ui/icon';
import { StyledLocationButton } from './styles';

export type LocationButtonProps = {
  /** Chosen city name, or null for all cities. */
  cityName: string | null;
  onClick: () => void;
};

/** Shows the city Discover is centred on and opens the city picker. */
export const LocationButton = ({ cityName, onClick }: LocationButtonProps) => (
  <StyledLocationButton
    type="button"
    onClick={onClick}
    aria-haspopup="dialog"
    aria-label={`Change city (now: ${cityName ?? 'all cities'})`}
  >
    <Icon name="pin" size={18} />
    <span>{cityName ?? 'All cities'}</span>
    <Icon name="chevronDown" size={16} />
  </StyledLocationButton>
);
