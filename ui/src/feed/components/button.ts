import { css, CSSResult, html, PropertyValueMap, unsafeCSS } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { NHComponent } from "neighbourhoods-design-system-components";

export class NHButton extends NHComponent {
  @property()
  label!: string;
  @property()
  iconImageB64!: string;
  @property()
  disabled: boolean = false;
  @property()
  theme: string = "dark";
  @property()
  size: "stretch" | "lg" | "md" | "sm" | "icon" = "md";
  @property()
  variant:
    | "primary"
    | "success"
    | "neutral"
    | "warning"
    | "danger" = "neutral";
  @property()
  clickHandler!: () => void;

  render() {
    return html`
      <button
        type="button"
        @click=${() => this.clickHandler()}
        ?disabled=${this.disabled}
        class="btn${classMap({
          disabled: this.disabled,
          light: this.theme == "light",
          dark: this.theme == "dark",
          [this.variant]: !!this.variant,
          [this.size]: !!this.size
        })}"
      >
        <div class="button-inner">
          ${this.iconImageB64
            ? html`<img alt="button icon" src=${`data:image/svg+xml;base64,${this.iconImageB64}`} />`
            : null}<span>${this.label}</span>
        </div>
      </button>
    `;
  }

  static styles: CSSResult[] = [
    super.styles as CSSResult,
    css`
      button {
        color: var(--nh-theme-fg-default);
        padding: calc(1px * var(--nh-spacing-md))
          calc(1px * var(--nh-spacing-xl));
        border-radius: calc(1px * var(--nh-radii-sm));
        font-family: var(--nh-font-families-body);
        letter-spacing: var(--nh-letter-spacing-buttons);
        background-color: var(--nh-theme-accent-default);
        border: 1px solid transparent;
        cursor: pointer;
      }
      button.icon {
        background-color: var(--nh-theme-bg-neutral);
        width: 45px;
        height: 45px;
        padding: 0;
        border: 0;
      }
      button.primary {
        background-color: var(--nh-theme-accent-default);
      }
      button.secondary, button.secondary:hover {
        background-color: transparent;
        border: 2px solid var(--nh-theme-accent-default);
        color: var(--nh-theme-accent-default);
      }
      button.danger {
        background-color: var(--nh-theme-error-emphasis);
      }
      button.stretch {
        width: 100%;
      }
      button.lg {
        width: 145px;
      }
      button.md {
        width: 88px;
      }
      button.sm {
        width: 62px;
      }
      .button-inner {
        gap: calc(1px * var(--nh-spacing-md));
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .button-inner img {
        width: calc(1px * var(--nh-spacing-xl));
      }
      button.icon .button-inner img {
        with: auto;
      }
      button.primary.icon, button.danger.icon {
        height: 32px;
        width: 32px;
      }
      button.primary.icon img {
        height: 70%;
        width: 40px;
      }
      
      button.icon .button-inner {
        display: grid;
        gap: 0;
        height: 100%;
        place-content: center;
      }
      button:focus {
        border: 1px solid var(--nh-theme-accent-default);
      }
      button.icon:hover {
        background-color: var(--nh-theme-bg-surface);
      }
      button.secondary:hover {
        border-color: var(--nh-theme-accent-muted);
        color: var(--nh-theme-accent-muted);
      }
      button:hover, button.primary.icon:hover {
        background-color: var(--nh-theme-accent-muted);
      }
      button.danger:hover {
        background-color: var(--nh-theme-error-muted);
      }
      button:active {
        background-color: var(--nh-theme-accent-emphasis);
      }
      button.disabled, button.disabled:hover {
        color: var(--nh-theme-fg-on-disabled);
        background-color: var(--nh-theme-fg-disabled);
        border: 1px solid var(--nh-theme-fg-disabled);
        cursor: initial;
      }
      button.sm {
        line-height: var(--nh-line-heights-headlines-default);
        font-weight: var(--nh-font-weights-headlines-bold);
        font-size: calc(1px * var(--nh-font-size-sm));
      }
      button.md, button.stretch {
        line-height: var(--nh-line-heights-headlines-default);
        font-weight: var(--nh-font-weights-headlines-bold);
        font-size: calc(1px * var(--nh-font-size-md));
      }
      button.lg {
        line-height: var(--nh-line-heights-body-default);
        font-weight: var(--nh-font-weights-headlines-bold);
        font-size: calc(1px * var(--nh-font-size-xl));
      }
    `,
  ];
}
