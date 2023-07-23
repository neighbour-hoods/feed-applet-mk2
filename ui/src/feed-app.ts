import { CSSResult, LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { provide } from '@lit-labs/context';

import './feed/pages/all-posts';
import './feed/pages/create-post';
import './feed/components/page-header-card';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import './fonts.css';
import { feedStoreContext } from './contexts';
import { FeedStore } from './feed-store';
import {
  SensemakerStore,
  sensemakerStoreContext,
} from '@neighbourhoods/client';
import { NHComponent } from 'neighbourhoods-design-system-components';

@customElement('feed-app')
export class FeedApp extends NHComponent {
  @state() loading = false;

  @provide({ context: feedStoreContext })
  @property()
  feedStore!: FeedStore;

  @provide({ context: sensemakerStoreContext })
  @property()
  sensemakerStore!: SensemakerStore;

  render() {
    if (this.loading) return html` <sl-spinner></sl-spinner> `;

    return html`
      <main>
        <header>
          <nh-page-header-card
            slot="top-menu"
            .heading=${'Your Feed'}
          ></nh-page-header-card>
        </header>
        <create-post></create-post>
        <div id="content"></div>
      </main>
    `;
  }

  static styles = [
    super.styles as CSSResult,
    css`
      :host {
        display: flex;
        align-items: start;
        justify-content: start;

        background-color: var(--nh-theme-bg-canvas);
        color: var(--nh-theme-fg-default);
      }
      main {
        height: 100%;
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 4rem auto;
        grid-template-areas: 'top-menu' 'feed';
        align-items: center;
        justify-content: center;

        background-color: var(--nh-theme-bg-canvas);
        color: var(--nh-theme-fg-default);
      }
    `,
  ];
}
