import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { EntryHash } from '@holochain/client';
import { AssessDimensionWidget, RangeValue, SensemakerStore, sensemakerStoreContext } from '@neighbourhoods/client';
import { contextProvided } from '@lit-labs/context';

@customElement('importance-dimension-assessment')
export class ImportanceDimensionAssessment extends AssessDimensionWidget {
    @contextProvided({ context: sensemakerStoreContext, subscribe: true })
    @state()
    sensemakerStore!: SensemakerStore;
    
    @property()
    resourceEh!: EntryHash

    @property()
    resourceDefEh!: EntryHash

    @property()
    dimensionEh!: EntryHash

    @property()
    methodEh!: EntryHash

    @property()
    latestAssessment = null;

    render() {
        return html`
            <div class="like-toggle">
                <div @click=${() => this.assessResource({ Integer: 1 })}>❤️</div>
            </div>
        `
    }

    static styles = css`
        .like-toggle {
            display: flex;
            flex-direction: row;
        }
    `
}
