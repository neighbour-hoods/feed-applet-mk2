import {
  AdminWebsocket,
  AppAgentClient,
  AppWebsocket,
  CellType,
  ProvisionedCell,
} from "@holochain/client";
import {
  NhLauncherApplet,
  AppletRenderers,
  WeServices,
  AppletInfo,
} from "@neighbourhoods/nh-launcher-applet";
import { FeedApplet } from "./applet/feed-applet";

const feedApplet: NhLauncherApplet = {
  async appletRenderers(
    weStore: WeServices,
    appletAppInfo: AppletInfo[],
    appWebsocket: AppWebsocket,
    appAgentWebsocket: AppAgentClient,
  ): Promise<AppletRenderers> {
    return {
      full(element: HTMLElement, registry: CustomElementRegistry) {
        registry?.define("feed-applet", FeedApplet);
        element.innerHTML = `<feed-applet></feed-applet>`;
        const appletElement = element.querySelector("feed-applet") as any;
        appletElement.appWebsocket = appWebsocket;
        appletElement.appAgentWebsocket = appAgentWebsocket;
        appletElement.appletAppInfo = appletAppInfo;
        appletElement.sensemakerStore = weStore.sensemakerStore;
      },
      blocks: [],
    };
  },
};

export default feedApplet;
