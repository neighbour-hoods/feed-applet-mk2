import {
  NeighbourhoodApplet,
} from "@neighbourhoods/client";

import { FeedApplet } from "./feed-app";
import { appletConfig } from "./appletConfig";
import { HeatDimensionAssessment, LikeDimensionAssessment, TotalLikesDimensionAssessment } from "./sensemaker/widgets";

import "./feed/components/post-display-wrapper";
import { PostDisplayWrapper } from "./feed/components/post-display-wrapper";
import { AverageHeatDimensionDisplay } from "./sensemaker/widgets/average-heat-dimension-display";

const applet: NeighbourhoodApplet = {
  appletConfig: appletConfig,
  appletRenderers: {
    full: FeedApplet
  },
  resourceRenderers: {
    "post": PostDisplayWrapper as any
  },
  assessmentWidgets: {
    importanceAssessment: {
      name: "Like Assessment",
      component: LikeDimensionAssessment,
      rangeKind: { Integer: {min: 0, max: 1}},
      kind: 'input'
    },
    importanceOutput: {
      name: "Total Likes Display",
      component: TotalLikesDimensionAssessment,
      rangeKind: { Integer: { min: 0, max: 4294967295 }},
      kind: 'output'
    },
    heatAssessment: {
      name: "Heat",
      component: HeatDimensionAssessment,
      rangeKind: { Integer: {min: 0, max: 4}},
      kind: 'input'
    },
    heatOuput: {
      name: "Average Heat",
      component: AverageHeatDimensionDisplay,
      rangeKind: { Integer: { min: 0, max: 4294967295 }},
      kind: 'output'
    },
  }
  
};

export default applet;
