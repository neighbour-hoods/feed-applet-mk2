import {
  ActionHash,
  SignedActionHashed,
  EntryHash,
  Create,
  Update,
  Delete,
  CreateLink,
  DeleteLink,
} from '@holochain/client';
import { Assessment } from '@neighbourhoods/sensemaker-lite-types';

export type PostsSignal =
  | {
      type: 'EntryCreated';
      action: SignedActionHashed<Create>;
      app_entry: EntryTypes;
    }
  | {
      type: 'EntryUpdated';
      action: SignedActionHashed<Update>;
      app_entry: EntryTypes;
      original_app_entry: EntryTypes;
    }
  | {
      type: 'EntryDeleted';
      action: SignedActionHashed<Delete>;
      original_app_entry: EntryTypes;
    }
  | {
      type: 'LinkCreated';
      action: SignedActionHashed<CreateLink>;
      link_type: string;
    }
  | {
      type: 'LinkDeleted';
      action: SignedActionHashed<DeleteLink>;
      link_type: string;
    };

export type EntryTypes = { type: 'Post' } & Post;

export interface WrappedEntry<T> {
  action_hash: ActionHash;
  entry_hash: EntryHash;
  entry: T;
}
// defining a new type for including an assessment with the task
export type WrappedPostWithAssessment = WrappedEntry<Post> & {
  assessments: Assessment | undefined;
};

export interface AppletConfig {
  dimensions: {
    [dimensionName: string]: EntryHash;
  };
  methods: {
    [methodName: string]: EntryHash;
  };
  contexts: {
    [contextName: string]: EntryHash;
  };
  contextResults: {
    [contextName: string]: Array<WrappedPostWithAssessment>;
  };
}

export interface Post { 
  title: string;

  text_content: string;

  image_content: string;

  hash_tags: Array<string>;
}


