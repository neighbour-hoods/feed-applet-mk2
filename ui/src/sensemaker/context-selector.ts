import { consume } from '@lit/context';
import { LitElement, html, css } from 'lit';
import { StoreSubscriber } from 'lit-svelte-stores';
import { customElement, state } from 'lit/decorators.js';
import { SensemakerStore, AppletConfig } from '@neighbourhoods/client';
import { sensemakerStoreContext } from '../contexts';
import { NHButton } from '../feed/components/button';
import { NHPageHeaderCard } from '../feed/components/page-header-card';
import { NHComponent } from '@neighbourhoods/design-system-components';

export const cleanForUI = (propertyName: string) =>
  propertyName.split('_').map(capitalize).join(' ');

export const capitalize = (part: string) => part[0].toUpperCase() + part.slice(1);

export class ContextSelector extends NHComponent {
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
    if(!this.activeContextIndex){
      this.activeContextIndex = contexts.findIndex((contextName: string) => this._selectedContext == contextName);
      
      if(this.activeContextIndex == -1) {
        this.activeContextIndex = 0; // cycles index back around
      }
      this.dispatchContextSelected(contexts[this.activeContextIndex])
    }
console.log('this._selectedContext :>> ', this._selectedContext);
    return html`
        <nh-page-header-card
          style="height: 7rem; display: block"
          slot="header"
          .heading=${this._selectedContext ? cleanForUI(contexts[this.activeContextIndex]) : '-'}
        >
          <nh-applet-button slot="secondary-action" .disabled=${this.activeContextIndex == 0} .variant=${"secondary"} .label=${"Previous"} .size=${"md"} .clickHandler=${() => {
            const newIndex = Math.max.apply(null, [0, this.activeContextIndex - 1]);
            if(newIndex !== this.activeContextIndex) {
              this._selectedContext = contexts[newIndex];
              this.activeContextIndex = newIndex;
              this.dispatchContextSelected(contexts[this.activeContextIndex]);
              this.dispatchEvent(new CustomEvent('enter-left', {
                bubbles: true,
                composed: true
            }));
            }
          }
          }></nh-applet-button>
          <nh-applet-button slot="primary-action" .disabled=${this.activeContextIndex == contexts.length - 1} .variant=${"primary"} .label=${"Next"} .size=${"md"} .clickHandler=${() => {
            const newIndex = Math.min.apply(null, [ Object.keys(this.config?.value?.cultural_contexts).length - 1, this.activeContextIndex + 1]);
            if(newIndex !== this.activeContextIndex) {
              this._selectedContext = contexts[newIndex];
              this.activeContextIndex = newIndex;
              this.dispatchContextSelected(contexts[this.activeContextIndex]);
              this.dispatchEvent(new CustomEvent('enter-right', {
                bubbles: true,
                composed: true
            }));
            }
          }
          }></nh-applet-button>
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
      'nh-applet-button': NHButton,
      'nh-page-header-card': NHPageHeaderCard,
    };
  }

}
