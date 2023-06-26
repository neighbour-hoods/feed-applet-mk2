import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { ActionHash, EntryHash, AgentPubKey, Record, AppAgentClient, DnaHash } from '@holochain/client';
import { consume } from '@lit-labs/context';
import { decode } from '@msgpack/msgpack';
import '@material/mwc-button';
import '@material/mwc-snackbar';
// import { Snackbar } from '@material/mwc-snackbar';
import '@material/mwc-textarea';

import { clientContext } from '../../contexts';
import { Post } from './types';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { Snackbar, TextArea, Button, CircularProgress } from '@scoped-elements/material-web'

// @customElement('edit-post')
// export class EditPost extends LitElement {
export class EditPost extends ScopedElementsMixin(LitElement) {

  @consume({ context: clientContext })
  client!: AppAgentClient;
  
  @property({
      hasChanged: (newVal: ActionHash, oldVal: ActionHash) => newVal?.toString() !== oldVal?.toString()
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
      throw new Error(`The currentRecord property is required for the edit-post element`);
    }

    if (this.originalPostHash === undefined) {
      throw new Error(`The originalPostHash property is required for the edit-post element`);
    }
    
    this._text = this.currentPost.text;
  }

  async updatePost() {
    const post: Post = { 
      text: this._text!,
    };

    try {
      const updateRecord: Record = await this.client.callZome({
        cap_secret: null,
        role_name: 'feed_applet',
        zome_name: 'posts',
        fn_name: 'update_post',
        payload: {
          original_post_hash: this.originalPostHash,
          previous_post_hash: this.currentRecord.signed_action.hashed.hash,
          updated_post: post
        },
      });
  
      this.dispatchEvent(new CustomEvent('post-updated', {
        composed: true,
        bubbles: true,
        detail: {
          originalPostHash: this.originalPostHash,
          previousPostHash: this.currentRecord.signed_action.hashed.hash,
          updatedPostHash: updateRecord.signed_action.hashed.hash
        }
      }));
    } catch (e: any) {
      console.log('update post error', e)
      const errorSnackbar = this.shadowRoot?.getElementById('update-error') as Snackbar;
      errorSnackbar.labelText = `Error updating the post: ${e.data.data}`;
      errorSnackbar.show();
    }
  }

  render() {
    return html`
      <mwc-snackbar id="update-error" leading>
      </mwc-snackbar>

      <div style="display: flex; flex-direction: column">
        <span style="font-size: 18px">Edit Post</span>
          <div style="margin-bottom: 16px">
          <mwc-textarea outlined label="Text" .value=${ this._text } @input=${(e: CustomEvent) => { this._text = (e.target as any).value;} } required></mwc-textarea>    
          </div>



        <div style="display: flex; flex-direction: row">
          <mwc-button
            outlined
            label="Cancel"
            @click=${() => this.dispatchEvent(new CustomEvent('edit-canceled', {
              bubbles: true,
              composed: true
            }))}
            style="flex: 1; margin-right: 16px"
          ></mwc-button>
          <mwc-button 
            raised
            label="Save"
            .disabled=${!this.isPostValid()}
            @click=${() => this.updatePost()}
            style="flex: 1;"
          ></mwc-button>
        </div>
      </div>`;
  }
  static get scopedElements() {
    return {
      'mwc-snackbar': Snackbar,
      'mwc-textarea': TextArea,
      'mwc-button': Button,
    };
  }
}
