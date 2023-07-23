import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { provide } from '@lit-labs/context';

import './feed/posts/all-posts';
import './feed/posts/create-post';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
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

  render() {
    if (this.loading)
      return html`
        <sl-spinner></sl-spinner>
      `;

    return html`
      <main>
        <create-post></create-post>
        <div id="content"></div>
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
  `;
}
