import { css, html } from 'lit';
import { OutputAssessmentControl, RangeValueInteger } from '@neighbourhoods/client';
import { state } from 'lit/decorators.js';
import { SlSpinner } from '@scoped-elements/shoelace';

export class TotalLikesDimensionAssessment extends OutputAssessmentControl {
    @state() loading = true;

    public async loadData(): Promise<void> {
        await super.loadData()
        this.loading = false
    }

    render() {
        if (this.loading) {
            return html`<sl-spinner class="icon-spinner"></sl-spinner>`
        }
        return html`
            <div class="display-box-wrapper">
                <div class="display-box">
                    <span>❤️</span>
                    <span>${this.assessment && ((this.assessment.value as RangeValueInteger).Integer > 1) ? (this.assessment.value as RangeValueInteger).Integer : ""}</span>
                </div>
            </div>
        `
    }

    static elementDefinitions = {
        'sl-spinner': SlSpinner
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

        .icon-spinner {
            font-size: 1.2rem;
            --speed: 10000ms;
            --track-width: 4px;
            --indicator-color: var(--nh-theme-accent-emphasis);
            position: relative;
            left: 20%;
            top: 15%;
        }
    `
}

