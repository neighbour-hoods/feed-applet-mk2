import { html } from 'lit';
import { state, property } from 'lit/decorators.js';
import {
  ActionHash,
  Record,
  AppAgentClient,
} from '@holochain/client';
import { consume } from '@lit-labs/context';
import { decode } from '@msgpack/msgpack';

import { clientContext, feedStoreContext } from '../../contexts';
import { Post } from '../posts/types';
import { FeedStore } from '../../feed-store';
import { EntryRecord } from '@holochain-open-dev/utils';
import { NHButton } from '../components/button';
import { NHComponent } from 'neighbourhoods-design-system-components';
import NHCreatePost from './create-post';

export class EditPost extends NHComponent {
  @consume({ context: clientContext })
  client!: AppAgentClient;
  
  @consume({ context: feedStoreContext })
  @property()
  feedStore!: FeedStore;

  @property({
    hasChanged: (newVal: ActionHash, oldVal: ActionHash) =>
      newVal?.toString() !== oldVal?.toString(),
  })
  originalPostHash!: ActionHash;

  @property()
  currentRecord!: Record;

  get currentPost() {
    return decode((this.currentRecord.entry as any).Present.entry) as Post;
  }

  @state()
  _text!: string;

  isPostValid() {
    return true && this._text !== '';
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.currentRecord === undefined) {
      throw new Error(
        `The currentRecord property is required for the edit-post element`
      );
    }

    if (this.originalPostHash === undefined) {
      throw new Error(
        `The originalPostHash property is required for the edit-post element`
      );
    }

    this._text = this.currentPost.text;
  }

  async updatePost() {
    const post: Post = {
      text: this._text!,
    };

    try {
      const payload = {
        original_post_hash: this.originalPostHash,
        previous_post_hash: this.currentRecord.signed_action.hashed.hash,
        updated_post: post,
      }
      const updateRecord: EntryRecord<Post> = await this.feedStore.updatePost(payload)

      this.dispatchEvent(
        new CustomEvent('post-updated', {
          composed: true,
          bubbles: true,
          detail: {
            originalPostHash: this.originalPostHash,
            previousPostHash: this.currentRecord.signed_action.hashed.hash,
            updatedPostHash: updateRecord.actionHash,
          },
        })
      );
    } catch (e: any) {
      console.log('update post error', e);
      const errorSnackbar = this.shadowRoot?.getElementById(
        'update-error'
      ) as any;
      errorSnackbar.labelText = `Error updating the post: ${e.data.data}`;
      errorSnackbar.show();
    }
  }

  render() {
    return html`
      <nh-create-post
        .prompt=${'Edit your post'}
        .textAreaValue=${this._text}
        .onChangeValue=${(e: CustomEvent) => {
          this._text = (e.target as any).value;
        }}
        style="width: 100%;"
      >
        <div
          slot="footer"
          class="action-buttons"
          style="display: flex; gap: 2px; flex-direction: row;"
        >
          <nh-applet-button
            .clickHandler=${() =>
              this.dispatchEvent(
                new CustomEvent('edit-canceled', {
                  bubbles: true,
                  composed: true,
                })
              )}
            .size=${'md'}
            .label=${'Cancel'}
            .variant=${'secondary'}
            .disabled=${false}
          ></nh-applet-button>
          <nh-applet-button
            .clickHandler=${() => {
              try {
                this.updatePost();
                this._text = '';
                this.dispatchEvent(
                  new CustomEvent('edit-canceled', {
                    bubbles: true,
                    composed: true,
                  })
                );
              } catch (error) {}
            }}
            .size=${'md'}
            .label=${'Save'}
            .variant=${'primary'}
            .disabled=${!this.isPostValid()}
          ></nh-applet-button>
        </div>
      </nh-create-post>
    `;
  }
  static get elementDefinitions() {
    return {
      'nh-applet-button': NHButton,
      'nh-create-post': NHCreatePost,
    };
  }

}
