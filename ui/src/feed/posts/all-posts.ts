import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import {
  AppAgentClient,
  AgentPubKey,
  EntryHash,
  ActionHash,
  Record,
  NewEntryAction,
} from '@holochain/client';
import { StoreSubscriber } from '@holochain-open-dev/stores';
import { consume } from '@lit-labs/context';

import { ScopedElementsMixin } from '@open-wc/scoped-elements';

import { clientContext, feedStoreContext } from '../../contexts';
import { PostsSignal } from './types';

import './post-detail';
import { FeedStore } from '../../feed-store';
import {
  SensemakerStore,
  sensemakerStoreContext,
} from '@neighbourhoods/client';
import { get } from 'svelte/store';
import { SensemakeResource } from '../../sensemaker/sensemake-resource';

@customElement('all-posts')
export class AllPosts extends ScopedElementsMixin(LitElement) {
  @consume({ context: clientContext })
  client!: AppAgentClient;

  @consume({ context: feedStoreContext })
  @property()
  feedStore!: FeedStore;

  @consume({ context: sensemakerStoreContext })
  @property()
  sensemakerStore!: SensemakerStore;

  @state()
  signaledHashes: Array<ActionHash> = [];

  _allPostsForAssessment = new StoreSubscriber(this, () => {
    console.log('get(this.feedStore?.allPostsForAssessment) :>> ', get(this.feedStore?.allPostsForAssessment));
    return this.feedStore?.allPostsForAssessment;
  });

  async firstUpdated() {
    this.client.on('signal', signal => {
      if (signal.zome_name !== 'posts') return;
      const payload = signal.payload as PostsSignal;
      if (payload.type !== 'EntryCreated') return;
      if (payload.app_entry.type !== 'Post') return;
      this.signaledHashes = [
        payload.action.hashed.hash,
        ...this.signaledHashes,
      ];
    });
  }

  renderList(hashes: [EntryHash, ActionHash][]) {
    if (hashes.length === 0) return html`<span>No posts found.</span>`;
console.log('hashes :>> ', hashes);
    return html`
      <div style="display: flex; flex-direction: column">
        ${hashes.map(
          ([entryHash, actionHash]) =>
            html`
              <sensemake-resource
                .resourceEh=${entryHash}
                .resourceDefEh=${get(this.sensemakerStore.appletConfig())
                  .resource_defs['post_item']}
              >
                <post-detail
                  .postHash=${actionHash}
                  style="margin-bottom: 16px;"
                  @post-deleted=${() => {
                    // this._fetchPosts.run();
                    this.signaledHashes = [];
                  }}
                ></post-detail>
              </sensemake-resource>
            `
        )}
      </div>
    `;
  }

  render() {
    switch (this._allPostsForAssessment.value.status) {
      case 'pending':
        return html`<div
          style="display: flex; flex: 1; align-items: center; justify-content: center"
        >
          Loading!
        </div>`;
      case 'complete':
        return this.renderList(this._allPostsForAssessment.value.value as any);
      case 'error':
        return html`<div>"Error fetching the posts"</div>`;
    }
  }

  static get scopedElements() {
    return {
      'sensemake-resource': SensemakeResource,
    };
  }
}
