import { createContext } from '@lit-labs/context';
import { AppAgentClient } from '@holochain/client';
import { FeedStore } from './feed-store';

export const clientContext = createContext<AppAgentClient>('appAgentClient');

export const feedStoreContext = createContext<FeedStore>(
    'todo-store-context'
);