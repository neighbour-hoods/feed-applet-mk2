import { consume } from '@lit-labs/context';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { LitElement, html, css } from 'lit';
import { StoreSubscriber } from 'lit-svelte-stores';
import { customElement } from 'lit/decorators.js';
import { SensemakerStore, AppletConfig } from '@neighbourhoods/client';
import { sensemakerStoreContext } from '../contexts';
import '../feed/components/page-header-card';

export const cleanForUI = (propertyName: string) =>
  propertyName.split('_').map(capitalize).join(' ');

export const capitalize = (part: string) => part[0].toUpperCase() + part.slice(1);

@customElement("context-selector")
export class ContextSelector extends ScopedElementsMixin(LitElement) {
  @consume({ context: sensemakerStoreContext })
  sensemakerStore!: SensemakerStore;

  contexts: StoreSubscriber<AppletConfig> = new StoreSubscriber(this, () =>
    this.sensemakerStore.appletConfig()
  );

  render() {
    return html`
    ${Object.keys(this.contexts?.value?.cultural_contexts).map(
      contextName => html`
        <nh-page-header-card
          slot="header"
          .heading=${cleanForUI(contextName)}
        >
          <nh-button slot="primary-action" .variant=${"primary"} .label=${"Select"} .size=${"md"} .clickHandler=${() => this.dispatchContextSelected(contextName)}></nh-button>
        </nh-page-header-card>
      `
    )}
    `;
  }
  
  dispatchContextSelected(contextName: string) {
    this.dispatchEvent(new CustomEvent('context-selected', {
      detail: {contextName},
      bubbles: true,
      composed: true
  }));
  }
}
