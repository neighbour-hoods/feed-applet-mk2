import { html } from 'lit';
import { state, property } from 'lit/decorators.js';
import {
  AppAgentClient,
  EntryHash,
  ActionHash,
  encodeHashToBase64,
} from '@holochain/client';
import { StoreSubscriber} from '@holochain-open-dev/stores';
import { consume } from '@lit/context';

import { clientContext, feedStoreContext } from '../../contexts';
import { Post, PostsSignal } from '../posts/types';
import { FeedStore } from '../../feed-store';
import {
  SensemakerStore,
  sensemakerStoreContext,
} from '@neighbourhoods/client';
import { NHComponent } from '@neighbourhoods/design-system-components';
import { EntryRecord } from '@holochain-open-dev/utils';
import { Task } from '@lit/task';
import { PostDetailWidget } from './post-detail';

export class AllPosts extends NHComponent {
  @consume({ context: clientContext })
  client!: AppAgentClient;

  @consume({ context: feedStoreContext })
  @property()
  feedStore!: FeedStore;

  @consume({ context: sensemakerStoreContext })
  @property()
  sensemakerStore!: SensemakerStore;

  activeMethod = new StoreSubscriber(this, () =>
    this.sensemakerStore.activeMethod()
  );

  @state()
  signaledHashes: Array<ActionHash> = [];

  _allPostsForAssessment = new StoreSubscriber(this, () => {
    return this.feedStore?.allPostsForAssessment;
  });
  _fetchPosts = new Task(this, ([]) => this.feedStore.fetchAllPosts() as Promise<Array<EntryRecord<Post>>>, () => []);

  async firstUpdated() {
    this?.client && this.client.on('signal', signal => {
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
        ${hashes.map(([entryHash, actionHash]) => {
          return html`
              <post-detail-widget .postHash=${actionHash} .postEh=${entryHash}>
                <nh-assessment-widget
                  @set-initial-assessment-value=${function (e: CustomEvent) {
                    let { assessmentValue, resourceEh } = (e as any).detail;
                    let myHash = encodeHashToBase64(
                      (e as any).currentTarget.parentElement.postEh
                    );
                    if (myHash === resourceEh) {
                      (e.currentTarget as any).assessmentCount =
                        assessmentValue;
                    }
                  }}
                  @update-assessment-value=${function (e: CustomEvent) {
                    let { assessmentValue, resourceEh } = (e as any).detail;
                    let myHash = encodeHashToBase64(
                      (e as any).currentTarget.parentElement.postEh
                    );
                    if (myHash === resourceEh) {
                      (e.currentTarget as any).assessmentCount +=
                        assessmentValue;
                    }
                  }}
                  slot="footer" .name=${'ok'} .iconAlt=${''} .iconImg=${''}>
                  </nh-assessment-widget>
              </post-detail-widget>
            `;
        })}
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
      'post-detail-widget': PostDetailWidget,
    };
  }
}
