import React, { useState } from 'react';
import type { RegistrationDto } from '@/shared/api/types';
import {
  formatEventShort,
  formatSlotRange
} from '@/features/events/utils/event-format';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { EventCover } from '@/features/events/components/event-cover';
import {
  ItemActions,
  ItemBody,
  ItemCover,
  ItemMeta,
  ItemNote,
  ItemStatus,
  ItemTitle,
  ItemTitleLink,
  StyledItem
} from './styles';

export type RegistrationItemProps = {
  registration: RegistrationDto;
  onCancel: (registrationId: string) => void;
  isCanceling?: boolean;
};

export const RegistrationItem = ({
  registration,
  onCancel,
  isCanceling = false
}: RegistrationItemProps) => {
  const { event } = registration;
  const isActive = registration.status === 'ACTIVE';
  const eventCanceled = event.status === 'CANCELED';
  const canCancel = isActive && !eventCanceled && !event.hasStarted;
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <StyledItem $inactive={!isActive || eventCanceled}>
      <ItemCover>
        <EventCover
          title={event.title}
          muted={!isActive || eventCanceled}
          imageUrl={event.images[0]?.url}
        />
      </ItemCover>
      <ItemBody>
        <ItemStatus>
          {isActive ? (
            <Badge tone="success">Registered</Badge>
          ) : (
            <Badge tone="neutral">Registration canceled</Badge>
          )}
          {eventCanceled ? <Badge tone="danger">Event canceled</Badge> : null}
        </ItemStatus>
        <ItemTitle>
          <ItemTitleLink to={`/events/${event.slug}`}>
            {event.title}
          </ItemTitleLink>
        </ItemTitle>
        <ItemMeta>
          <span>
            <Icon name="calendar" size={16} />
            {registration.slot ? (
              <time dateTime={registration.slot.startsAt}>
                {registration.slot.label}:{' '}
                {formatSlotRange(registration.slot, event.timeZone)} (
                {event.timeZone})
              </time>
            ) : (
              <time dateTime={event.startsAt}>
                {formatEventShort(event)} ({event.timeZone})
              </time>
            )}
          </span>
          <span>
            <Icon name="pin" size={16} />
            {event.venue}
          </span>
        </ItemMeta>
        {eventCanceled && event.cancellationReason ? (
          <ItemNote>Canceled: {event.cancellationReason}</ItemNote>
        ) : null}
      </ItemBody>
      {canCancel && !isConfirming ? (
        <Button
          variant="danger"
          size="sm"
          onClick={() => setIsConfirming(true)}
          aria-label={`Cancel registration for ${event.title}`}
        >
          Cancel registration
        </Button>
      ) : null}
      {canCancel && isConfirming ? (
        <ItemActions>
          <Button
            variant="danger"
            size="sm"
            isLoading={isCanceling}
            onClick={() => onCancel(registration.id)}
            aria-label={`Confirm cancel registration for ${event.title}`}
          >
            Yes, cancel registration
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={isCanceling}
            onClick={() => setIsConfirming(false)}
          >
            Keep
          </Button>
        </ItemActions>
      ) : null}
    </StyledItem>
  );
};
