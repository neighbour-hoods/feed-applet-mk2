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

import { clientContext, feedStoreContext } from '../../contexts';
import { Post } from '../posts/types';
import { FeedStore } from '../../feed-store';
import { NHComponent } from 'neighbourhoods-design-system-components';
import { editIcon, pearImg, trashIcon } from '../components/b64images';
import { NHButton } from '../components/button';
import { NHCard } from '../components/card';
import { EditPost } from './edit-post';
import NHPostCard from '../components/post-card';

export class PostDetailWidget extends NHComponent {
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
      <nh-post-card
        .title=${post.title}
        .textContent=${post.text_content}
        .tags=${post.hash_tags}
        .imageContent=${post.image_content}
        .assessmentIcon=${pearImg}
      >
        <div class="action-buttons" slot="context-menu" style="display: flex; gap: 2px; flex-direction: column;">
          <nh-applet-button .variant=${'primary'} .size=${'icon'} .iconImageB64=${editIcon} .clickHandler=${() => {
        this._editing = true;
      }}>Edit</nh-applet-button>
          <nh-applet-button .variant=${'danger'} .size=${'icon'} .iconImageB64=${trashIcon} .clickHandler=${() => {
        this.deletePost();
      }}>Delete</nh-applet-button>
        </div>
      </nh-post-card>
    `;
  }

  renderPost(maybeRecord: Record | undefined) {
    if (!maybeRecord) return html`<span>No record found</span>`;

    if (this._editing) {
      return html`<edit-post-widget
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
      ></edit-post-widget>`;
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
      'nh-applet-button': NHButton,
      'nh-post-card': NHPostCard,
      'edit-post-widget': EditPost,
    };
  }

}
