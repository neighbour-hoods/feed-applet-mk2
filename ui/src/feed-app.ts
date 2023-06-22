import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  AppAgentWebsocket,
  ActionHash,
  AppAgentClient,
} from '@holochain/client';
import { contextProvider, provide } from '@lit-labs/context';
import '@material/mwc-circular-progress';

import './feed/posts/all-posts';
import { clientContext, feedStoreContext } from './contexts';
import { AllPosts } from './feed/posts/all-posts';
import { CreatePost } from './feed/posts/create-post';
import { FeedStore } from './feed-store';
import { SensemakerStore, sensemakerStoreContext } from '@neighbourhoods/client';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';

@customElement('feed-app')
export class FeedApp extends LitElement {
  @state() loading = true;

  @provide({ context: clientContext })
  @property({ type: Object })
  client!: AppAgentClient;

  @provide({ context: feedStoreContext })
  @property()
  feedStore!: FeedStore;

  @contextProvider({ context: sensemakerStoreContext })
  @property()
  sensemakerStore!: SensemakerStore;

  async firstUpdated() {
    // We pass '' as url because it will dynamically be replaced in launcher environments
    this.client = await AppAgentWebsocket.connect('', 'feed-sensemaker');

    this.loading = false;
  }

  render() {
    if (this.loading)
      return html`
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      `;

    return html`
      <main>
        <h1>Feed Applet</h1>
        <create-post></create-post>
        <div id="content"><all-posts></all-posts></div>
      </main>
    `;
  }

  // static get scopedElements() {
  //   return {
  //     'all-posts': AllPosts,
  //     'create-post': CreatePost,
  //   };
  // }
  static styles = css`
    :host {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      font-size: calc(10px + 2vmin);
      color: #1a2b42;
      max-width: 960px;
      margin: 0 auto;
      text-align: center;
      background-color: var(--lit-element-background-color);
    }

    main {
      flex-grow: 1;
    }

    .app-footer {
      font-size: calc(12px + 0.5vmin);
      align-items: center;
    }

    .app-footer a {
      margin-left: 5px;
    }
  `;
}
