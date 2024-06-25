import { CSSResult, css, html } from 'lit';
import { state, property } from 'lit/decorators.js';
import {
  EntryHash,
  ActionHash,
} from '@holochain/client';
import { StoreSubscriber} from '@holochain-open-dev/stores';

import { Post, PostsSignal } from '../types';
import { FeedStore } from '../../feed-store';
import {
  AppletConfig,
  SensemakerStore,
} from '@neighbourhoods/client';
import { NHComponent } from '@neighbourhoods/design-system-components';
import { EntryRecord } from '@holochain-open-dev/utils';
import { Task } from '@lit/task';
import { PostDetailWidget } from './post-detail';
import { SlSpinner } from '@scoped-elements/shoelace';

export class AllPosts extends NHComponent {
  @property() feedStore!: FeedStore;
  @property() sensemakerStore!: SensemakerStore;
  @property() config!: AppletConfig;

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
    this?.feedStore.service.client && this.feedStore.service.client.on('signal', signal => {
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
              <post-detail-widget .feedStore=${this.feedStore} .sensemakerStore=${this.sensemakerStore} .config=${this.config} .postHash=${actionHash} .postEh=${entryHash}>
              </post-detail-widget>
            `;
        })}
      </div>
    `;
  }
  render() {
    switch (this._allPostsForAssessment.value.status) {
      case 'pending':
        return html`<sl-spinner class="icon-spinner"></sl-spinner>`;
      case 'complete':
        return this.renderList(this._allPostsForAssessment.value.value as any);
      case 'error':
        return html`<p>"Error!</p>`;
    }
  }

  static elementDefinitions = {
      'post-detail-widget': PostDetailWidget,
      "sl-spinner": SlSpinner
  }

  static styles: CSSResult[] = [
    super.styles as CSSResult,
    css`
      .icon-spinner {
        font-size: 2.1rem;
        --speed: 10000ms;
        --track-width: 4px;
        --indicator-color: var(--nh-theme-accent-emphasis);
        margin: 3px
      }
    `
  ];
}
