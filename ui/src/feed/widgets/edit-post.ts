import { PropertyValueMap, html } from 'lit';
import { state, property } from 'lit/decorators.js';
import {
  ActionHash,
  Record,
} from '@holochain/client';
import { decode } from '@msgpack/msgpack';

import { Post } from '../posts/types';
import { FeedStore } from '../../feed-store';
import { EntryRecord } from '@holochain-open-dev/utils';
import { NHComponent, NHButton, NHCard, NHButtonGroup } from '@neighbourhoods/design-system-components';
import NHCreatePost from './create-post';

export class EditPost extends NHComponent {
  @property() feedStore!: FeedStore;

  @property({
    hasChanged: (newVal: ActionHash, oldVal: ActionHash) =>
      newVal?.toString() !== oldVal?.toString(),
  })
  originalPostHash!: ActionHash;

  @state() _btn! : NHButton;
  
  @property() currentRecord!: Record;

  get currentPost() {
    return decode((this.currentRecord.entry as any).Present.entry) as Post;
  }

  @state()
  _post!: Post;

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

    this._post = this.currentPost;
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    const btnGroup = (this as any).renderRoot.querySelector("nh-button-group") as NHButtonGroup;
    this._btn = btnGroup.querySelector("nh-button[type='submit']") as NHButton;
  }

  async updatePost(model: object) {
      const payload = {
        original_post_hash: this.originalPostHash,
        previous_post_hash: this.currentRecord.signed_action.hashed.hash,
        updated_post: { ...model },
      }
      const updateRecord: EntryRecord<Post> = await this.feedStore.updatePost(payload)
      this.currentRecord = updateRecord.record
  }

  render() {
    return html`
      <nh-card
        class="nested-card"
        .theme=${"dark"}
        .heading=${""}
        .title=${""}
        .hasContextMenu=${true}
        .hasPrimaryAction=${false}
      >
        <nh-create-post
          .editMode=${true}
          .editPost=${this._post}
          .editConfirmBtn=${this._btn}
          .editSubmitOverload=${this.updatePost.bind(this)}
        >
        </nh-create-post>
        
        <nh-button-group
          slot="footer"
          class="action-buttons justify-right"
          style="display: flex; gap: 8px"
        >
          <div slot="buttons">
            <nh-button
              @click=${() =>
                this.dispatchEvent(
                  new CustomEvent('edit-canceled', {
                    bubbles: true,
                    composed: true,
                  })
                )}
              .variant=${'secondary'}
              .disabled=${false}
            >Cancel</nh-button>
            <nh-button
              type="submit"
              .variant=${'primary'}
            >Save</nh-button>
          </div>
        </nh-button-group>
      </nh-card>
    `;
  }

  static elementDefinitions = {
    'nh-button-group': NHButtonGroup,
    'nh-button': NHButton,
    'nh-card': NHCard,
    'nh-create-post': NHCreatePost,
  }
}
