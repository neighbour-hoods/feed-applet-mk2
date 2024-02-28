import { createContext } from '@lit/context';
import { FeedStore } from './feed-store';
import { SensemakerStore } from '@neighbourhoods/client';

export const sensemakerStoreContext = createContext<SensemakerStore>(
  'sensemaker-store-context'
);

export const feedStoreContext = createContext<FeedStore>(
  'feed-store-context'
);