import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { AppAgentClient, AgentPubKey, EntryHash, ActionHash, Record, NewEntryAction } from '@holochain/client';
import { consume } from '@lit-labs/context';
import { Task } from '@lit-labs/task';
// import '@material/mwc-circular-progress';

import { clientContext, feedStoreContext } from '../../contexts';
import { PostsSignal } from './types';

import './post-detail';
import { FeedStore } from '../../feed-store';
import { SensemakerStore, sensemakerStoreContext } from '@neighbourhoods/client';
import { get } from 'svelte/store';
import { SensemakeResource } from '../../sensemaker/sensemake-resource';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { StoreSubscriber } from 'lit-svelte-stores';
import { PostDetail } from './post-detail';

// @customElement('all-posts')
// export class AllPosts extends LitElement {
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
  
  _fetchPosts = new Task(this, ([]) => this.feedStore.fetchAllPosts() , () => []);
  allPosts = new StoreSubscriber(this, () => this.feedStore.allPosts());

  firstUpdated() {
    this.client.on('signal', signal => {
      if (signal.zome_name !== 'posts') return; 
      const payload = signal.payload as PostsSignal;
      if (payload.type !== 'EntryCreated') return;
      if (payload.app_entry.type !== 'Post') return;
      this.signaledHashes = [payload.action.hashed.hash, ...this.signaledHashes];
    });
  }
  
  renderList(hashes: [EntryHash, ActionHash][]) {
    if (hashes.length === 0) return html`<span>No posts found.</span>`;
    
    return html`
      <div style="display: flex; flex-direction: column">
        ${hashes.map(([entryHash, actionHash]) => 
          html`
            <sensemake-resource
              .resourceEh=${entryHash} 
              .resourceDefEh=${get(this.sensemakerStore.appletConfig()).resource_defs["post_item"]}
            >
              <post-detail .postHash=${actionHash} style="margin-bottom: 16px;" @post-deleted=${() => { this._fetchPosts.run(); this.signaledHashes = []; } }></post-detail>
            </sensemake-resource>
            `
          // html`
          //     <div>${entryHash}</div>
          //     <post-detail .postHash=${actionHash} style="margin-bottom: 16px;" @post-deleted=${() => { this._fetchPosts.run(); this.signaledHashes = []; } }></post-detail>
          //   `
        )}
      </div>
    `;
  }

  render() {
    // return this._fetchPosts.render({
    //   pending: () => html`<div style="display: flex; flex: 1; align-items: center; justify-content: center">
    //     <mwc-circular-progress indeterminate></mwc-circular-progress>
    //   </div>`,
    //   // complete: (records) => {console.log('complete task', records); return this.renderList([...this.signaledHashes, ...records.map(r => r.signed_action.hashed.hash)])},
    //   complete: (records) => {console.log('complete task', records); return this.renderList(records.map(r => [(r.signed_action.hashed.content as {entry_hash: EntryHash}).entry_hash as EntryHash, r.signed_action.hashed.hash]))},
    //   error: (e: any) => html`<span>Error fetching the posts: ${e.data.data}.</span>`
    // });
    const allPosts = this.allPosts.value;
    return this.renderList(allPosts.map(r => [(r.signed_action.hashed.content as {entry_hash: EntryHash}).entry_hash as EntryHash, r.signed_action.hashed.hash]));
  }
  static get scopedElements() {
    return {
      'sensemake-resource': SensemakeResource,
      'post-detail': PostDetail,
    };
  }
}
