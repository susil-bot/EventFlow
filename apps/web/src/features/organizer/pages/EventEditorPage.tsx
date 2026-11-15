import React from 'react';
import { useParams } from 'react-router';
import { CreateEventPage } from './editor/CreateEventPage';
import { EditEventPage } from './editor/EditEventPage';

/** `/organizer/events/new`, `/organizer/events/:id/edit`, `/admin/events/:id/edit`. */
export const EventEditorPage = () => {
  const { id } = useParams();
  return id ? <EditEventPage id={id} /> : <CreateEventPage />;
};
