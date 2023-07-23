import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { CSSResult, LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { provide } from '@lit-labs/context';

import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import './fonts.css';
import { feedStoreContext } from './contexts';
import { FeedStore } from './feed-store';
import {
  SensemakerStore,
  sensemakerStoreContext,
} from '@neighbourhoods/client';
import { NHComponent } from 'neighbourhoods-design-system-components';
import { NHPageHeaderCard } from './feed/components/page-header-card';
import { CreatePost } from './feed/widgets/create-post';
import { AllPosts } from './feed/widgets/all-posts';
import { ContextView } from './sensemaker/context-view';
import { ContextSelector } from './sensemaker/context-selector';

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
          >
          <span slot="secondary-action" style="height: 3.5rem"></span>
          <span slot="primary-action"></span>
          </nh-page-header-card>
        </header>
        <div id="my-feed">
          <create-post-widget></create-post-widget>
          <all-posts-widget></all-posts-widget>
        </div>
        <context-selector></context-selector>
        <context-view></context-view>
    </main>
          `;
        }
  
  static get elementDefinitions() {
    return {
      'nh-page-header-card': NHPageHeaderCard,
      'create-post-widget': CreatePost,
      'all-posts-widget': AllPosts,
      'context-view': ContextView,
      'context-selector': ContextSelector,
    };
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
        grid-template-columns: 40% 60%;
        grid-template-rows: 4rem auto;
        grid-template-areas: "top-menu context-switch" "feed contexts";
        align-items: center;
        justify-content: center;
        gap: calc(1px * var(--nh-spacing-lg)) calc(1px * var(--nh-spacing-3xl));

        padding: calc(1px * var(--nh-spacing-sm)) calc(1px * var(--nh-spacing-4xl));
        background-color: var(--nh-theme-bg-canvas);
        color: var(--nh-theme-fg-default);
      }
      #my-feed {
        height: 100%;
        width: 100%;
        grid-area: feed;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: calc(1px * var(--nh-spacing-lg));
      }
      context-selector {
        grid-area: context-switch;
        height: 3.5rem;
      }
      context-view {
        grid-area: contexts;
      }
      #my-feed > * {
        width: 100%;
      }
    `,
  ];
}
