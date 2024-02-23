import { css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { Assessment, OutputAssessmentControl, RangeValueInteger } from '@neighbourhoods/client';
import { NHComponent } from '@neighbourhoods/design-system-components';

export class TotalLikesDimensionAssessment extends OutputAssessmentControl {
    render() {
        return html`
                    <div class="display-box-wrapper">
                        <div class="display-box">
                            <span>❤️</span>
                            <span>${this.assessment && ((this.assessment.value as RangeValueInteger).Integer > 1) ? (this.assessment.value as RangeValueInteger).Integer : ""}</span>
                        </div>
                    </div>
                `
    }
    static get elementDefinitions() {
        return {
        }
    }
    static styles = css`
        .display-box {
            background-color: rgb(50, 43, 55);
            width: auto;
            height: 32px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 16px;
            color: var(--nh-theme-fg-default);
            border-radius: calc(1px * var(--nh-radii-base));
            min-width: 32px;
            gap: calc(1px * var(--nh-spacing-sm));
        }
        
        .preview-container .display-box span {
            margin: 0 4px;
        }
    
        .display-box-wrapper {
            display: grid;
            align-items: center;
            justify-content: center;
        }
    `
}

