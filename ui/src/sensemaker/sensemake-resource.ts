import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { customElement, property, state } from "lit/decorators.js";
import { LitElement, html, css, unsafeCSS } from "lit";
import { sensemakerStoreContext, SensemakerStore, getLatestAssessment } from "@neighbourhoods/client";
import { EntryHash, encodeHashToBase64, decodeHashFromBase64 } from "@holochain/client";
import { StoreSubscriber } from "lit-svelte-stores";
import { get } from "svelte/store";
import { consume } from "@lit-labs/context";
import { Assessment } from '@neighbourhoods/sensemaker-lite-types';

@customElement('sensemake-resource')
export class SensemakeResource extends ScopedElementsMixin(LitElement) {
    @consume({ context: sensemakerStoreContext })
    @state()
    public sensemakerStore!: SensemakerStore

    @property()
    resourceEh!: EntryHash

    @property()
    resourceDefEh!: EntryHash
    @property()
    latestAssessmentValue!: object

    resourceAssessments = new StoreSubscriber(this, () => this.sensemakerStore.resourceAssessments());
    activeMethod = new StoreSubscriber(this, () => this.sensemakerStore.activeMethod());

    emitAssessmentValue(value: any, resourceEh: any) {
        if(this.latestAssessmentValue == value) return;
        const options = {
            detail: {assessmentValue: value, resourceEh},
            bubbles: true,
            composed: true
        };
        this.dispatchEvent(new CustomEvent('assessment-value', options))
    }

    render() {
        const activeMethodEh = this.activeMethod.value[encodeHashToBase64(this.resourceDefEh)]
        const { inputDimensionEh, outputDimensionEh } = get(this.sensemakerStore.methodDimensionMapping())[activeMethodEh];
        const assessDimensionWidgetType = (get(this.sensemakerStore.widgetRegistry()))[encodeHashToBase64(inputDimensionEh)].assess
        const displayDimensionWidgetType = (get(this.sensemakerStore.widgetRegistry()))[encodeHashToBase64(inputDimensionEh)].display
        const assessDimensionWidget = new assessDimensionWidgetType();
        const displayDimensionWidget = new displayDimensionWidgetType();
        assessDimensionWidget.resourceEh = this.resourceEh;
        assessDimensionWidget.resourceDefEh = this.resourceDefEh
        assessDimensionWidget.dimensionEh = inputDimensionEh;
        assessDimensionWidget.methodEh = decodeHashFromBase64(activeMethodEh);
        assessDimensionWidget.sensemakerStore = this.sensemakerStore;

        const latestAssessment = get(this.sensemakerStore.myLatestAssessmentAlongDimension(encodeHashToBase64(this.resourceEh), encodeHashToBase64(inputDimensionEh)))
        if(latestAssessment !== null && latestAssessment?.value) {
            this.emitAssessmentValue(Object.values(latestAssessment.value)[0], encodeHashToBase64(this.resourceEh));
            this.latestAssessmentValue = latestAssessment.value;
        }
        assessDimensionWidget.latestAssessment = latestAssessment;

        displayDimensionWidget.assessment = getLatestAssessment(
            this.resourceAssessments.value[encodeHashToBase64(this.resourceEh)] ? this.resourceAssessments.value[encodeHashToBase64(this.resourceEh)] : [], 
            encodeHashToBase64(outputDimensionEh)
        );
        const assessWidgetStyles = assessDimensionWidgetType.styles as any;
        const displayWidgetStyles = displayDimensionWidgetType.styles as any;

        return html`
            <style>
                ${unsafeCSS(displayWidgetStyles[1])}
            </style>
            <div class="sensemake-resource">
                ${assessDimensionWidget.render()}
            </div>
        `
    }
    static get styles() {
        return [
            css`
            .sensemake-resource {
                display: grid;
                place-content: center;
                width: 100%;
                height: 100%;
            }
            ::slotted(*) {
                flex: 1;
            }
        `]};

}