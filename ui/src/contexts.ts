import { createContext } from '@lit/context';
import { AdminWebsocket, AppAgentClient, AppWebsocket } from '@holochain/client';
import { FeedStore } from './feed-store';
import { SensemakerStore } from '@neighbourhoods/client';

export const clientContext = createContext<AppAgentClient>('appAgentClient');
export const appWebsocketContext = createContext<AppWebsocket>('appWebsocket');
export const adminWebsocketContext = createContext<AdminWebsocket>('adminWebsocket');
export const sensemakerStoreContext = createContext<SensemakerStore>(
    'sensemaker-store-context'
    );

export const feedStoreContext = createContext<FeedStore>(
  'feed-store-context'
);