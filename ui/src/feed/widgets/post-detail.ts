import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import {
  EntryHash,
  Record,
  ActionHash,
  AppAgentClient,
  DnaHash,
} from '@holochain/client';
import { consume } from '@lit-labs/context';
import { Task } from '@lit-labs/task';
import { decode } from '@msgpack/msgpack';

import './edit-post';

import { clientContext, feedStoreContext } from '../../contexts';
import { Post } from '../types';
import { FeedStore } from '../../feed-store';
import { NHComponent } from 'neighbourhoods-design-system-components';
import { editIcon, trashIcon } from '../components/b64images';
import { NHButton } from '../components/button';
import { NHCard } from '../components/card';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';

@customElement('post-detail')
export class PostDetail extends NHComponent {
  @consume({ context: clientContext })
  client!: AppAgentClient;

  @consume({ context: feedStoreContext })
  @property()
  feedStore!: FeedStore;

  @property({
    hasChanged: (newVal: ActionHash, oldVal: ActionHash) =>
      newVal?.toString() !== oldVal?.toString(),
  })
  postHash!: ActionHash;
  postEh!: EntryHash;

  @property()
  post!: Post;

  _fetchRecord = new Task(
    this,
    ([postHash]) => this.feedStore.service.fetchPost(postHash),
    () => [this.postHash]
  );

  @state()
  _editing = false;

  firstUpdated() {
    if (this.postHash === undefined) {
      throw new Error(
        `The postHash property is required for the post-detail element`
      );
    }
  }

  async deletePost() {
    try {
      await this.feedStore.service.deletePost(this.postHash);
      this.dispatchEvent(
        new CustomEvent('post-deleted', {
          bubbles: true,
          composed: true,
          detail: {
            postHash: this.postHash,
          },
        })
      );
      // this._fetchRecord.run();
    } catch (e: any) {
      const errorSnackbar = this.shadowRoot?.getElementById(
        'delete-error'
      ) as any;
      errorSnackbar.labelText = `Error deleting the post: ${e.data.data}`;
      errorSnackbar.show();
    }
  }

  renderDetail(record: Record) {
    const post = decode((record.entry as any).Present.entry) as Post;

    return html`
      <nh-applet-card
      .theme=${'dark'}
      .heading=${'A post'}
      .hasContextMenu=${true}
      .hasPrimaryAction=${false}
      .textSize=${'md'}
      .footerAlign=${'l'}
    >
      ${post.text}
      <div class="action-buttons" slot="context-menu" style="display: flex; gap: 2px; flex-direction: column;">
        <nh-button-applet .variant=${'primary'} .size=${'icon'} .iconImageB64=${editIcon} .clickHandler=${() => {
      this._editing = true;
    }}>Edit</nh-button-applet>
        <nh-button-applet .variant=${'danger'} .size=${'icon'} .iconImageB64=${trashIcon} .clickHandler=${() => {
      this.deletePost();
    }}>Delete</nh-button-applet>
      </div>
      <slot slot="footer" name="footer"></slot>
    </nh-applet-card>
    `;
  }

  renderPost(maybeRecord: Record | undefined) {
    if (!maybeRecord) return html`<span></span>`;

    if (this._editing) {
      return html`<edit-post
        .originalPostHash=${this.postHash}
        .currentRecord=${maybeRecord}
        @post-updated=${async () => {
          this._editing = false;
          await this._fetchRecord.run();
        }}
        @edit-canceled=${() => {
          this._editing = false;
        }}
        style="display: flex; flex: 1;"
      ></edit-post>`;
    }

    return this.renderDetail(maybeRecord);
  }

  render() {
    return this._fetchRecord.render({
      pending: () => html`<div
        style="display: flex; flex: 1; align-items: center; justify-content: center"
      >
        Loading...
      </div>`,
      complete: maybeRecord => this.renderPost(maybeRecord?.record),
      error: (e: any) =>
        html`<span>Error fetching the post: ${e.data.data}</span>`,
    });
  }
  static get elementDefinitions() {
    return {
      'nh-button-applet': NHButton,
      'nh-applet-card': NHCard,
    };
  }

}
