import {
  AdminWebsocket,
  AppWebsocket,
} from "@holochain/client";
import {
  NhLauncherApplet,
  AppletRenderers,
  WeServices,
  AppletInfo,
} from "@neighbourhoods/nh-launcher-applet";
import { FeedApplet } from "./feed-applet";

const feedApplet: NhLauncherApplet = {
  async appletRenderers(
    appWebsocket: AppWebsocket,
    adminWebsocket: AdminWebsocket,
    weStore: WeServices,
    appletAppInfo: AppletInfo[]
  ): Promise<AppletRenderers> {
    return {
      full(element: HTMLElement, registry: CustomElementRegistry) {
        registry.define("feed-applet", FeedApplet);
        element.innerHTML = `<feed-applet></feed-applet>`;
        const appletElement = element.querySelector("feed-applet") as any;
        appletElement.appWebsocket = appWebsocket;
        appletElement.appletAppInfo = appletAppInfo;
        appletElement.sensemakerStore = weStore.sensemakerStore;
      },
      blocks: [],
    };
  },
};

export default feedApplet;
