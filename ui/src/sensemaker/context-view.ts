import { LitElement, css, html } from "lit";
import { provide } from "@lit-labs/context";
import { customElement, property, state } from "lit/decorators.js";

import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { get } from "svelte/store";
import { SensemakerStore } from "@neighbourhoods/client";
import { SensemakeResource } from "./sensemake-resource";
import { StoreSubscriber } from "lit-svelte-stores";
import { FeedStore } from "../feed-store";
import { feedStoreContext, sensemakerStoreContext } from "../contexts";
import { Post } from "../feed/types";

@customElement('context-view')
export class ContextView extends ScopedElementsMixin(LitElement) {
    @provide({ context: feedStoreContext })
    @state()
    public feedStore!: FeedStore

    @provide({ context: sensemakerStoreContext })
    @state()
    public sensemakerStore!: SensemakerStore

    @property()
    contextName!: string;

    postsInContext = new StoreSubscriber(this, () => this.feedStore.tasksFromEntryHashes(get(this.sensemakerStore.contextResults())[this.contextName]));

    render() {
        // consider using `repeat()` instead of `map()`
        return html`
            ${(this.postsInContext.value as any).map((post: Post) => html`
              ${post} 1
            `)}
            `
          }
          // <sensemake-resource class="sensemake-resource"
          //     .resourceEh=${task.entry_hash} 
          //     .resourceDefEh=${get(this.sensemakerStore.appletConfig()).resource_defs["task_item"]}
          // >
          //     <task-item 
          //         .task=${task} 
          //         .completed=${('Complete' in task.entry.status)} 
          //     ></task-item>
          // </sensemake-resource>
    static get scopedElements() {
        return {
            'sensemake-resource': SensemakeResource,
        };
    }
    static get styles() {
        return [
            css`
                .sensemake-resource {
                    height: 60px;
                    display: flex;
                }
                task-item {
                    display: flex;
                    flex: 1;
                }
            `
        ]
    }
}
