import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { customElement, property, state } from "lit/decorators.js";
import { LitElement, html, css, unsafeCSS, PropertyValueMap } from "lit";
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
    inputDimensionEh!: EntryHash
    @property()
    outputDimensionEh!: EntryHash

    @state()
    latestAssessmentValue!: object

    @state()
    widgets!: { assessDimensionWidget: any, displayDimensionWidget: any }

    @state()
    activeMethodEh!: string

    resourceAssessments = new StoreSubscriber(this, () => this.sensemakerStore.resourceAssessments());
    activeMethod = new StoreSubscriber(this, () => this.sensemakerStore.activeMethod());

    emitAssessmentValue(value: any, resourceEh: any, initial: boolean = true) {
        if(this.latestAssessmentValue == value) return;
        const options = {
            detail: {assessmentValue: value, resourceEh},
            bubbles: true,
            composed: true
        };
        this.dispatchEvent(new CustomEvent(initial ? 'set-initial-assessment-value' : 'update-assessment-value', options))
    }    

    getWidgets(inputDimensionEh: EntryHash, assessDimensionWidgetType: any, displayDimensionWidgetType: any){
        const assessDimensionWidget = new assessDimensionWidgetType();
        const displayDimensionWidget = new displayDimensionWidgetType();
        assessDimensionWidget.resourceEh = this.resourceEh;
        assessDimensionWidget.resourceDefEh = this.resourceDefEh;
        assessDimensionWidget.dimensionEh = inputDimensionEh;
        assessDimensionWidget.methodEh = decodeHashFromBase64(this.activeMethodEh);
        assessDimensionWidget.sensemakerStore = this.sensemakerStore;

        return {assessDimensionWidget, displayDimensionWidget};
    }

    calculateLatestAssessment(inputDimensionEh: EntryHash) {
        const initial = !this?.latestAssessmentValue;
        const latestAssessment = get(this.sensemakerStore.myLatestAssessmentAlongDimension(encodeHashToBase64(this.resourceEh), encodeHashToBase64(this.outputDimensionEh)))
        if(latestAssessment !== null && latestAssessment?.value) {
            console.log('latestAssessment :>> ', latestAssessment);
            this.emitAssessmentValue(Object.values(latestAssessment.value)[0], encodeHashToBase64(this.resourceEh));
            this.latestAssessmentValue = latestAssessment.value;
        }
        return latestAssessment;
    }

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        if(!this.activeMethod.value) return;
        this.activeMethodEh = this.activeMethod.value[encodeHashToBase64(this.resourceDefEh)];

        const { inputDimensionEh } = get(this.sensemakerStore.methodDimensionMapping())[this.activeMethodEh];
        const { assess: assessDimensionWidgetType, display: displayDimensionWidgetType } = (get(this.sensemakerStore.widgetRegistry()))[encodeHashToBase64(inputDimensionEh)];
        this.widgets = this.getWidgets(inputDimensionEh, assessDimensionWidgetType, displayDimensionWidgetType);
        
        const dimensionEhs = get(this.sensemakerStore.methodDimensionMapping())[this.activeMethodEh];
        if(!dimensionEhs) return;
        this.inputDimensionEh = dimensionEhs.inputDimensionEh; 
        this.outputDimensionEh = dimensionEhs.outputDimensionEh;
        this.widgets.assessDimensionWidget.latestAssessment = this.calculateLatestAssessment(this.inputDimensionEh);
        this.widgets.displayDimensionWidget.assessment = getLatestAssessment(
            this.resourceAssessments.value[encodeHashToBase64(this.resourceEh)] ? this.resourceAssessments.value[encodeHashToBase64(this.resourceEh)] : [], 
            encodeHashToBase64(this.outputDimensionEh)
            );
    }

    render() {
        if(!this.widgets?.assessDimensionWidget) return html``
        return html`
            <div class="sensemake-resource" @click=${() =>this.calculateLatestAssessment(this.inputDimensionEh)}>
                ${this.widgets.assessDimensionWidget.render()}
            </div>
        `;
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