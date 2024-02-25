import { AppletConfigInput, ConfigCulturalContext, ConfigDimension, ConfigMethod, ConfigResourceDef, ConfigThreshold, Dimension, Range } from '@neighbourhoods/client'
export const INSTALLED_APP_ID = 'feed-sensemaker';

// ==========RANGES==========
const likeRange: Range = {
    "name": "1-scale",
    "kind": {
        "Integer": { "min": 0, "max": 1 }
    }
}

const totalLikesRange: Range = {
    "name": "1-scale-total",
    "kind": {
        "Integer": { "min": 0, "max": 1000000 }
    }
}

// ==========DIMENSIONS==========
const likeDimension: ConfigDimension = {
    "name": "like",
    "range": likeRange,
    "computed": false
}

const totalLikesDimension: ConfigDimension = {
    "name": "total_likes",
    "range": totalLikesRange,
    "computed": true
}

// ==========RESOURCE DEFS==========
const postItemResourceDef: ConfigResourceDef = {
    "resource_name": "post_item",
    "base_types": [{ "entry_index": 0, "zome_index": 0, "visibility": { "Public": null } }],
    "role_name": "feed",
    "zome_name": "posts"
}

// ==========METHODS==========
const totalLikesMethod: ConfigMethod = {
    "name": "total_likes_method",
    "input_dimensions": [likeDimension],
    "output_dimension": totalLikesDimension,
    "program": { "Sum": null },
    "can_compute_live": false,
    "requires_validation": false
}

// ==========THRESHOLDS==========
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

// ==========CULTURAL CONTEXTS==========
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

// ==========APPLET CONFIG==========
const appletConfig: AppletConfigInput = {
    "name": INSTALLED_APP_ID,
    "resource_defs": [postItemResourceDef],
    "ranges": [likeRange, totalLikesRange],
    "dimensions": [likeDimension, totalLikesDimension],
    "methods": [totalLikesMethod],
    "cultural_contexts": [mostLikedPostsContext, likedPostsContext]
}

export { appletConfig }