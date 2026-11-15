import React from 'react';
import type { RegistrationDto } from '@/shared/api/types';
import { RegistrationItem } from '../registration-item';
import { ListSection, SectionHeading, StyledList } from './styles';

export type RegistrationListProps = {
  registrations: RegistrationDto[];
  onCancel: (registrationId: string) => void;
  cancelingId?: string;
};

/**
 * Groups registrations so attendees never confuse them: "Upcoming" only holds
 * active registrations for events that are still on; registrations they
 * canceled and events the organizer canceled go under "Canceled".
 */
export const RegistrationList = ({
  registrations,
  onCancel,
  cancelingId
}: RegistrationListProps) => {
  const isUpcoming = (item: RegistrationDto) =>
    item.status === 'ACTIVE' && item.event.status !== 'CANCELED';
  const active = registrations.filter(isUpcoming);
  const canceled = registrations.filter((item) => !isUpcoming(item));

  const renderGroup = (items: RegistrationDto[]) => (
    <StyledList>
      {items.map((registration) => (
        <RegistrationItem
          key={registration.id}
          registration={registration}
          onCancel={onCancel}
          isCanceling={cancelingId === registration.id}
        />
      ))}
    </StyledList>
  );

  return (
    <>
      <ListSection aria-labelledby="active-registrations">
        <SectionHeading id="active-registrations">
          Upcoming ({active.length})
        </SectionHeading>
        {active.length > 0 ? (
          renderGroup(active)
        ) : (
          <p>You have no active registrations.</p>
        )}
      </ListSection>
      {canceled.length > 0 ? (
        <ListSection aria-labelledby="canceled-registrations">
          <SectionHeading id="canceled-registrations">
            Canceled ({canceled.length})
          </SectionHeading>
          {renderGroup(canceled)}
        </ListSection>
      ) : null}
    </>
  );
};
