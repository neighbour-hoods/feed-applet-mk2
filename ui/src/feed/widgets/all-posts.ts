import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { AppAgentClient, EntryHash, ActionHash, encodeHashToBase64 } from '@holochain/client';
import { StoreSubscriber, TaskSubscriber } from '@holochain-open-dev/stores';
import { consume } from '@lit-labs/context';

import { clientContext, feedStoreContext } from '../../contexts';
import { PostsSignal } from '../types';

import './post-detail';
import { FeedStore } from '../../feed-store';
import {
  SensemakerStore,
  sensemakerStoreContext,
} from '@neighbourhoods/client';
import { get } from 'svelte/store';
import { SensemakeResource } from '../../sensemaker/sensemake-resource';
import { NHComponent } from 'neighbourhoods-design-system-components';
import '../components/assessment-widget';

@customElement('all-posts-widget')
export class AllPosts extends NHComponent {
  @consume({ context: clientContext })
  client!: AppAgentClient;

  @consume({ context: feedStoreContext })
  @property()
  feedStore!: FeedStore;

  @consume({ context: sensemakerStoreContext })
  @property()
  sensemakerStore!: SensemakerStore;

  activeMethod = new StoreSubscriber(this, () => this.sensemakerStore.activeMethod());

  @state()
  signaledHashes: Array<ActionHash> = [];

  _allPostsForAssessment = new StoreSubscriber(this, () => {
    return this.feedStore?.allPostsForAssessment;
  });
  _fetchPosts = new StoreSubscriber(this, () => {
    return this.feedStore?.allPosts;
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
    return html`
      <div
        class="posts-container"
        style="display: flex; flex-direction: column; gap: calc(1px * var(--nh-spacing-sm))"
      >
        ${hashes.reverse().map(
          ([entryHash, actionHash]) =>
            {
              let value = 0;
              return html`
              <post-detail .postHash=${actionHash}>
              
                <nh-assessment-widget
                  @assessment-value=${(e: CustomEvent) => { value = (e as any).assessmentValue }}
                  .assessmentCount=${value}
                  slot="footer" .name=${'ok'} .iconAlt=${""} .iconImg=${""}>
                  <sensemake-resource
                    slot="icon"
                    style="z-index: 1; position: relative;"
                    .resourceEh=${entryHash}
                    .resourceDefEh=${get(this.sensemakerStore.appletConfig())
                      .resource_defs['post_item']}
                  >
                  </nh-assessment-widget>
                  </sensemake-resource>
              </post-detail>
            `}
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

  static get elementDefinitions() {
    return {
      'sensemake-resource': SensemakeResource,
    };
  }
}
