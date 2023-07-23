import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { provide } from '@lit-labs/context';

import './feed/pages/all-posts';
import './feed/pages/create-post';
import './feed/components/page-header-card';
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
        <header>
          <nh-page-header-card slot="header" .heading=${"Your Feed"}></nh-page-header-card>
        </header>
        <create-post></create-post>
        <div id="content"></div>
      </main>
    `;
  }
  
  static styles = css`
    :host {
      height: 100%;
      width: 100%;
      display: grid;
      align-items: center;
      justify-content: center;
      
      background-color: var(--nh-theme-bg-canvas);
      color: var(--nh-theme-fg-default);
    }
  `;
}
