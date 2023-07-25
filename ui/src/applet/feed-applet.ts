import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { customElement, property, state } from 'lit/decorators.js';
import { LitElement, html, css } from 'lit';
import { AppletInfo } from '@neighbourhoods/nh-launcher-applet';
import {
  FeedStore,
  appletConfig,
  ImportanceDimensionAssessment,
  TotalImportanceDimensionDisplay,
  FeedApp,
} from '../index';
import {
  AdminWebsocket,
  AppWebsocket,
  CellType,
  ProvisionedCell,
  encodeHashToBase64,
} from '@holochain/client';
import { SensemakerStore } from '@neighbourhoods/client';
import { get } from 'svelte/store';
import { NHComponent } from 'neighbourhoods-design-system-components';

@customElement('feed-applet')
export class FeedApplet extends ScopedElementsMixin(NHComponent) {
  @property()
  appletAppInfo!: AppletInfo[];

  @property()
  appWebsocket!: AppWebsocket;

  @property()
  adminWebsocket!: AdminWebsocket;

  @property()
  sensemakerStore!: SensemakerStore;

  @property()
  feedStore!: FeedStore;

  @state()
  loaded = false;

  async firstUpdated() {
    try {
      const appletRoleName = 'feed';
      const feedAppletInfo = this.appletAppInfo[0];
      const cellInfo = feedAppletInfo.appInfo.cell_info[appletRoleName][0];
      const feedCellInfo = (
        cellInfo as { [CellType.Provisioned]: ProvisionedCell }
      ).provisioned;
      await this.adminWebsocket.authorizeSigningCredentials(
        feedCellInfo.cell_id
      );

      await this.sensemakerStore.registerApplet(appletConfig);

      const config = get(this.sensemakerStore.flattenedAppletConfigs());
      console.log('feed appletConfig :>> ', config);

      await this.sensemakerStore.registerWidget(
        [
          encodeHashToBase64(
            get(this.sensemakerStore.flattenedAppletConfigs()).dimensions['like']
          ),
          encodeHashToBase64(
            get(this.sensemakerStore.flattenedAppletConfigs()).dimensions['total_likes']
          ),
        ],
        TotalImportanceDimensionDisplay,
        ImportanceDimensionAssessment
      );
      const appWs = this.appWebsocket;
      this.feedStore = new FeedStore(
        this.appWebsocket,
        feedCellInfo.cell_id,
        appletRoleName
      );
      const allTasks = await this.feedStore.fetchAllPosts();
      const allPostEntryHashes = get(this.feedStore.allPostEntryHashes());
      
      await this.sensemakerStore.getAssessmentsForResources({
        dimension_ehs: null,
        resource_ehs: allPostEntryHashes,
      });
      this.loaded = true;
    } catch (e) {
      console.log('error in first update', e);
    }
  }
  static styles = css`
    .completed {
      text-decoration-line: line-through;
      color: #777;
    }
  `;

  render() {
    if (!this.loaded)
      return html`<div
        style="display: flex; flex: 1; flex-direction: row; align-items: center; justify-content: center"
      >
        Loading...
      </div>`;
    return html`
      <feed-app
        style="height: 100vh; width: calc(100vw - 16px); margin-bottom: 70px"
        .sensemakerStore=${this.sensemakerStore}
        .feedStore=${this.feedStore}
      ></feed-app>
    `;
  }


  static get elementDefinitions() {
    return {
      'feed-app': FeedApp,
    };
  }

}
