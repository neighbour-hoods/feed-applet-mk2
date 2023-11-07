import { css, html } from "lit";
import { consume } from "@lit-labs/context";
import { property, state } from "lit/decorators.js";

import { ComputeContextInput, SensemakerStore } from "@neighbourhoods/client";
import { SensemakeResource } from "./sensemake-resource";
import { StoreSubscriber } from "lit-svelte-stores";
import { FeedStore } from "../feed-store";
import { feedStoreContext, sensemakerStoreContext } from "../contexts";
import { ActionHash, EntryHash, encodeHashToBase64 } from "@holochain/client";
import { NHComponent } from "neighbourhoods-design-system-components";
import { PostDetailWidget } from "../feed/widgets/post-detail";
import { NHAssessmentWidget } from "../feed/components/assessment-widget";
import { get } from "@holochain-open-dev/stores";

export class ContextView extends NHComponent {
    @consume({ context: feedStoreContext })
    @state()
    public feedStore!: FeedStore

    @consume({ context: sensemakerStoreContext })
    @state()
    public sensemakerStore!: SensemakerStore

    @property()
    contextName: string = "";

    @property()
    selected: boolean = false;

    @state()
    _filteredEntryHashes: EntryHash[] = [];

    private _contextResults = new StoreSubscriber(this, () => this.sensemakerStore.contextResults());

    private _postsInContext = new StoreSubscriber(this, () => this.feedStore.entryActionHashTuplesFromEntryHashes(this._filteredEntryHashes), () => [this._filteredEntryHashes]);

    private _allPostsForAssessment = new StoreSubscriber(this, () => {
        return this.feedStore?.allPostsForAssessment;
    });
    
    async updated(_changedProperties: any,) {
        if(this.contextName === "" || typeof _changedProperties.get("selected") == 'undefined') return 
        
        const config = get(this.sensemakerStore.flattenedAppletConfigs());
        const resourceEhs : any = (this._allPostsForAssessment.value).status == 'complete' ? this._allPostsForAssessment.value.value.map(([eH, aH]) => eH) : [];
        const input : ComputeContextInput = { resource_ehs: resourceEhs, context_eh: config.cultural_contexts[this.contextName], can_publish_result: false} 
        
        this._filteredEntryHashes = await this.sensemakerStore.computeContext(this.contextName, input);
    }
    
    renderList(hashes: [EntryHash, ActionHash][]) {
        if (hashes.length === 0) return html`<span>No posts found.</span>`;
        return html`
        <div
        class="posts-container"
        style="display: flex; flex-direction: column; gap: calc(1px * var(--nh-spacing-sm))"
        >
        ${hashes.map(([entryHash, actionHash]) => {
            return html`
                <post-detail-widget .postHash=${actionHash} .postEh=${entryHash}>
                
                <nh-assessment-widget
                    @set-initial-assessment-value=${function (e: CustomEvent) {
                    let { assessmentValue, resourceEh } = (e as any).detail;
                    let myHash = encodeHashToBase64(
                        (e as any).currentTarget.parentElement.postEh
                    );
                    if (myHash === resourceEh) {
                        (e.currentTarget as any).assessmentCount =
                        assessmentValue;
                    }
                    }}
                    @update-assessment-value=${function (e: CustomEvent) {
                    let { assessmentValue, resourceEh } = (e as any).detail;
                    let myHash = encodeHashToBase64(
                        (e as any).currentTarget.parentElement.postEh
                    );
                    if (myHash === resourceEh) {
                        (e.currentTarget as any).assessmentCount +=
                        assessmentValue;
                    }
                    }}
                    slot="footer" .name=${'ok'} .iconAlt=${''} .iconImg=${''}>
                    <sensemake-resource
                        slot="icon"
                        style="z-index: 1; position: relative;"
                        .resourceEh=${entryHash}
                        .resourceDefEh=${
                                get(this.sensemakerStore.flattenedAppletConfigs()).resource_defs['feed']['posts'][
                                'post_item'
                                ]
                        }
                    >
                    </nh-assessment-widget>
                    </sensemake-resource>
                </post-detail-widget>
            `;
        })}
        </div>`;
    }

    render() {
        if(this.contextName === "") return html`<p>No context selected.</p>`;

        const allContextRecords = (this._postsInContext?.value as any);

        if(!allContextRecords || !this._contextResults?.value[this.contextName]) return html`<p>No context results.</p>`;
        
        const contextResultEntryHashes = this._contextResults?.value[this.contextName].map(eH => encodeHashToBase64(eH));

        return this.renderList(allContextRecords.filter((record: [EntryHash, ActionHash]) =>contextResultEntryHashes.includes(encodeHashToBase64(record[0])) ));
    }
    
    static elementDefinitions = {
        'sensemake-resource': SensemakeResource,
        'nh-assessment-widget': NHAssessmentWidget,
        'post-detail-widget': PostDetailWidget,
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
