import {
  AppAgentClient,
  EntryHash,
} from "@holochain/client";
import {
  NeighbourhoodApplet,
  AppletRenderers,
  NeighbourhoodServices,
  AppletInfo,
} from "@neighbourhoods/nh-launcher-applet";

import { ImportanceDimensionAssessment, TotalImportanceDimensionDisplay } from "./sensemaker/widgets";

import { FeedApplet } from "./applet/feed-applet";
import { appletConfig } from "./appletConfig";
import { html, render } from "lit";

const feedApplet: NeighbourhoodApplet = {
  appletConfig: appletConfig,
  widgetPairs: [
    {
      assess: ImportanceDimensionAssessment,
      display: TotalImportanceDimensionDisplay,
      compatibleDimensions: ["importance", "total_importance"],
    }
  ],
  async appletRenderers(
    appAgentWebsocket: AppAgentClient,
    weStore: NeighbourhoodServices,
    appletAppInfo: AppletInfo[],
  ): Promise<AppletRenderers> {
    return {
      full(element: HTMLElement, registry: CustomElementRegistry) {
        registry?.define("feed-applet", FeedApplet);
        element.innerHTML = `<feed-applet></feed-applet>`;
        const appletElement = element.querySelector("feed-applet") as any;
        appletElement.appAgentWebsocket = appAgentWebsocket;
        appletElement.appletAppInfo = appletAppInfo;
        appletElement.sensemakerStore = weStore.sensemakerStore;
      },
      resourceRenderers: {
        "post": (element: HTMLElement, resourceHash: EntryHash) => {
          console.log('trying to render post', resourceHash) 
          render(html`
            <post-display-wrapper
              .resourceHash=${resourceHash}
              .appAgentWebsocket=${appAgentWebsocket}
            ></post-display-wrapper>
          `, element)
        }
      }
    };
  },
};

export default feedApplet;
