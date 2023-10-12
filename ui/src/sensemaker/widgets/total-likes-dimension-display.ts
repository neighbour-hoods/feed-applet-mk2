import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { DisplayDimensionWidget } from '@neighbourhoods/client';
import { Assessment, RangeValueInteger } from '@neighbourhoods/client';

export class TotalLikesDimensionAssessment extends DisplayDimensionWidget {

    @property()
    assessment!: Assessment | null

    render() {
        return html`
                    <div>
                        (${this.assessment ? (this.assessment.value as RangeValueInteger).Integer : 0})
                    </div>
                `
    }
    static get elementDefinitions() {
        return {
        }
    }
    static styles = css`
        .heat-scale {
            display: flex;
            flex-direction: row;
        }
    `
}

