import { css, CSSResult, html } from "lit";
import { property } from "lit/decorators.js";
import { NHComponent , NHCard, NHAssessmentWidget } from '@neighbourhoods/design-system-components';
import { SlSkeleton } from "@scoped-elements/shoelace";
import { classMap } from "lit/directives/class-map";

const kebabCase = (str: string) => str
    ?.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.join('-')
    .toLowerCase();

export default class NHPostCard extends NHComponent {
  @property()
  title!: string;
  @property()
  textContent!: string;
  @property()
  iconImg!: string;
  @property()
  loading: boolean = false;
  @property()
  isPreview: boolean = false;

  render() {
    return this.loading
    ? html`
      <nh-card
        .theme=${"light"}
        .heading=${""}
        .hasContextMenu=${!false}
        .hasPrimaryAction=${false}
        .footerAlign=${"l"}
        class="nested-card"
      ><sl-skeleton effect="sheen" class="skeleton-part"></sl-skeleton></nh-card>`
    : html`
      <nh-card
        .theme=${"light"}
        .heading=${this.title}
        .hasContextMenu=${!this.isPreview}
        .hasPrimaryAction=${false}
        .textSize=${this.isPreview ? "sm" : "lg"}
        .footerAlign=${"l"}
        class="nested-card"
      >
        <div class="content ${classMap({
          preview: this.isPreview
        })}>
          ${this.textContent !== "" ? html`<p>${this.textContent}</p>` : null}
          <slot name="image"></slot>
        </div>
        ${this.isPreview ? null : html`<nh-assessment-widget slot="footer" .name=${kebabCase(this.title)} .iconAlt=${`Assess post: "${this.title}"`} .iconImg=${this.iconImg}></nh-assessment-widget>`}
      </nh-card>
    `;
  }

  static get elementDefinitions() {
    return {
      "nh-assessment-widget": NHAssessmentWidget,
      "nh-card": NHCard,
      "sl-skeleton": SlSkeleton,
    };
  }

  static styles: CSSResult[] = [
    super.styles as CSSResult,
    css`
      /* Layout */
      .content {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      
      p {
        margin: 0 0 calc(1px * var(--nh-spacing-lg)) 0;
      }

      .content.preview p {
        margin: 0;
      }

      :host ::slotted([slot=image]) {
        object-fit: cover;
        height: 300px;
      }

      .skeleton-part {
        --color: var(--nh-theme-bg-detail);
        --sheen-color: var(--nh-theme-bg-detail);
        height: 44px;
      }
      .skeleton-part::part(indicator) {
        border-radius: calc(1px * var(--nh-radii-base));
        opacity: 1;
      }
    `,
  ];
}
