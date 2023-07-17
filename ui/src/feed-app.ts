import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  AppAgentWebsocket,
  ActionHash,
  AppAgentClient,
  AppInfo,
  CellInfo,
  CellType,
  CellId,
  encodeHashToBase64,
  ClonedCell,
  AdminWebsocket,
  AppWebsocket,
  ProvisionedCell,
} from '@holochain/client';
import { provide } from '@lit-labs/context';

import './feed/posts/all-posts';
import './feed/posts/create-post';
import { clientContext, feedStoreContext } from './contexts';
import { FeedStore } from './feed-store';
import { SensemakerStore } from '@neighbourhoods/client';
import { get } from '@holochain-open-dev/stores';
import { appletConfig } from './appletConfig';

@customElement('feed-app')
export class FeedApp extends LitElement {
  @state() loading = true;

  @provide({ context: clientContext })
  @property()
  _client!: AppAgentClient;

  @property({ type: Object })
  appWebsocket!: AppWebsocket;

  @property({ type: Object })
  adminWebsocket!: AdminWebsocket;
  
  @provide({ context: feedStoreContext })
  @property()
  _feedStore!: FeedStore;

  @property()
  _sensemakerStore!: SensemakerStore;

  @property()
  appInfo!: AppInfo;
  
  @property()
  isSensemakerCloned: boolean = false;

  @property()
  agentPubkey!: string;

  async firstUpdated() {
    // connect to holochain conductor and set up websocket connections
    try {
      await this.connectHolochain()
      const installedCells = this.appInfo.cell_info;

      // check if sensemaker has been cloned yet
      const sensemakerCellInfo: CellInfo[] = installedCells["sensemaker"];
      console.log('installedCells :>> ', installedCells);
      const feedCellInfo: CellInfo[] = installedCells["feed"];
      let feedCellId: CellId;
      if (CellType.Provisioned in feedCellInfo[0]) {
        feedCellId = (feedCellInfo[0][CellType.Provisioned] as ProvisionedCell).cell_id;
      } else {
        throw new Error("feed cell not provisioned yet")

      }
      this.agentPubkey = encodeHashToBase64(feedCellId[1]);

      this._feedStore = new FeedStore(
        this.appWebsocket,
        feedCellId,
        "feed"
      );
      const allPosts = await this._feedStore.fetchAllPosts()
      // check if the cell has been cloned yet
      if (sensemakerCellInfo.length > 1) {
        console.log('already cloned')
        this.isSensemakerCloned = true;
        const clonedCellInfo = sensemakerCellInfo.filter((cellInfo) => CellType.Cloned in cellInfo)[0];
        let clonedCell: ClonedCell;
        if (CellType.Cloned in clonedCellInfo) {
          clonedCell = clonedCellInfo[CellType.Cloned];
        } else {
          throw new Error("cloned feed cell not found")
        }
        const clonedSensemakerRoleName = clonedCell.clone_id!;
        await this.initializeSensemakerStore(clonedSensemakerRoleName);
        await this.updateSensemakerState()
        this.loading = false;
      }
    }
    catch (e) {
      console.log("error registering applet", e)
    }
  }

  async initializeSensemakerStore(clonedSensemakerRoleName: string) {
    const appAgentWebsocket: AppAgentWebsocket = await AppAgentWebsocket.connect(`ws://localhost:9001`, "feed-sensemaker");
    this._sensemakerStore = new SensemakerStore(appAgentWebsocket, clonedSensemakerRoleName);
  }
  async cloneSensemakerCell(ca_pubkey: string) {
    const clonedSensemakerCell: ClonedCell = await this.appWebsocket.createCloneCell({
      app_id: 'feed-sensemaker',
      role_name: "sensemaker",
      modifiers: {
        network_seed: '',
        properties: {
          sensemaker_config: {
            neighbourhood: "feed test",
            wizard_version: "v0.1",
            community_activator: ca_pubkey
          },
          applet_configs: [],
        },
    }});
    this.isSensemakerCloned = true;
    await this.initializeSensemakerStore(clonedSensemakerCell.clone_id)
  }

  async createNeighbourhood(_e: CustomEvent) {
    await this.cloneSensemakerCell(this.agentPubkey)
    const _todoConfig = await this._sensemakerStore.registerApplet(appletConfig);
    await this.updateSensemakerState()
    this.loading = false;
  }

  async joinNeighbourhood(e: CustomEvent) {
    await this.cloneSensemakerCell(e.detail.newValue)
    // wait some time for the dht to sync, otherwise checkIfAppletConfigExists returns null
    setTimeout(async () => {
      const _todoConfig = await this._sensemakerStore.checkIfAppletConfigExists("feed-applet")
      await this.updateSensemakerState()
      this.loading = false;
    }, 2000)
  }
  async connectHolochain() {

    this.adminWebsocket = await AdminWebsocket.connect(`ws://localhost:9000`);
    this.appWebsocket = await AppWebsocket.connect(`ws://localhost:9001`);
    // We pass '' as url because it will dynamically be replaced in launcher environments
    this._client = await AppAgentWebsocket.connect(`ws://localhost:9001`, 'feed-applet');

    this.appInfo = await this._client.appInfo();
  }


  // attempt to fetch assessments for each task to have an up-to-date sensemaker state (currently just of assessments)
  async updateSensemakerState() {
    await this._sensemakerStore.checkIfAppletConfigExists("feed-applet")
    const allTaskEntryHashes = get(this._feedStore.allPostEntryHashes())
    const importanceDimensionEh = get(this._sensemakerStore.appletConfig()).dimensions["importance"]
    const totalImportanceDimensionEh = get(this._sensemakerStore.appletConfig()).dimensions["total_importance"]
    const perceivedHeatDimensionEh = get(this._sensemakerStore.appletConfig()).dimensions["perceived_heat"]
    const averageHeatDimensionEh = get(this._sensemakerStore.appletConfig()).dimensions["average_heat"]
    await this._sensemakerStore.getAssessmentsForResources({
      dimension_ehs: [importanceDimensionEh, totalImportanceDimensionEh, perceivedHeatDimensionEh, averageHeatDimensionEh],
      resource_ehs: allTaskEntryHashes
    })
    
    // initialize the default UI settings
    // await this._sensemakerStore.updateAppletUIConfig(
    //   encodeHashToBase64(get(this._sensemakerStore.appletConfig()).resource_defs["task_item"]), 
    //   get(this._sensemakerStore.appletConfig()).dimensions["total_importance"], 
    //   get(this._sensemakerStore.appletConfig()).dimensions["importance"],
    //   get(this._sensemakerStore.appletConfig()).methods["total_importance_method"],
    // )
  }

  render() {
    if (this.loading)
      return html`
        Loading!
      `;

    return html`
      <main>
        <h1>Feed Applet</h1>
        <div id="content"><all-posts></all-posts><create-post></create-post></div>
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
