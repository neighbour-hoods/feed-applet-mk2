import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  AppAgentWebsocket,
  ActionHash,
  AppAgentClient,
} from '@holochain/client';
import { provide } from '@lit-labs/context';

import './feed/posts/all-posts';
import { clientContext } from './contexts';

@customElement('feed-app')
export class FeedApp extends LitElement {
  @state() loading = true;

  @provide({ context: clientContext })
  @property({ type: Object })
  client!: AppAgentClient;

  async firstUpdated() {
    // We pass '' as url because it will dynamically be replaced in launcher environments
    this.client = await AppAgentWebsocket.connect('', 'feed-applet');

    this.loading = false;
  }

  render() {
    if (this.loading)
      return html`
        Loading!
      `;

    return html`
      <main>
        <h1>Feed Applet</h1>
        <div id="content"><all-posts></all-posts></div>
      </main>
    `;
  }

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
