import { LitElement, html } from 'lit';
import { state, customElement } from 'lit/decorators.js';
import { AppAgentClient } from '@holochain/client';
import { consume } from '@lit-labs/context';

import { EntryRecord } from '@holochain-open-dev/utils';
import { clientContext, feedStoreContext } from '../../contexts';
import { Post } from './types';
import { FeedStore } from '../../feed-store';
import '../components/create-post';
import '../components/button';

@customElement('create-post')
export class CreatePost extends LitElement {
  @consume({ context: clientContext })
  client!: AppAgentClient;

  @consume({ context: feedStoreContext, subscribe: true })
  feedStore!: FeedStore;

  @state()
  _text: string = '';

  isPostValid() {
    return true && this._text !== '';
  }

  async createPost() {
    const post: Post = {
      text: this._text,
    };
    try {
      const record: EntryRecord<Post> = await this.feedStore.service.createPost(
        post
      );

      this.dispatchEvent(
        new CustomEvent('post-created', {
          composed: true,
          bubbles: true,
          detail: {
            postHash: record.actionHash,
          },
        })
      );
    } catch (e: any) {
      const errorSnackbar = this.shadowRoot?.getElementById(
        'create-error'
      ) as any;
      errorSnackbar.labelText = `Error creating the post: ${e.data.data}`;
      errorSnackbar.show();
    }
  }

  render() {
    return html`
      <nh-create-post
        .prompt=${"What's on your mind?"}
        .placeholder=${'Type something...'}
      >
        <nh-button
          slot="footer"
          .size=${'md'}
          .label=${'Post'}
          .variant=${'primary'}
          .onClick=${this.createPost()}
        ></nh-button>
      </nh-create-post>
    `;
  }
}

// <mwc-textarea outlined label="Text" .value=${ this._text } @input=${(e: CustomEvent) => { this._text = (e.target as any).value;} } required></mwc-textarea>
// .disabled=${!this.isPostValid()}
// @click=${() => this.createPost()}
