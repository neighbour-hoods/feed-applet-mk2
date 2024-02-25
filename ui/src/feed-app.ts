import { css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { FeedStore } from './feed-store';
import {
  AppBlock,
  AppBlockDelegate,
  AppletConfig,
  NHDelegateReceiver,
  SensemakerStore,
} from '@neighbourhoods/client';
import { NHPageHeaderCard } from './feed/components/page-header-card';
import CreatePost from './feed/widgets/create-post';
import { AllPosts } from './feed/widgets/all-posts';
import { ContextView } from './sensemaker/context-view';
import { ContextSelector } from './sensemaker/context-selector';
import { classMap } from 'lit/directives/class-map.js';
import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import { getCellId } from '@neighbourhoods/app-loader';
import { appletConfig } from './appletConfig';

export class FeedApplet
  extends ScopedRegistryHost(AppBlock)
  implements NHDelegateReceiver<AppBlockDelegate>
{
  @state() loaded = false;

  @property() feedStore!: FeedStore;

  @property() sensemakerStore!: SensemakerStore;

  @state() config!: AppletConfig;

  @state() _selectedContext: string = '';

  loadData = async () => {
    try {
      this.sensemakerStore = this.nhDelegate.sensemakerStore;
      const appletRoleName = 'feed';
      const cellInfo = this.nhDelegate.appInfo.cell_info[appletRoleName][0];
      const cellId = getCellId(cellInfo);
      const installAppId = this.nhDelegate.appInfo.installed_app_id;
      appletConfig.name = installAppId;
      this.feedStore = new FeedStore(
        this.nhDelegate.appAgentWebsocket,
        cellId!,
        appletRoleName
      );

      
      // const allPostEntryHashes = get(this.feedStore?.allPostEntryHashes());

      // await this.nhDelegate.sensemakerStore.getAssessmentsForResources({
      //   resource_ehs: allPostEntryHashes,
      // });
      
      const config = await this.sensemakerStore.checkIfAppletConfigExists(
        installAppId
      );
      if (config) {
        console.log('config :>> ', config);
        this.config = config;
      }

      this.loaded = true;
    } catch (e) {
      console.log('error in first update', e);
    }
  };

  render() {
    if (!this.loaded) return html`Loading...`;

    return html`
      <main>
        <header>
          <nh-page-header-card slot="top-menu" .heading=${'Your Feed'}>
            <span slot="secondary-action" style="height: 3.5rem"></span>
            <span slot="primary-action"></span>
          </nh-page-header-card>
        </header>

        <div id="my-feed">
          <create-post-widget
            .sensemakerStore=${this.sensemakerStore}
            .feedStore=${this.feedStore}
            @post-created=${function (e: CustomEvent) {
              // (
              //   (e.currentTarget as HTMLElement).nextElementSibling as any
              // )._fetchPosts.run();
              console.log(
                (
                  (
                    (e.currentTarget as HTMLElement)
                      .parentElement as HTMLElement
                  ).nextElementSibling as HTMLElement
                ).nextElementSibling as HTMLElement
              );
            }}
          ></create-post-widget>

          <all-posts-widget
            .sensemakerStore=${this.sensemakerStore}
            .feedStore=${this.feedStore}
          ></all-posts-widget>
        </div>

        <context-selector
          .selectedContextName=${this._selectedContext}
          @context-selected=${(e: CustomEvent) => {
            this._selectedContext = (e as any).detail.contextName;
            [
              ...((e.currentTarget as HTMLElement).nextElementSibling as any)
                .children,
            ].forEach((view: any) => view.requestUpdate('contextName'));
          }}
          class="moveFromLeft"
          @enter-left=${(e: CustomEvent) => {
            (e.currentTarget as any).classList.toggle('moveFromLeft');
            (e.currentTarget as any).classList.toggle('moveFromRight');
          }}
          @enter-right=${(e: CustomEvent) => {
            (e.currentTarget as any).classList.toggle('moveFromRight');
            (e.currentTarget as any).classList.toggle('moveFromLeft');
          }}
        ></context-selector>

        <div class="contexts-carousel">
          ${[].map(
            contextName => html`<context-view
              class=${classMap({
                active: this._selectedContext == contextName,
              })}
              .selected=${this._selectedContext == contextName}
              .contextName=${contextName}
            >
            </context-view>`
          )}
        </div>
      </main>
    `;
  }

  static get elementDefinitions() {
    return {
      'nh-page-header-card': NHPageHeaderCard,
      'create-post-widget': CreatePost,
      // 'all-posts-widget': AllPosts,
      'context-view': ContextView,
      // 'context-selector': ContextSelector,
    };
  }

  static styles = [
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
        grid-template-columns: minmax(12rem, 30%) minmax(4rem, 5%) minmax(
            12rem,
            40%
          );
        grid-template-rows: minmax(2rem, 8rem) auto;
        grid-template-areas: 'top-menu gap context-switch' 'feed gap contexts';
        align-items: start;
        justify-content: center;
        gap: calc(1px * var(--nh-spacing-lg)) 0;

        padding: calc(1px * var(--nh-spacing-sm))
          calc(1px * var(--nh-spacing-4xl));
        background-color: var(--nh-theme-bg-canvas);
        color: var(--nh-theme-fg-default);
      }
      #my-feed::-webkit-scrollbar,
      .contexts-carousel::-webkit-scrollbar {
        width: 0;
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
        overflow-y: auto;
        overflow-x: hidden;
        padding-right: 3rem;
      }
      context-selector {
        grid-area: context-switch;
        height: 7rem;
      }
      .contexts-carousel {
        grid-area: contexts;
        position: relative;
        width: 100%;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
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

      /* Transitions */
      .moveFromRight + .contexts-carousel context-view {
        -webkit-animation: moveFromRight 0.6s ease both;
        animation: moveFromRight 0.6s ease both;
      }
      .moveFromLeft + .contexts-carousel context-view {
        -webkit-animation: moveFromLeft 0.6s ease both;
        animation: moveFromLeft 0.6s ease both;
      }
      @-webkit-keyframes moveFromRight {
        from {
          -webkit-transform: translateX(100%);
        }
      }
      @keyframes moveFromRight {
        from {
          -webkit-transform: translateX(100%);
          transform: translateX(100%);
        }
      }
      @-webkit-keyframes moveFromLeft {
        from {
          -webkit-transform: translateX(-100%);
        }
      }
      @keyframes moveFromLeft {
        from {
          -webkit-transform: translateX(-100%);
          transform: translateX(-100%);
        }
      }
    `,
  ];
}
