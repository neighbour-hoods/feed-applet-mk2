import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { AppAgentCallZomeRequest, AppAgentClient, EntryHash } from "@holochain/client";
import { Post, WrappedEntry } from "../posts/types";

import { NHComponent } from "neighbourhoods-design-system-components";
import NHPostCard from "./post-card";

@customElement('post-display-wrapper')
export class PostDisplayWrapper extends NHComponent {
    @property()
    resourceHash!: EntryHash;

    @property()
    appAgentWebsocket!: AppAgentClient;

    @state()
    fetchingResource = true;

    post?: WrappedEntry<Post>

    protected async firstUpdated() {
        const req: AppAgentCallZomeRequest = {
            cap_secret: null,
            role_name: "feed",
            zome_name: "posts",
            fn_name: "get_latest_post_with_eh",
            payload: this.resourceHash,
        }
        const post = await this.appAgentWebsocket.callZome(req);
        this.post = {
            entry: post,
            entry_hash: this.resourceHash,
            action_hash: this.resourceHash,
        }
        this.fetchingResource = false;
    }
    render() {
        return html`
            <post-card .loading=${this.fetchingResource} .isPreview=${true} .title=${!this.fetchingResource && this.post!.entry.text} .textContent=${""}></post-card>`
    }

    static elementDefinitions = {
        "post-card": NHPostCard,
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

