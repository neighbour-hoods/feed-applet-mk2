import { CSSResult, PropertyValueMap, css, html } from 'lit';
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
import { InputAssessmentRenderer, OutputAssessmentRenderer, createInputAssessmentControlDelegate } from '@neighbourhoods/app-loader';
import { AppletConfig, Dimension, Method, SensemakerStore } from '@neighbourhoods/client';
import { EntryRecord } from '@holochain-open-dev/utils';

export class PostDetailWidget extends NHComponent {
  @property() feedStore!: FeedStore;
  @property() sensemakerStore!: SensemakerStore;
  @property() config!: AppletConfig;

  @state() private _existingDimensionEntries: Array<Dimension & { dimension_eh: EntryHash }> = [];
  @state() private _existingMethodEntries!: Array<Method & { method_eh: EntryHash }>;

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
  
  async firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    if (this.postHash === undefined) {
      throw new Error(
        `The postHash property is required for the post-detail element`
      );
    }
    await this.fetchNeighbourhoodDimensions();
  }

  async fetchNeighbourhoodDimensions() {
    try {
      if (!this.sensemakerStore) return;
      await this.fetchDimensionEntries();
      await this.fetchMethodEntries();
    } catch (error) {
      console.error('Could not fetch neighbourhood dimension data: ', error);
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
    const assessableDimension = (this.config?.dimensions?.[dimensionName] || this._existingDimensionEntries?.find(dim => dim.name == dimensionName)?.dimension_eh);

    let delegate;
    try {
      if(!assessableDimension || !this.postEh) {
        console.log('assessableDimension, this.postEh, resourceDefName :>> ', assessableDimension, this.postEh, resourceDefName);
        throw new Error("Not enough details to create delegate")
      }
      delegate = createInputAssessmentControlDelegate(
        this.sensemakerStore,
        assessableDimension,
        this.config.resource_defs[resourceDefName],
        this.postEh
      )
    } catch (error) {
      console.error('Could not create working delegate :>> ', error);
    }
    return delegate
  }

  private async fetchDimensionEntries() {
    if(!this.sensemakerStore) return;
    try {
      const entryRecords = await this.sensemakerStore?.getDimensions();
      this._existingDimensionEntries = entryRecords!.map((entryRecord: EntryRecord<Dimension>) => {
        return {
          ...entryRecord.entry,
          dimension_eh: entryRecord.entryHash
        }
      })
    } catch (error) {
      console.log('Error fetching dimension details: ', error);
    }
  }

  private async fetchMethodEntries() {
    if(!this.sensemakerStore) return;
    try {
      const entryRecords = await this.sensemakerStore?.getMethods();
      this._existingMethodEntries = entryRecords!.map(entryRecord => {
        return {
          ...entryRecord.entry,
          method_eh: entryRecord.entryHash
        }
      })
    } catch (error) {
      console.log('Error fetching method details: ', error);
    }
  }

  renderDetail(record: Record) {
    const post = decode((record.entry as any).Present.entry) as Post;
    const d1 = this.createInputDelegate('Fire', 'post');
    const d2 = this.createInputDelegate('Like', 'post');

    return post && !!d1 && !!d2 
      ? html`
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
                <input-assessment-renderer
                  slot="assessment-control"
                  style="display:flex; justify-content: center"
                  .component=${applet.assessmentControls.heatAssessment.component}
                  .nhDelegate=${d1}
                ></input-assessment-renderer>
              </assessment-container>
              <assessment-container>
                <span slot="assessment-output">0</span>
                <input-assessment-renderer
                  style="display:flex; justify-content: center"
                  slot="assessment-control"
                  .component=${applet.assessmentControls.likeAssessment.component}
                  .nhDelegate=${d2}
                ></input-assessment-renderer>
              </assessment-container>
            </div>
          </assessment-widget-tray>
        </nh-card>
      `
      : html`Loading`;
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
