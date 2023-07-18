import { property, state } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { CircularProgress } from "@scoped-elements/material-web";
import { LitElement, html, css } from "lit";
import { AppletInfo } from "@neighbourhoods/nh-launcher-applet";
import { FeedApp, FeedStore, appletConfig, ImportanceDimensionAssessment, TotalImportanceDimensionDisplay } from "../index";
import { AdminWebsocket, AppWebsocket, CellType, ProvisionedCell, encodeHashToBase64 } from "@holochain/client";
import { SensemakerStore } from "@neighbourhoods/client";
import { get } from 'svelte/store';

export class FeedApplet extends ScopedElementsMixin(LitElement) {
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
      const appletRoleName = "feed";
      const feedAppletInfo = this.appletAppInfo[0];
      const cellInfo = feedAppletInfo.appInfo.cell_info[appletRoleName][0]
      const feedCellInfo = (cellInfo as { [CellType.Provisioned]: ProvisionedCell }).provisioned;
      await this.adminWebsocket.authorizeSigningCredentials(feedCellInfo.cell_id);

      await this.sensemakerStore.registerApplet(appletConfig)

      await this.sensemakerStore.registerWidget(
        [
          encodeHashToBase64(get(this.sensemakerStore.appletConfig()).dimensions["like"]),
          encodeHashToBase64(get(this.sensemakerStore.appletConfig()).dimensions["total_likes"]),
        ],
        TotalImportanceDimensionDisplay,
        ImportanceDimensionAssessment
      )
      const appWs = this.appWebsocket;
      this.feedStore = new FeedStore(
        this.appWebsocket,
        feedCellInfo.cell_id,
        appletRoleName
      );
      const allTasks = await this.feedStore.fetchAllPosts()
      const allPostEntryHashes = get(this.feedStore.allPostEntryHashes())
      const importanceDimensionEh = get(this.sensemakerStore.appletConfig()).dimensions["importance"]
      const totalImportanceDimensionEh = get(this.sensemakerStore.appletConfig()).dimensions["total_importance"]
      const perceivedHeatDimensionEh = get(this.sensemakerStore.appletConfig()).dimensions["perceived_heat"]
      const averageHeatDimensionEh = get(this.sensemakerStore.appletConfig()).dimensions["average_heat"]
      await this.sensemakerStore.getAssessmentsForResources({
      dimension_ehs: null,
      resource_ehs: allPostEntryHashes
    })
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
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      </div>`;
    return html`
      <feed-app style="height: 100vh; width: 100%; margin-bottom: 70px" .sensemakerStore=${this.sensemakerStore} .feedStore=${this.feedStore}></feed-app>
    `;
  }

  static get scopedElements() {
    return {
      "mwc-circular-progress": CircularProgress,
      "feed-app": FeedApp,
    };
  }
}