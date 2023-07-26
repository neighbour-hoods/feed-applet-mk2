import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { LitElement, html } from 'lit';
import { state, customElement } from 'lit/decorators.js';
import { AppAgentClient } from '@holochain/client';
import { consume } from '@lit-labs/context';

import { EntryRecord } from '@holochain-open-dev/utils';
import { clientContext, feedStoreContext } from '../../contexts';
import { Post } from '../types';
import { FeedStore } from '../../feed-store';
import { NHCreatePost } from '../components/create-post';
import { NHButton } from '../components/button';
import { NHComponent } from 'neighbourhoods-design-system-components';

@customElement('create-post-widget')
export class CreatePost extends NHComponent {
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

  static get elementDefinitions() {
    return {
      'nh-create-post': NHCreatePost,
      'nh-applet-button': NHButton,
    };
  }

  render() {
    return html`
      <nh-create-post
        .prompt=${"What's on your mind?"}
        .placeholder=${'Type something...'}
        .textAreaValue=${this._text}
        .onChangeValue=${(e: CustomEvent) => { this._text = (e.target as any).value; }}
        >
        <nh-applet-button
          slot="footer"
          .clickHandler=${() => {this.createPost(); this._text = '';}}
          .size=${'md'}
          .label=${'Post'}
          .variant=${'primary'}
          .disabled=${!this.isPostValid()}
        ></nh-applet-button>
      </nh-create-post>
    `;
  }
}
