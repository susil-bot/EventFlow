import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { StateView } from './StateView';

describe('<StateView />', () => {
  it('shows a loading status instead of content', () => {
    render(
      <StateView isLoading loadingLabel="Loading events">
        <p>content</p>
      </StateView>
    );

    expect(screen.getByRole('status')).toHaveTextContent('Loading events');
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('shows the error message and retries', async () => {
    const onRetry = vi.fn();
    render(<StateView error={new Error('Server down')} onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Server down');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('hides retry for errors a retry cannot fix', () => {
    const forbidden = Object.assign(new Error('Not yours'), { status: 403 });
    render(
      <StateView
        error={forbidden}
        onRetry={vi.fn()}
        errorAction={<a href="/organizer">Back to dashboard</a>}
      />
    );

    expect(
      screen.queryByRole('button', { name: 'Try again' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to dashboard' })
    ).toBeInTheDocument();
  });

  it('shows the empty state', () => {
    render(<StateView isEmpty emptyTitle="No upcoming events" />);

    expect(screen.getByText('No upcoming events')).toBeInTheDocument();
  });

  it('renders children when there is data', () => {
    render(
      <StateView>
        <p>content</p>
      </StateView>
    );

    expect(screen.getByText('content')).toBeInTheDocument();
  });
});
