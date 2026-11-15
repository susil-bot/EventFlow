import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { SocialLinksField } from './SocialLinksField';

describe('<SocialLinksField />', () => {
  it('adds a link for the next unused platform', async () => {
    const onChange = vi.fn();
    render(
      <SocialLinksField
        links={[{ platform: 'WEBSITE', url: 'https://example.com' }]}
        onChange={onChange}
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: /Add social link/ })
    );

    expect(onChange).toHaveBeenCalledWith([
      { platform: 'WEBSITE', url: 'https://example.com' },
      { platform: 'X', url: '' }
    ]);
  });

  it('shows the API error under the matching link', () => {
    render(
      <SocialLinksField
        links={[{ platform: 'LINKEDIN', url: 'https://evil.example' }]}
        onChange={vi.fn()}
        errors={{
          'socialLinks.0.url': "This link doesn't match the selected platform."
        }}
      />
    );

    expect(screen.getByLabelText('LinkedIn link')).toHaveAccessibleDescription(
      "This link doesn't match the selected platform."
    );
  });
});
