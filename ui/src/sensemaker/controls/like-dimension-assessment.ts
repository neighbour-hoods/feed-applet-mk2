import { css, html } from 'lit';
import { state } from 'lit/decorators.js';
import { InputAssessmentControl, RangeValueInteger } from '@neighbourhoods/client';
import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import { NHIconContainer } from '@neighbourhoods/design-system-components';
import { SlSpinner } from '@scoped-elements/shoelace';

export class LikeDimensionAssessment extends ScopedRegistryHost(InputAssessmentControl) {
    @state() loading = true;
    
    assessor(value: RangeValueInteger): () => {} {
        return async () => this.assessment = (await this.nhDelegate.createAssessment(value))!.entry;
    }

    public async loadData(): Promise<void> {
        await super.loadData()
        this.loading = false
    }

    render() {
        if (this.loading) {
            return html`<sl-spinner class="icon-spinner"></sl-spinner>`
        }
        const intValue = this.assessment?.value as RangeValueInteger
        return html`
            <nh-icon
                .selected=${intValue && intValue.Integer == 1}
                .frozen=${intValue && intValue.Integer}
                @select=${this.assessor({ Integer: 1 })}
            >❤️</nh-icon>
        `
    }

    static elementDefinitions = {
        'nh-icon': NHIconContainer,
        'sl-spinner': SlSpinner
    }
    
    static styles = css`
        :host {
            line-height: 32px;
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
