import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { InstalledCell, ActionHash, Record, AgentPubKey, EntryHash, AppAgentClient, DnaHash } from '@holochain/client';
import { consume } from '@lit-labs/context';
import '@material/mwc-button';
import '@material/mwc-snackbar';
import { Snackbar } from '@material/mwc-snackbar';
import '@material/mwc-textarea';

import { EntryRecord } from '@holochain-open-dev/utils';
import { clientContext, feedStoreContext } from '../../contexts';
import { Post } from './types';
import { FeedStore } from '../../feed-store';

@customElement('create-post')
export class CreatePost extends LitElement {
  @consume({ context: clientContext })
  client!: AppAgentClient;

  @consume({ context: feedStoreContext, subscribe: true })
  feedStore!: FeedStore;

  @state()
  _text: string = '';

  
  firstUpdated() {
  }

  isPostValid() {
    return true && this._text !== '';
  }

  async createPost() {
    const post: Post = { 
        text: this._text,
    };
    try {
      const record: EntryRecord<Post> = await this.feedStore.service.createPost(post);

      this.dispatchEvent(new CustomEvent('post-created', {
        composed: true,
        bubbles: true,
        detail: {
          postHash: record.actionHash
        }
      }));
    } catch (e: any) {
      const errorSnackbar = this.shadowRoot?.getElementById('create-error') as Snackbar;
      errorSnackbar.labelText = `Error creating the post: ${e.data.data}`;
      errorSnackbar.show();
    }
  }

  render() {
    return html`
      <mwc-snackbar id="create-error" leading>
      </mwc-snackbar>

      <div style="display: flex; flex-direction: column">
        <span style="font-size: 18px">Create Post</span>

          <div style="margin-bottom: 16px">
            <mwc-textarea outlined label="Text" .value=${ this._text } @input=${(e: CustomEvent) => { this._text = (e.target as any).value;} } required></mwc-textarea>          
          </div>
            

        <mwc-button 
          raised
          label="Create Post"
          .disabled=${!this.isPostValid()}
          @click=${() => this.createPost()}
        ></mwc-button>
    </div>`;
  }
}
