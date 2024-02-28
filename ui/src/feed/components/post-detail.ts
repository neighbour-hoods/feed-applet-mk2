import { CSSResult, css, html } from 'lit';
import { state, property } from 'lit/decorators.js';
import {
  EntryHash,
  Record,
  ActionHash,
} from '@holochain/client';
import { Task } from '@lit/task';
import { decode } from '@msgpack/msgpack';

import { Post } from '../types';
import { FeedStore } from '../../feed-store';
import { NHAssessmentContainer, NHButton, NHCard, NHComponent, NHResourceAssessmentTray } from '@neighbourhoods/design-system-components';
import { editIcon, trashIcon } from '../b64images';
import { EditPost } from './edit-post';
import applet from '../../applet-index';
import { InputAssessmentRenderer, OutputAssessmentRenderer, createInputAssessmentWidgetDelegate } from '@neighbourhoods/app-loader';
import { AppletConfig, SensemakerStore } from '@neighbourhoods/client';

export class PostDetailWidget extends NHComponent {
  @property() feedStore!: FeedStore;
  @property() sensemakerStore!: SensemakerStore;
  @property() config!: AppletConfig;
  
  @property({
    hasChanged: (newVal: ActionHash, oldVal: ActionHash) =>
      newVal?.toString() !== oldVal?.toString(),
  })
  postHash!: ActionHash;
  postEh!: EntryHash;

  @property()
  post!: Post;

  _fetchRecord = new Task(
    this,
    ([postHash]) => this.feedStore.service.fetchPost(postHash),
    () => [this.postHash]
  );

  @state()
  _editing = false;

  firstUpdated() {
    if (this.postHash === undefined) {
      throw new Error(
        `The postHash property is required for the post-detail element`
      );
    }
  }

  async deletePost() {
    try {
      await this.feedStore.service.deletePost(this.postHash);
      this.dispatchEvent(
        new CustomEvent('post-deleted', {
          bubbles: true,
          composed: true,
          detail: {
            postHash: this.postHash,
          },
        })
      );
    } catch (e: any) {
      const errorSnackbar = this.shadowRoot?.getElementById(
        'delete-error'
      ) as any;
      errorSnackbar.labelText = `Error deleting the post: ${e.data.data}`;
      errorSnackbar.show();
    }
  }
  
  createInputDelegate(dimensionName: string, resourceDefName: string) {
    return createInputAssessmentWidgetDelegate(
      this.sensemakerStore,
      this.config.dimensions[dimensionName],
      this.config.resource_defs[resourceDefName],
      this.postEh
    )
  }

  renderDetail(record: Record) {
    const post = decode((record.entry as any).Present.entry) as Post;
    return html`
      <nh-card
        .heading=${post.title}
        .textSize=${"md"}
        .footerAlign=${"l"}
        .hasContextMenu=${true}
      >
        <p>${post.text_content}</p>

        <div class="action-buttons" slot="context-menu">
          <nh-button
            .variant=${'primary'}
            .size=${'icon-sm'}
            .iconImageB64=${editIcon}
            @click=${() => { this._editing = true }}>
          </nh-button>
          <nh-button
            .variant=${'danger'}
            .size=${'icon-sm'}
            .iconImageB64=${trashIcon}
            @click=${this.deletePost}>
          </nh-button>
        </div>

        <assessment-widget-tray
          slot="footer"
          .editable=${false}
          .editing=${false}
        >
          <div slot="widgets">
            <assessment-container>
              <span slot="assessment-output">0</span>
              <input-assessment-renderer slot="assessment-control"
                  .component=${applet.assessmentWidgets.heatAssessment.component}
                  .nhDelegate=${this.createInputDelegate('Priority', 'task_item')}
              ></input-assessment-renderer>
            </assessment-container>
            <assessment-container>
              <span slot="assessment-output">0</span>
              <input-assessment-renderer slot="assessment-control"
                  .component=${applet.assessmentWidgets.importanceAssessment.component}
                  .nhDelegate=${this.createInputDelegate('Like', 'post_item')}
              ></input-assessment-renderer>
            </assessment-container>
          </div>
        </assessment-widget-tray>
      </nh-card>
    `;
  }

  renderPost(maybeRecord: Record | undefined) {
    if (!maybeRecord) return html`<span>No record found</span>`;

    if (this._editing) {
      return html`
      <edit-post-widget
        .feedStore=${this.feedStore}
        .originalPostHash=${this.postHash}
        .currentRecord=${maybeRecord}
        @submit-successful=${async () => {
          this._editing = false;
          await this._fetchRecord.run();
        }}
        @edit-canceled=${() => {
          this._editing = false;
        }}
      ></edit-post-widget>`;
    }
    return this.renderDetail(maybeRecord);
  }

  render() {
    return this._fetchRecord.render({
      pending: () => html`<sl-spinner class="icon-spinner"></sl-spinner>`,
      complete: maybeRecord => this.renderPost(maybeRecord?.record),
      error: (e: any) =>
        html`<span>Error fetching the post: ${e.data.data}</span>`,
    });
  }
  static elementDefinitions = {
    'nh-button': NHButton,
    'nh-card': NHCard,
    'edit-post-widget': EditPost,
    'input-assessment-renderer': InputAssessmentRenderer,
    'output-assessment-renderer': OutputAssessmentRenderer,
    'assessment-widget-tray': NHResourceAssessmentTray,
    'assessment-container': NHAssessmentContainer,
  }
  
  static styles: CSSResult[] = [
    super.styles as CSSResult,
    css`
      .icon-spinner {
        font-size: 2.1rem;
        --speed: 10000ms;
        --track-width: 4px;
        --indicator-color: var(--nh-theme-accent-emphasis);
        margin: 3px
      }
    `
  ];

}
