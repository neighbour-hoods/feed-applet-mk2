import { css, CSSResult, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { NHComponent, NHComponentShoelace } from "neighbourhoods-design-system-components";
import { NHCard } from "./card";
import { SlTextarea } from "@scoped-elements/shoelace";
import { ScopedElementsMixin } from '@open-wc/scoped-elements';

@customElement("nh-create-post")
export class NHCreatePost extends NHComponentShoelace {
  @property()
  prompt!: string;
  @property()
  placeholder!: string;
  @property()
  textAreaValue!: string;
  @property()
  onChangeValue!: (e: CustomEvent) => void;

  render() {
    return html`
      <nh-applet-card
        .theme=${"dark"}
        .heading=${this.prompt}
        .hasContextMenu=${false}
        .hasPrimaryAction=${true}
        .textSize=${"sm"}
        .footerAlign=${"r"}
      >
          <sl-textarea required @sl-input=${(e: CustomEvent) => this.onChangeValue(e)} value=${this.textAreaValue} filled placeholder=${this.placeholder}></sl-textarea>
          <slot slot="footer" name="footer"></slot>
      </nh-applet-card>
    `;
  }
  
  static get elementDefinitions() {
    return {
      'nh-applet-card': NHCard,
      'sl-textarea': SlTextarea
    };
  }


  static styles: CSSResult[] = [
    super.styles as CSSResult,
    css`
      /* Layout */
      :root {
        display: flex;
      }

      sl-textarea::part(textarea) {
        padding: calc(1px * var(--nh-spacing-sm));
        
        color:  var(--nh-theme-fg-default);
        background: var(--nh-theme-bg-surface);
      }
      
      sl-textarea::part(textarea):active {
        border: 1px solid var(--nh-theme-bg-surface);
      }
      sl-textarea::part(base) {
        --sl-input-font-size-medium : calc(1px * var(--nh-font-size-md));
      }
    `,
  ];
}
// color:  var(--nh-theme-bg-muted);
