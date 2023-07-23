import { ref } from "lit/directives/ref.js";
import { css, html, LitElement, PropertyValueMap } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { Renderer } from "@neighbourhoods/nh-launcher-applet";

@customElement('render-block')
export class RenderBlock extends LitElement {
  @property()
  renderer!: Renderer;
  @query("#root-element")
  _e!: Element;

  //@ts-ignore
  get registry() {
    //@ts-ignore
    return this.__registry;
  }

  //@ts-ignore
  set registry(registry) {
    //@ts-ignore
    this.__registry = registry;
  }

  renderRenderer() {
    if (this._e) {
      this.renderer(this._e as HTMLElement, this.registry);
    }
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this.renderRenderer()
  }
  render() {
    return html`<div
      id="root-element"
      style="display: contents"
    ></div>`;
  }

  static styles = [
    css`
      :host {
        display: contents;
      }
    `,
  ];
}
