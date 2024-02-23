import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { EntryHash } from '@holochain/client';
import { InputAssessmentControl, SensemakerStore, sensemakerStoreContext } from '@neighbourhoods/client';
import { provide } from '@lit/context';
import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';

export class LikeDimensionAssessment extends ScopedRegistryHost(InputAssessmentControl) {
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
                <div @click=${() => {}}>❤️</div>
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
