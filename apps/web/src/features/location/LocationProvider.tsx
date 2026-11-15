import { useQueryClient } from '@tanstack/react-query';
import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';
import { authApi } from '@/shared/api/endpoints';
import type { User } from '@/shared/api/types';
import { SESSION_QUERY_KEY, useAuth } from '@/app/providers/AuthProvider';

/**
 * The city Discover is filtered by. `null` means "all cities". `hasChosen`
 * is false until the visitor picks (or dismisses) the city picker once.
 * `isReady` turns true once the session is known, so a signed-in user's
 * saved city can apply before anyone is asked.
 */
type LocationContextValue = {
  cityId: string | null;
  hasChosen: boolean;
  isReady: boolean;
  chooseCity: (cityId: string | null) => void;
  /** The city picker dialog (rendered once, by the site layout). */
  isPickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export const LOCATION_STORAGE_KEY = 'eventflow.location';

type Stored = { cityId: string | null };

const readStored = (): Stored | null => {
  try {
    const raw = window.localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<Stored>;
    return typeof parsed.cityId === 'string' || parsed.cityId === null
      ? { cityId: parsed.cityId }
      : null;
  } catch {
    // Private mode or corrupted value: behave like a first visit.
    return null;
  }
};

const writeStored = (value: Stored) => {
  try {
    window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage unavailable; the choice still applies for this session.
  }
};

/**
 * Remembers the chosen city in the browser and, for signed-in users, on
 * their profile, so it follows them across devices. A saved home city is
 * used when this browser hasn't made a choice yet.
 */
export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [stored, setStored] = useState<Stored | null>(readStored);
  const [isPickerOpen, setPickerOpen] = useState(false);
  const openPicker = useCallback(() => setPickerOpen(true), []);
  const closePicker = useCallback(() => setPickerOpen(false), []);

  // A saved home city stands in until this browser makes its own choice.
  const homeCityId = user?.homeCityId ?? null;
  const hasChosen = stored !== null || homeCityId !== null;
  const cityId = stored ? stored.cityId : homeCityId;

  const userId = user?.id;
  const chooseCity = useCallback(
    (cityId: string | null) => {
      const next = { cityId };
      setStored(next);
      writeStored(next);
      if (userId) {
        authApi
          .setHomeCity(cityId)
          .then((updated) =>
            queryClient.setQueryData<User | null>(SESSION_QUERY_KEY, updated)
          )
          // Saving to the profile is a convenience; the local choice stands.
          .catch(() => undefined);
      }
    },
    [userId, queryClient]
  );

  const value = useMemo(
    () => ({
      cityId,
      hasChosen,
      isReady: !isLoading,
      chooseCity,
      isPickerOpen,
      openPicker,
      closePicker
    }),
    [
      cityId,
      hasChosen,
      isLoading,
      chooseCity,
      isPickerOpen,
      openPicker,
      closePicker
    ]
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationPreference = (): LocationContextValue => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error(
      'useLocationPreference must be used inside <LocationProvider>'
    );
  }
  return context;
};
