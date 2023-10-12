import { css, CSSResult, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { NHComponent } from "neighbourhoods-design-system-components";
import { NHCard } from "./card";
import { NHAssessmentWidget } from "./assessment-widget";
import { pearImg } from "./b64images";

const kebabCase = (str: string) => str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.join('-')
    .toLowerCase();

export class NHPostCard extends NHComponent {
  @property()
  title!: string;
  @property()
  textContent!: string;
  @property()
  iconImg: string = pearImg;
  @property()
  hashtags: string[] = [];

  render() {
    return html`
      <nh-applet-card
        .theme=${"dark"}
        .heading=${this.title}
        .hasContextMenu=${true}
        .hasPrimaryAction=${false}
        .textSize=${"lg"}
        .footerAlign=${"l"}
      >
        <div class="content">
          ${this.textContent !== "" ? html`<p>${this.textContent}</p>` : null}
          ${this.hashtags.length ? html`<div class="hashtags">${this.hashtags.map(tag => html`<span class="hashtag">#${tag}</span>`)}</div>` : null}
          <slot name="image"></slot>
        </div>
        <nh-assessment-widget slot="footer" .name=${kebabCase(this.title)} .iconAlt=${`Assess post: "${this.title}"`} .iconImg=${this.iconImg}></nh-assessment-widget>
      </nh-applet-card>
    `;
  }

  static get elementDefinitions() {
    return {
      "nh-assessment-widget": NHAssessmentWidget,
      "nh-applet-card": NHCard,
    };
  }

  static styles: CSSResult[] = [
    super.styles as CSSResult,
    css`
      /* Layout */
      .content {
        display: flex;
        flex-direction: column;
        gap: calc(1px * var(--nh-spacing-sm));
      }

      p {
        margin: 0 0 calc(1px * var(--nh-spacing-lg)) 0;
      }

      div.hashtags {
        display: flex;
        gap: calc(1px * var(--nh-spacing-xl));
      }
      span.hashtag {
        color: var(--nh-theme-accent-default);
      }

      :host ::slotted([slot=image]) {
        object-fit: cover;
        height: 300px;
      }
    `,
  ];
}
