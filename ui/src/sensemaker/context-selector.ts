import { consume } from '@lit-labs/context';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { LitElement, html, css } from 'lit';
import { StoreSubscriber } from 'lit-svelte-stores';
import { customElement, state } from 'lit/decorators.js';
import { SensemakerStore, AppletConfig } from '@neighbourhoods/client';
import { sensemakerStoreContext } from '../contexts';
import { NHButton } from '../feed/components/button';
import { NHPageHeaderCard } from '../feed/components/page-header-card';

export const cleanForUI = (propertyName: string) =>
  propertyName.split('_').map(capitalize).join(' ');

export const capitalize = (part: string) => part[0].toUpperCase() + part.slice(1);

@customElement("context-selector")
export class ContextSelector extends ScopedElementsMixin(LitElement) {
  @consume({ context: sensemakerStoreContext })
  sensemakerStore!: SensemakerStore;

  config: StoreSubscriber<AppletConfig> = new StoreSubscriber(this, () =>
    this.sensemakerStore.flattenedAppletConfigs()
  );
  @state()
  _selectedContext: string = "";
  @state()
  activeContextIndex!: number;

  render() {
    const contexts = Object.keys(this.config?.value?.cultural_contexts);
    this.activeContextIndex = contexts.findIndex((contextName: string) => this._selectedContext == contextName);
    if(this.activeContextIndex == -1) {
      this.activeContextIndex = 0; // cycles index back around
    }
    return html`
        <nh-page-header-card
          slot="header"
          .heading=${cleanForUI(contexts[this.activeContextIndex])}
        >
          <nh-button-applet slot="secondary-action" .variant=${"secondary"} .label=${"Cycle"} .size=${"md"} .clickHandler=${() => this._selectedContext = contexts[this.activeContextIndex + 1]}></nh-button-applet>
          <nh-button-applet slot="primary-action" .variant=${"primary"} .label=${"Calculate"} .size=${"md"} .clickHandler=${() => this.dispatchContextSelected(contexts[this.activeContextIndex])}></nh-button-applet>
        </nh-page-header-card>
      `
    
  }
  
  dispatchContextSelected(contextName: string) {
    this.dispatchEvent(new CustomEvent('context-selected', {
      detail: {contextName},
      bubbles: true,
      composed: true
  }));
  }
  static get elementDefinitions() {
    return {
      'nh-button-applet': NHButton,
      'nh-page-header-card': NHPageHeaderCard,
    };
  }

}
