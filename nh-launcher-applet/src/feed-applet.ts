import { property, state } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css } from "lit";
import { AppWebsocket, CellType, ProvisionedCell, encodeHashToBase64 } from "@holochain/client";
import { AppletInfo } from "@neighbourhoods/nh-launcher-applet";
import { FeedApp, FeedStore, appletConfig, ImportanceDimensionAssessment, TotalImportanceDimensionDisplay } from "@neighbourhoods/feed-applet";
import { SensemakerStore } from "@neighbourhoods/client";
import { get } from 'svelte/store';

export class FeedApplet extends ScopedElementsMixin(LitElement) {
  @property()
  appletAppInfo!: AppletInfo[];

  @property()
  appWebsocket!: AppWebsocket;

  @property()
  sensemakerStore!: SensemakerStore;

  @property()
  feedStore!: FeedStore;

  @state()
  loaded = false;

  async firstUpdated() {
    try {
      const appletRoleName = "feed";
      const feedAppletInfo = this.appletAppInfo[0];
      const cellInfo = feedAppletInfo.appInfo.cell_info[appletRoleName][0]
      const feedCellInfo = (cellInfo as { [CellType.Provisioned]: ProvisionedCell }).provisioned;

      const maybeAppletConfig = await this.sensemakerStore.checkIfAppletConfigExists(appletConfig.applet_config_input.name)
      if (!maybeAppletConfig) {
        await this.sensemakerStore.registerApplet(appletConfig)
      }

      await this.sensemakerStore.registerWidget(
        [
          encodeHashToBase64(get(this.sensemakerStore.appletConfig()).dimensions["like"]),
          encodeHashToBase64(get(this.sensemakerStore.appletConfig()).dimensions["total_likes"]),
        ],
        TotalImportanceDimensionDisplay,
        ImportanceDimensionAssessment
      )
      const appWs = await AppWebsocket.connect(this.appWebsocket.client.socket.url)
      this.feedStore = new FeedStore(
        appWs as any,
        feedCellInfo.cell_id,
        appletRoleName
      );
      // const allPosts = await this.feedStore.fetchAllPosts()
    //   const allPostEntryHashes = get(this.feedStore.allPostEntryHashes())
    //   const likeDimensionEh = get(this.sensemakerStore.appletConfig()).dimensions["like"]
    //   const totalLikesDimensionEh = get(this.sensemakerStore.appletConfig()).dimensions["total_likes"]
    //   await this.sensemakerStore.getAssessmentsForResources({
    //   dimension_ehs: [likeDimensionEh, totalLikesDimensionEh],
    //   resource_ehs: allPostEntryHashes
    // })
      this.loaded = true;
    }
    catch (e) {
      console.log("error in first update", e)
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
        Loading!
      </div>`;
    return html`
      <feed-app .sensemakerStore=${this.sensemakerStore} .feedStore=${this.feedStore}></feed-app>
    `;
  }

  static get scopedElements() {
    return {
      // "mwc-circular-progress": CircularProgress,
      "feed-app": FeedApp,
      // 'total-importance-dimension-display': TotalImportanceDimensionDisplay,
      // 'importance-dimension-assessment': ImportanceDimensionAssessment,
      // 'average-heat-dimension-display': AverageHeatDimensionDisplay,
      // 'heat-dimension-assessment': HeatDimensionAssessment,
      // TODO: add any elements that you have in your applet
    };
  }
}