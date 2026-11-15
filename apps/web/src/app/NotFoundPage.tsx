import React from 'react';
import { LinkButton } from '@/shared/ui/button';
import { StateView } from '@/shared/ui/state-view';

export const NotFoundPage = () => (
  <StateView
    isEmpty
    emptyIcon="globe"
    emptyTitle="Page not found"
    emptyMessage="The page you're looking for doesn't exist or has moved."
    emptyAction={<LinkButton to="/">Back to events</LinkButton>}
  />
);
