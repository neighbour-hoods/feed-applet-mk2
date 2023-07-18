import { LitElement, css, html } from 'lit';
import { contextProvider } from '@lit-labs/context';
import { customElement, property, state } from 'lit/decorators.js';
import {
  AppAgentClient,
  AppInfo,
  AdminWebsocket,
  AppWebsocket,
} from '@holochain/client';
import { provide } from '@lit-labs/context';

import './feed/posts/all-posts';
import './feed/posts/create-post';
import { feedStoreContext } from './contexts';
import { FeedStore } from './feed-store';
import { SensemakerStore, sensemakerStoreContext } from '@neighbourhoods/client';

@customElement('feed-app')
export class FeedApp extends LitElement {
  @state() loading = false;

  @provide({ context: feedStoreContext })
  @property()
  feedStore!: FeedStore;

  @provide({ context: sensemakerStoreContext })
  @property()
  sensemakerStore!: SensemakerStore;

  async firstUpdated() {
  }

  render() {
    if (this.loading)
      return html`
        Loading from App!
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
