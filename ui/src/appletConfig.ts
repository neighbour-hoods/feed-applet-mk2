import { AppletConfigInput, CreateAppletConfigInput, ConfigCulturalContext, ConfigMethod, ConfigThreshold, Range, ConfigResourceDef, ConfigDimension } from '@neighbourhoods/client'

const likeRange: Range = {
    "name": "1-scale",
    "kind": {
        "Integer": { "min": 0, "max": 1 }
    }
}
const likeDimension: ConfigDimension = {
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
const totalLikesDimension: ConfigDimension = {
    "name": "total_likes",
    "range": totalLikesRange,
    "computed": true
}

const postItemResourceDef: ConfigResourceDef = {
    "name": "post_item",
    "base_types": [{ "entry_index": 0, "zome_index": 0, "visibility": { "Public": null } }],
    "dimensions": [likeDimension, totalLikesDimension]
}

const totalLikesMethod: ConfigMethod = {
    "name": "total_likes_method",
    "target_resource_def": postItemResourceDef,
    "input_dimensions": [likeDimension],
    "output_dimension": totalLikesDimension,
    "program": { "Sum": null },
    "can_compute_live": false,
    "requires_validation": false
}

const likesThreshold: ConfigThreshold = {
    "dimension": totalLikesDimension,
    "kind": { "GreaterThan": null },
    "value": { "Integer": 3 }
}
const noLikesThreshold: ConfigThreshold = {
    "dimension": totalLikesDimension,
    "kind": { "GreaterThan": null },
    "value": { "Integer": 0 }
}
const mostLikedPostsContext: ConfigCulturalContext = {
    "name": "most_liked_posts_(>3)",
    "resource_def": postItemResourceDef,
    "thresholds": [likesThreshold],
    "order_by": [[totalLikesDimension, { "Biggest": null }]]
}
const likedPostsContext: ConfigCulturalContext = {
    "name": "liked_posts",
    "resource_def": postItemResourceDef,
    "thresholds": [noLikesThreshold],
    "order_by": [[totalLikesDimension, { "Biggest": null }]]
}
const appletConfig: AppletConfigInput = {
    "name": "feed_applet",
    "ranges": [likeRange, totalLikesRange],
    "dimensions": [likeDimension, totalLikesDimension],
    "resource_defs": { "feed": { "posts": [postItemResourceDef] } },
    "methods": [totalLikesMethod],
    "cultural_contexts": [mostLikedPostsContext, likedPostsContext]
}

export { appletConfig }