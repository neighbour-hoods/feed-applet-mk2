import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { EntryHash, Record, ActionHash, AppAgentClient, DnaHash } from '@holochain/client';
import { consume } from '@lit-labs/context';
import { Task } from '@lit-labs/task';
import { decode } from '@msgpack/msgpack';

import './edit-post';
import '../components/card';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';

import { clientContext, feedStoreContext } from '../../contexts';
import { Post } from '../types';
import { FeedStore } from '../../feed-store';
import { NHComponent } from 'neighbourhoods-design-system-components';

@customElement('post-detail')
export class PostDetail extends NHComponent {
  @consume({ context: clientContext })
  client!: AppAgentClient;

  @consume({ context: feedStoreContext })
  @property()
  feedStore!: FeedStore;

  @property({
    hasChanged: (newVal: ActionHash, oldVal: ActionHash) => newVal?.toString() !== oldVal?.toString()
  })
  postHash!: ActionHash;

  @property()
  post!: Post; 

  _fetchRecord = new Task(this, ([postHash]) => this.feedStore.service.fetchPost(postHash), () => [this.postHash]);

  @state()
  _editing = false;
  
  firstUpdated() {
    if (this.postHash === undefined) {
      throw new Error(`The postHash property is required for the post-detail element`);
    }
  }

  async deletePost() {
    try {
      await this.client.callZome({
        cap_secret: null,
        role_name: 'feed_applet',
        zome_name: 'posts',
        fn_name: 'delete_post',
        payload: this.postHash,
      });
      this.dispatchEvent(new CustomEvent('post-deleted', {
        bubbles: true,
        composed: true,
        detail: {
          postHash: this.postHash
        }
      }));
      this._fetchRecord.run();
    } catch (e: any) {
      const errorSnackbar = this.shadowRoot?.getElementById('delete-error') as any;
      errorSnackbar.labelText = `Error deleting the post: ${e.data.data}`;
      errorSnackbar.show();
    }
  }

  renderDetail(record: Record) {
    const post = decode((record.entry as any).Present.entry) as Post;

    return html`
      <nh-applet-card
      .theme=${"dark"}
      .heading=${"A post"}
      .hasContextMenu=${true}
      .hasPrimaryAction=${false}
      .textSize=${"sm"}
      .footerAlign=${"r"}
    >
      ${post.text}
      <slot slot="footer" name="footer"></slot>
    </nh-applet-card>

      <div style="display: flex; flex-direction: column">
      	<div style="display: flex; flex-direction: row">
          <mwc-icon-button style="margin-left: 8px" icon="edit" @click=${() => { this._editing = true; } }></mwc-icon-button>
          <mwc-icon-button style="margin-left: 8px" icon="delete" @click=${() => this.deletePost()}></mwc-icon-button>
          <mwc-icon-button-toggle style="margin-left: 8px" onIcon="favorite" offIcon="favorite_border"></mwc-icon-button-toggle>
          <mwc-icon-button-toggle style="margin-left: 8px" onIcon="heart_broken" offIcon="heart_broken_outlined"></mwc-icon-button-toggle>
        </div>


      </div>
    `;
  }
  
  renderPost(maybeRecord: Record | undefined) {
    if (!maybeRecord) return html`<span>The requested post was not found.</span>`;
    
    if (this._editing) {
    	return html`<edit-post
    	  .originalPostHash=${this.postHash}
    	  .currentRecord=${maybeRecord}
    	  @post-updated=${async () => {
    	    this._editing = false;
    	    await this._fetchRecord.run();
    	  } }
    	  @edit-canceled=${() => { this._editing = false; } }
    	  style="display: flex; flex: 1;"
    	></edit-post>`;
    }

    return this.renderDetail(maybeRecord);
  }

  render() {
    return this._fetchRecord.render({
      pending: () => html`<div style="display: flex; flex: 1; align-items: center; justify-content: center">
        <sl-spinner></sl-spinner>
      </div>`,
      complete: (maybeRecord) => this.renderPost(maybeRecord?.record),
      error: (e: any) => html`<span>Error fetching the post: ${e.data.data}</span>`
    });
  }
}
