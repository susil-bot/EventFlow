import { apiRequest, apiUpload } from './client';
import type {
  AttendeeDto,
  CreateEventInput,
  EventDto,
  EventImage,
  EventInput,
  AdminUser,
  AdminUserFilters,
  AuditEntry,
  City,
  DiscoverFilterQuery,
  DiscoverQuery,
  EventFacets,
  EventStatus,
  Page,
  PlatformStats,
  RegistrationDto,
  SignupRole,
  User
} from './types';

/** Builds `?a=1&b=2`, skipping empty values. */
const toQuery = (
  params: Record<string, string | number | boolean | string[] | undefined>
) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    const text = Array.isArray(value) ? value.join(',') : value;
    if (text !== undefined && text !== '') {
      search.set(key, String(text));
    }
  });
  const text = search.toString();
  return text ? `?${text}` : '';
};

export const authApi = {
  session: () => apiRequest<User | null>('/auth/session'),
  login: (body: { email: string; password: string }) =>
    apiRequest<User>('/auth/login', { method: 'POST', body }),
  signup: (body: {
    name: string;
    email: string;
    password: string;
    role: SignupRole;
  }) => apiRequest<User>('/auth/signup', { method: 'POST', body }),
  logout: () => apiRequest<void>('/auth/logout', { method: 'POST' }),
  /** Saves (or clears with `null`) the signed-in user's home city. */
  setHomeCity: (cityId: string | null) =>
    apiRequest<User>('/auth/me/home-city', {
      method: 'PATCH',
      body: { cityId }
    })
};

export const citiesApi = {
  list: () => apiRequest<City[]>('/cities')
};

export const eventsApi = {
  /** Published upcoming events, filtered, sorted and paged by the API. */
  listPublic: (query: DiscoverQuery = {}) =>
    apiRequest<Page<EventDto>>(`/events${toQuery(query)}`),
  /** Events per category for the same filters (category filter ignored). */
  facets: (query: DiscoverFilterQuery = {}) =>
    apiRequest<EventFacets>(`/events/facets${toQuery(query)}`),
  /** Accepts the event id or its URL slug. */
  get: (idOrSlug: string) =>
    apiRequest<EventDto>(`/events/${encodeURIComponent(idOrSlug)}`),
  create: (body: CreateEventInput) =>
    apiRequest<EventDto>('/events', { method: 'POST', body }),
  update: (id: string, body: Partial<EventInput>) =>
    apiRequest<EventDto>(`/events/${id}`, { method: 'PATCH', body }),
  publish: (id: string) =>
    apiRequest<EventDto>(`/events/${id}/publish`, { method: 'POST' }),
  /** Back to draft (only while nobody has registered). */
  unpublish: (id: string) =>
    apiRequest<EventDto>(`/events/${id}/unpublish`, { method: 'POST' }),
  cancel: (id: string) =>
    apiRequest<EventDto>(`/events/${id}/cancel`, { method: 'POST' })
};

export const organizerApi = {
  listEvents: () => apiRequest<EventDto[]>('/organizer/events'),
  listAttendees: (id: string) =>
    apiRequest<{ event: EventDto; attendees: AttendeeDto[] }>(
      `/organizer/events/${id}/attendees`
    )
};

export const registrationsApi = {
  listMine: () => apiRequest<RegistrationDto[]>('/me/registrations'),
  register: (eventId: string, slotId?: string) =>
    apiRequest<RegistrationDto>(`/events/${eventId}/registrations`, {
      method: 'POST',
      body: slotId ? { slotId } : {}
    }),
  cancel: (registrationId: string) =>
    apiRequest<RegistrationDto>(`/registrations/${registrationId}/cancel`, {
      method: 'POST'
    })
};

export const uploadsApi = {
  uploadImage: (file: File) => apiUpload<EventImage>('/uploads/images', file)
};

export const adminApi = {
  stats: () => apiRequest<PlatformStats>('/admin/stats'),
  listUsers: (filters: AdminUserFilters = {}) =>
    apiRequest<Page<AdminUser>>(`/admin/users${toQuery(filters)}`),
  approve: (userId: string) =>
    apiRequest<AdminUser>(`/admin/users/${userId}/approve`, { method: 'POST' }),
  suspend: (userId: string, reason: string) =>
    apiRequest<AdminUser>(`/admin/users/${userId}/suspend`, {
      method: 'POST',
      body: { reason }
    }),
  reactivate: (userId: string) =>
    apiRequest<AdminUser>(`/admin/users/${userId}/reactivate`, {
      method: 'POST'
    }),
  changeRole: (userId: string, role: SignupRole) =>
    apiRequest<AdminUser>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: { role }
    }),
  listEvents: (status?: EventStatus) =>
    apiRequest<EventDto[]>(`/admin/events${toQuery({ status })}`),
  cancelEvent: (eventId: string, reason: string) =>
    apiRequest<EventDto>(`/admin/events/${eventId}/cancel`, {
      method: 'POST',
      body: { reason }
    }),
  auditLog: (limit = 50) =>
    apiRequest<AuditEntry[]>(`/admin/audit-log${toQuery({ limit })}`)
};
