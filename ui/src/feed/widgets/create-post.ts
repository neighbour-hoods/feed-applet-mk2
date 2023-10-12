import { CSSResult, css, html } from 'lit';
import { state, property } from 'lit/decorators.js';
import { AppAgentClient } from '@holochain/client';
import { consume } from '@lit-labs/context';

import { EntryRecord } from '@holochain-open-dev/utils';
import { clientContext, feedStoreContext } from '../../contexts';
import { Post } from '../posts/types';
import { FeedStore } from '../../feed-store';
import { SlTextarea } from '@scoped-elements/shoelace';
import { NHCard, NHComponentShoelace } from '@neighbourhoods/design-system-components';


export default class NHCreatePost extends NHComponentShoelace {
    @consume({ context: clientContext })
    client!: AppAgentClient;
    @consume({ context: feedStoreContext, subscribe: true })
    feedStore!: FeedStore;

    @property()
    prompt!: string;
    @property()
    placeholder!: string;
    @property()
    textAreaValue!: string;

    @state()
    _text: string = '';

    async createPost() {
      const post: Post = {
        text_content: this._text,
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
        <nh-card
          class="squarish"  
          .theme=${"light"}
          .heading=${this.prompt}
          .hasContextMenu=${false}
          .hasPrimaryAction=${true}
          .textSize=${"sm"}
          .footerAlign=${"r"}
        >
          <sl-textarea value=${this.textAreaValue} filled placeholder=${this.placeholder} resize="auto"></sl-textarea>
          <slot slot="footer" name="footer"></slot>
        </nh-card>
      `;
    }
  
    static get elementDefinitions() {
      return {
        "sl-textarea": SlTextarea,
        "nh-card": NHCard,
      };
    }
  
    static styles: CSSResult[] = [
      super.styles as CSSResult,
      css`
        /* Layout */
        :root {
          display: flex;
        }
  
        sl-textarea::part(textarea) {
          padding: calc(1px * var(--nh-spacing-sm));
          color:  var(--nh-theme-fg-default);
          background: var(--nh-theme-bg-element);
        }
  
        sl-textarea::part(textarea):active {
          border: 1px solid var(--nh-theme-bg-element);
        }
      `,
    ];
  }
  