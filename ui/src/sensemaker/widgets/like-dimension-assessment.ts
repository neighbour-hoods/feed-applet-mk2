import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { EntryHash } from '@holochain/client';
import { AssessDimensionWidget, SensemakerStore, sensemakerStoreContext } from '@neighbourhoods/client';
import { provide } from '@lit-labs/context';

@customElement('like-dimension-assessment')
export class LikeDimensionAssessment extends AssessDimensionWidget {
    @provide({ context: sensemakerStoreContext })
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
                <div @click=${() => {this.assessResource({ Integer: 1 })}}>❤️</div>
            </div>
        `
    }

    static styles = css`
        :root  * {
            width: 40px;
            height: 40px;
            font-size: 16px;
        }
    `
}
