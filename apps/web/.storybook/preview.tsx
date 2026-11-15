import '@fontsource/jost/400.css';
import '@fontsource/jost/500.css';
import '@fontsource/jost/600.css';
import '@fontsource/libre-caslon-display/400.css';
import type { Preview } from '@storybook/react-vite';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { GlobalStyle } from '../src/shared/styles/GlobalStyle';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    backgrounds: {
      options: { app: { name: 'App', value: '#f1f2f4' } }
    }
  },
  initialGlobals: { backgrounds: { value: 'app' } },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <GlobalStyle />
        <Story />
      </MemoryRouter>
    )
  ]
};

export default preview;
