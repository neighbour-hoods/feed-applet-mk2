import { css, html } from "lit";
import { state } from "lit/decorators.js";
import { AppAgentCallZomeRequest } from "@holochain/client";
import { Post, WrappedEntry } from "../types";

import NHPostCard from "./post-card";
import { RenderBlock } from "@neighbourhoods/client";
import { ScopedRegistryHost } from "@lit-labs/scoped-registry-mixin";
import { NHSpinner } from "@neighbourhoods/design-system-components";

export class PostDisplayWrapper extends ScopedRegistryHost(RenderBlock) {
    @state() fetchingResource = true;

    post?: WrappedEntry<Post>

    async loadData() {
        await super.loadData();
        
        if(!this.resourceHash) throw new Error('Could not fetch resource in resource renderer');

        const req: AppAgentCallZomeRequest = {
            cap_secret: null,
            role_name: "feed",
            zome_name: "posts",
            fn_name: "get_latest_post_with_eh",
            payload: this.resourceHash,
        }
        const post = await this.nhDelegate.appAgentWebsocket.callZome(req);
        this.post = {
            entry: post,
            entry_hash: this.resourceHash,
            action_hash: this.resourceHash,
        }
        this.fetchingResource = false;
    }
    render() {
        // if(this.fetchingResource) return html`<nh-spinner type=${"icon"}></nh-spinner>`

        return html`
            <post-card
                .loading=${this.fetchingResource}
                .isPreview=${true}
                .title=${!this.fetchingResource && this.post!.entry.title}
                .textContent=${!this.fetchingResource && this.post!.entry.text_content}
                .imageContent=${!this.fetchingResource && this.post!.entry.image_content}
            >
            </post-card>`
    }

    static elementDefinitions = {
        "post-card": NHPostCard,
        'nh-spinner': NHSpinner,
    }

    static get styles() {
        return [
            css`
                :host{
                    padding: calc(1px * var(--nh-spacing-sm));
                }
            `
        ]   
    }
}

