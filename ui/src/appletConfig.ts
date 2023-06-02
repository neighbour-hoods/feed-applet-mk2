import { AppletConfigInput, ConfigCulturalContext, ConfigMethod, ConfigResourceType, ConfigThreshold, Dimension, Range } from '@neighbourhoods/sensemaker-lite-types'

const likeRange: Range = {
    "name": "1-scale",
    "kind": {
        "Integer": { "min": 0, "max": 1 }
    }
}
const likeDimension: Dimension = {
    "name": "like",
    "range": likeRange,
    "computed": false
}

const totalLikesRange: Range = {
    "name": "1-scale-total",
    "kind": {
        "Integer": { "min": 0, "max": 1000000 }
    }
}
const totalLikesDimension = {
    "name": "total_likes",
    "range": totalLikesRange,
    "computed": true
}

const postItemResourceType: ConfigResourceType = {
    "name": "post_item",
    "base_types": [{ "entry_index": 0, "zome_index": 0, "visibility": { "Public": null } }],
    "dimensions": [likeDimension, totalLikesDimension]
}

const totalLikesMethod: ConfigMethod = {
    "name": "total_likes_method",
    "target_resource_type": postItemResourceType,
    "input_dimensions": [likeDimension],
    "output_dimension": totalLikesDimension,
    "program": { "Sum": null },
    "can_compute_live": false,
    "must_publish_dataset": false
}

const likesThreshold: ConfigThreshold = {
    "dimension": totalLikesDimension,
    "kind": { "GreaterThan": null },
    "value": { "Integer": 0 }
}
const mostLikedPostsContext: ConfigCulturalContext = {
    "name": "most_liked_posts",
    "resource_type": postItemResourceType,
    "thresholds": [likesThreshold],
    "order_by": [[totalLikesDimension, { "Biggest": null }]]
}
const appletConfig: AppletConfigInput = {
    "name": "feed_applet",
    "dimensions": [likeDimension, totalLikesDimension],
    "resource_types": [postItemResourceType],
    "methods": [totalLikesMethod],
    "cultural_contexts": [mostLikedPostsContext]
}

export default appletConfig