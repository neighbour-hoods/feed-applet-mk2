import { CSSResult, LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { provide } from '@lit-labs/context';

import './fonts.css';
import { feedStoreContext } from './contexts';
import { FeedStore } from './feed-store';
import {
  AppletConfig,
  SensemakerStore,
  sensemakerStoreContext,
} from '@neighbourhoods/client';
import { NHComponent } from 'neighbourhoods-design-system-components';
import { NHPageHeaderCard } from './feed/components/page-header-card';
import { CreatePost } from './feed/widgets/create-post';
import { AllPosts } from './feed/widgets/all-posts';
import { ContextView } from './sensemaker/context-view';
import { ContextSelector } from './sensemaker/context-selector';
import { StoreSubscriber } from 'lit-svelte-stores';
import { classMap } from 'lit/directives/class-map.js';

@customElement('feed-app')
export class FeedApp extends NHComponent {
  @state() loading = false;
  
  @provide({ context: feedStoreContext })
  @property()
  feedStore!: FeedStore;

  @provide({ context: sensemakerStoreContext })
  @property()
  sensemakerStore!: SensemakerStore;

  @state()
  _selectedContext: string = "";
  
  contexts: StoreSubscriber<AppletConfig> = new StoreSubscriber(this, () =>
    this.sensemakerStore.appletConfig()
  );

  render() {
    if (this.loading) return html`Loading...`;
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
          <create-post-widget @post-created=${function (e: CustomEvent){
            ((e.currentTarget as HTMLElement).nextElementSibling as any)._fetchPosts.run();
            console.log(((((e.currentTarget as HTMLElement).parentElement as HTMLElement).nextElementSibling as HTMLElement).nextElementSibling as HTMLElement));
          }}></create-post-widget>
          <all-posts-widget></all-posts-widget>
        </div>
        <context-selector .selectedContextName=${this._selectedContext} @context-selected=${(e: CustomEvent) => {
          this._selectedContext = (e as any).detail.contextName;
          [...((e.currentTarget as HTMLElement).nextElementSibling as any).children].forEach((view: any) => view.requestUpdate("contextName"));
        }}></context-selector>
        <div class="contexts-carousel">
          ${Object.keys(this.contexts?.value?.cultural_contexts).map(
            contextName => html`<context-view
              class=${classMap({
                active: this._selectedContext == contextName
              })}
              .selected=${this._selectedContext == contextName}
              .contextName=${contextName}>
            </context-view>`)}
          </div>
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
        grid-template-columns:  minmax(12rem, 30%) minmax(4rem, 5%) minmax(12rem, 40%);
        grid-template-rows: 4rem auto;
        grid-template-areas: "top-menu gap context-switch" "feed gap contexts";
        align-items: start;
        justify-content: center;
        gap: calc(1px * var(--nh-spacing-lg)) 0;

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
      .contexts-carousel {
        grid-area: contexts;
        position: relative;
        width: 100%;
        height: 100%;
      }
      .contexts-carousel > context-view {
        position: absolute;
        top: 0;
        left: 0;
        display: none;
        width: 100%;
      }
      .contexts-carousel > context-view.active {
        display: block;
      }
      #my-feed > * {
        width: 100%;
      }
    `,
  ];
}
