import { contextProvided } from "@lit-labs/context";
import { property, state } from "lit/decorators.js";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { LitElement, html, css, PropertyValueMap } from "lit";
import { Post, WrappedEntry, WrappedPostWithAssessment } from "../types";
import { ActionHash, AppAgentCallZomeRequest, AppAgentClient, EntryHash } from "@holochain/client";
import { NHPostCard } from "./post-card";

export class PostDisplayWrapper extends ScopedElementsMixin(LitElement) {
    @property()
    resourceHash!: ActionHash;

    @property()
    appAgentWebsocket!: AppAgentClient;

    @state()
    fetchingResource = true;

    post?: WrappedEntry<Post>

    protected async firstUpdated() {
        const req: AppAgentCallZomeRequest = {
            cap_secret: null,
            role_name: "todo_lists",
            zome_name: "todo",
            fn_name: "get_latest_task",
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
        if(this.fetchingResource) return html`<mwc-circular-progress></mwc-circular-progress>`
        else {
            return html`
                <post-card .text=${this.post!.entry.text} .textContent=${this.post!.entry.text}></post-card>
            `
        }
    }

    static get scopedElements() {
        return {
            "post-card": NHPostCard,
        }
    }
}

