import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { InstalledCell, ActionHash, Record, AgentPubKey, EntryHash, AppAgentClient, DnaHash } from '@holochain/client';
import { consume } from '@lit/context';
import '@material/mwc-button';
import '@material/mwc-snackbar';
import { Snackbar } from '@material/mwc-snackbar';

import { clientContext } from '../../contexts';
import { Post } from './types';

@customElement('create-post')
export class CreatePost extends LitElement {
  @consume({ context: clientContext })
  client!: AppAgentClient;

  @property()
  title!: string;
  @property()
  textContent!: string;
  @property()
  imageContent!: string;
  @property()
  hashTags!: Array<string>;


  
  firstUpdated() {
    if (this.title === undefined) {
      throw new Error(`The title input is required for the create-post element`);
    }
    if (this.textContent === undefined) {
      throw new Error(`The textContent input is required for the create-post element`);
    }
    if (this.imageContent === undefined) {
      throw new Error(`The imageContent input is required for the create-post element`);
    }
    if (this.hashTags === undefined) {
      throw new Error(`The hashTags input is required for the create-post element`);
    }
  }

  isPostValid() {
    return true;
  }

  async createPost() {
    const post: Post = { 
        title: this.title,
        text_content: this.textContent,
        image_content: this.imageContent,
        hash_tags: this.hashTags,
    };

    try {
      const record: Record = await this.client.callZome({
        cap_secret: null,
        role_name: 'feed',
        zome_name: 'posts',
        fn_name: 'create_post',
        payload: post,
      });

      this.dispatchEvent(new CustomEvent('post-created', {
        composed: true,
        bubbles: true,
        detail: {
          postHash: record.signed_action.hashed.hash
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


        <mwc-button 
          raised
          label="Create Post"
          .disabled=${!this.isPostValid()}
          @click=${() => this.createPost()}
        ></mwc-button>
    </div>`;
  }
}
