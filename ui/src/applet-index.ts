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

import { LikeDimensionAssessment, TotalLikesDimensionAssessment } from "./sensemaker/widgets";

import { FeedApplet } from "./applet/feed-applet";
import { appletConfig } from "./appletConfig";
import { html, render } from "lit";

const feedApplet: NeighbourhoodApplet = {
  appletConfig: appletConfig,
  widgetPairs: [
    {
      assess: LikeDimensionAssessment,
      display: TotalLikesDimensionAssessment,
      compatibleDimensions: ["like", "total_likes"],
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
        "post_item": (element: HTMLElement, resourceHash: EntryHash) => {
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
