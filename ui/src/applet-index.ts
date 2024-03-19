import { NeighbourhoodApplet } from '@neighbourhoods/client';

import { FeedApplet } from './feed-app';
import { appletConfig } from './appletConfig';
import {
    HeatDimensionAssessment,
    LikeDimensionAssessment,
    TotalLikesDimensionAssessment,
} from './sensemaker/controls';

import { PostDisplayWrapper } from './feed/components/post-display-wrapper';
import { AverageHeatDimensionDisplay } from './sensemaker/controls/average-heat-dimension-display';

const applet: NeighbourhoodApplet = {
    appletConfig: appletConfig,
    appletRenderers: {
        full: FeedApplet,
    },
    resourceRenderers: {
        post: PostDisplayWrapper as any,
    },
    assessmentWidgets: {
        likeAssessment: {
        name: 'Like',
        component: LikeDimensionAssessment,
        rangeKind: { Integer: { min: 0, max: 1 } },
        kind: 'input',
        },
        likeOutput: {
        name: 'Total Likes',
        component: TotalLikesDimensionAssessment,
        rangeKind: { Integer: { min: 0, max: 4294967295 } },
        kind: 'output',
        },
        heatAssessment: {
        name: 'Fire',
        component: HeatDimensionAssessment,
        rangeKind: { Integer: { min: 0, max: 4 } },
        kind: 'input',
        },
        heatOuput: {
        name: 'Total Fire',
        component: AverageHeatDimensionDisplay,
        rangeKind: { Integer: { min: 0, max: 4294967295 } },
        kind: 'output',
        },
    },
};

export default applet;
