import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { AppAgentCallZomeRequest, AppAgentClient, EntryHash } from "@holochain/client";
import { Post, WrappedEntry } from "../types";
import { NHPostCard } from "./post-card";
import { NHComponent } from "neighbourhoods-design-system-components";

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
        debugger;
        const post = await this.appAgentWebsocket.callZome(req);
        this.post = {
            entry: post,
            entry_hash: this.resourceHash,
            action_hash: this.resourceHash,
        }
        this.fetchingResource = false;
    }
    render() {
        if(this.fetchingResource) return html`<mwc-circular-progress></mwc-circular-progress>`
        else {
            return html`
                <post-card .text=${this.post!.entry.text} .textContent=${this.post!.entry.text}></post-card>
            `
        }
    }

    static elementDefinitions = {
        "post-card": NHPostCard,
    }
}

