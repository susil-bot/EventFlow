import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { chooseOption } from '@/shared/test/select';
import { cities } from '@/shared/test/fixtures/cities';
import { EventForm } from './EventForm';

const HALL_A = { latitude: 13.0418, longitude: 80.2341 };

/** Finds the venue with the (stubbed) address search and pins it. */
const pinVenue = async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(
      JSON.stringify([
        {
          place_id: 7,
          lat: String(HALL_A.latitude),
          lon: String(HALL_A.longitude),
          display_name: 'Hall A, T. Nagar, Chennai'
        }
      ])
    )
  );
  expect(screen.getByLabelText('Search for the address')).toHaveValue(
    'Hall A, Chennai'
  );
  await userEvent.click(screen.getByRole('button', { name: 'Find' }));
  await userEvent.click(
    await screen.findByRole('button', { name: 'Hall A, T. Nagar, Chennai' })
  );
};

afterEach(() => vi.restoreAllMocks());

const fill = async () => {
  await userEvent.type(screen.getByLabelText(/Title/), 'Chennai Meetup ');
  await userEvent.type(screen.getByLabelText(/Description/), 'About it');
  await chooseOption(screen.getByLabelText(/Category/), 'Meetup');
  await userEvent.type(
    screen.getByLabelText(/Start date and time/),
    '2030-09-03T18:00'
  );
  await chooseOption(screen.getByLabelText(/^City/), 'Chennai');
  await userEvent.type(screen.getByLabelText(/Venue or location/), 'Hall A');
  await userEvent.type(screen.getByLabelText(/Maximum capacity/), '25');
  const price = screen.getByLabelText(/Ticket price/);
  await userEvent.clear(price);
  await userEvent.type(price, '399.50');
  await pinVenue();
};

describe('<EventForm />', () => {
  it('shows required-field errors and does not submit', async () => {
    const onSubmit = vi.fn();
    render(<EventForm mode="create" onSubmit={onSubmit} cities={cities} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Publish event' })
    );

    expect(screen.getByText('Title is required.')).toBeInTheDocument();
    expect(
      screen.getByText('Choose the city where the event happens.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Capacity must be a whole number of at least 1.')
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits trimmed values with the chosen intent', async () => {
    const onSubmit = vi.fn();
    render(<EventForm mode="create" onSubmit={onSubmit} cities={cities} />);

    await fill();
    await userEvent.click(
      screen.getByRole('button', { name: 'Publish event' })
    );

    expect(onSubmit).toHaveBeenCalledWith(
      {
        title: 'Chennai Meetup',
        description: 'About it',
        eventType: 'IN_PERSON',
        category: 'MEETUP',
        slug: 'chennai-meetup',
        startsAtLocal: '2030-09-03T18:00',
        timeZone: 'Asia/Kolkata',
        venue: 'Hall A',
        cityId: 'chennai',
        venueLocation: HALL_A,
        priceMinor: 39_950,
        onlineUrl: '',
        capacity: 25,
        socialLinks: [],
        imageIds: [],
        publishAtLocal: null,
        expiresAtLocal: null,
        slots: []
      },
      'publish'
    );
  });

  it('needs a map pin to publish, but not to save a draft', async () => {
    const onSubmit = vi.fn();
    render(<EventForm mode="create" onSubmit={onSubmit} cities={cities} />);
    await fill();
    await userEvent.click(screen.getByRole('button', { name: 'Remove pin' }));

    await userEvent.click(
      screen.getByRole('button', { name: 'Publish event' })
    );
    expect(
      screen.getByText('Pin the venue on the map before publishing.')
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole('button', { name: 'Save as draft' })
    );
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ venueLocation: null }),
      'draft'
    );
  });

  it('asks for a meeting link instead of a venue for online events', async () => {
    const onSubmit = vi.fn();
    render(<EventForm mode="create" onSubmit={onSubmit} cities={cities} />);

    await chooseOption(screen.getByLabelText(/Event type/), 'Online');
    await userEvent.click(
      screen.getByRole('button', { name: 'Publish event' })
    );

    expect(
      screen.getByText('Meeting link is required for online and hybrid events.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Venue is required.')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^City/)).not.toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('fills the time zone from the chosen city', async () => {
    render(
      <EventForm
        mode="create"
        onSubmit={vi.fn()}
        cities={[
          {
            ...cities[0]!,
            id: 'london',
            name: 'London',
            timeZone: 'Europe/London'
          },
          ...cities
        ]}
      />
    );

    await chooseOption(screen.getByLabelText(/^City/), 'London');
    expect(screen.getByLabelText(/Time zone/)).toHaveTextContent(
      'Europe/London'
    );
  });

  it('replaces start time and capacity with time slots', async () => {
    const onSubmit = vi.fn();
    render(<EventForm mode="create" onSubmit={onSubmit} cities={cities} />);
    await fill();

    await userEvent.click(
      screen.getByRole('button', { name: /Add time slot/ })
    );
    expect(screen.queryByLabelText(/Maximum capacity/)).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/Slot name/), 'Morning');
    await userEvent.type(screen.getByLabelText(/Seats/), '3');
    await userEvent.type(screen.getByLabelText(/^Starts/), '2030-09-03T10:00');
    await userEvent.type(screen.getByLabelText(/^Ends/), '2030-09-03T12:00');
    await userEvent.click(
      screen.getByRole('button', { name: 'Publish event' })
    );

    const [input] = onSubmit.mock.calls[0]!;
    expect(input).not.toHaveProperty('capacity');
    expect(input).not.toHaveProperty('startsAtLocal');
    expect(input.slots).toEqual([
      {
        label: 'Morning',
        startsAtLocal: '2030-09-03T10:00',
        endsAtLocal: '2030-09-03T12:00',
        capacity: 3
      }
    ]);
  });

  it('leaves unchanged slots out of an edit so other fields stay editable', async () => {
    const onSubmit = vi.fn();
    render(
      <EventForm
        mode="edit"
        minCapacity={2}
        initialValues={{
          title: 'Lab',
          description: 'About it',
          category: 'WORKSHOP',
          slug: 'lab',
          timeZone: 'UTC',
          venue: 'Hall',
          city: { id: 'kochi', name: 'Kochi' },
          capacity: 6,
          slots: [
            {
              label: 'Morning',
              startsAtLocal: '2030-09-03T10:00',
              endsAtLocal: '2030-09-03T12:00',
              capacity: 6
            }
          ]
        }}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByLabelText(/Slot name/)).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onSubmit.mock.calls[0]![0]).not.toHaveProperty('slots');
    // No pin, unchanged: left out, so an older event without one still saves.
    expect(onSubmit.mock.calls[0]![0]).not.toHaveProperty('venueLocation');
  });

  it('blocks capacity below active registrations', async () => {
    const onSubmit = vi.fn();
    render(
      <EventForm
        mode="edit"
        minCapacity={10}
        initialValues={{
          title: 'Meetup',
          description: 'About it',
          category: 'MEETUP',
          startsAtLocal: '2030-09-03T18:00',
          timeZone: 'UTC',
          venue: 'Hall',
          capacity: 20
        }}
        onSubmit={onSubmit}
      />
    );
    const capacity = screen.getByLabelText(/Maximum capacity/);

    await userEvent.clear(capacity);
    await userEvent.type(capacity, '5');
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(
      screen.getByText(
        'Must be at least 10, the number of active registrations.'
      )
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows server field errors', () => {
    render(
      <EventForm
        mode="create"
        onSubmit={vi.fn()}
        serverErrors={{ startsAtLocal: 'Start time must be in the future.' }}
      />
    );

    expect(
      screen.getByLabelText(/Start date and time/)
    ).toHaveAccessibleDescription(/Start time must be in the future/);
  });

  it('schedules the go-live time and ends the listing early', async () => {
    const onSubmit = vi.fn();
    render(<EventForm mode="create" onSubmit={onSubmit} cities={cities} />);
    await fill();

    await chooseOption(
      screen.getByRole('combobox', { name: 'Goes live' }),
      'At a set time'
    );
    await userEvent.type(
      screen.getByLabelText(/Go-live date and time/),
      '2030-09-01T10:00'
    );
    await chooseOption(
      screen.getByRole('combobox', { name: 'Listing ends' }),
      'At an earlier time'
    );
    await userEvent.type(
      screen.getByLabelText(/Listing end date and time/),
      '2030-09-04T10:00'
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Schedule event' })
    );
    expect(
      screen.getByText('The listing must end no later than the event start.')
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    const ends = screen.getByLabelText(/Listing end date and time/);
    await userEvent.clear(ends);
    await userEvent.type(ends, '2030-09-03T12:00');
    await userEvent.click(
      screen.getByRole('button', { name: 'Schedule event' })
    );
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        publishAtLocal: '2030-09-01T10:00',
        expiresAtLocal: '2030-09-03T12:00'
      }),
      'publish'
    );
  });

  it('locks the go-live time of a live event and leaves it out of the save', async () => {
    const onSubmit = vi.fn();
    render(
      <EventForm
        mode="edit"
        initialValues={{
          title: 'Meetup',
          description: 'About it',
          category: 'MEETUP',
          startsAtLocal: '2030-09-03T18:00',
          timeZone: 'UTC',
          venue: 'Hall',
          city: { id: 'kochi', name: 'Kochi' },
          capacity: 20,
          phase: 'LIVE',
          expiresAtLocal: '2030-09-02T18:00'
        }}
        onSubmit={onSubmit}
        cities={cities}
      />
    );

    expect(screen.getByRole('combobox', { name: 'Goes live' })).toBeDisabled();
    expect(
      screen.getByText(/Unpublish the event to change this/)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Listing end date and time/)).toHaveValue(
      '2030-09-02T18:00'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    const [input] = onSubmit.mock.calls[0]!;
    expect(input).not.toHaveProperty('publishAtLocal');
    expect(input.expiresAtLocal).toBe('2030-09-02T18:00');
  });
});
