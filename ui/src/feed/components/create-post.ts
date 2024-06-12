import { CSSResult, css, html } from 'lit';
import { state, property, query } from 'lit/decorators.js';

import { EntryRecord } from '@holochain-open-dev/utils';
// import { Post } from '../posts/types';
import { FeedStore } from '../../feed-store';
import { object, string, array, InferType } from 'yup';
import { SlInput, SlTag, SlTextarea } from '@scoped-elements/shoelace';
import { NHForm, NHButton, NHCard, NHComponent, NHSelectAvatar } from '@neighbourhoods/design-system-components';
import { postImagePlaceholder } from '../b64images';
import { SensemakerStore } from '@neighbourhoods/client';
import { parseZomeError } from '../../utils';
import { Post } from '../types';

const ADD_IMAGE_ICON = "PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA0NSA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMSIgeT0iMSIgd2lkdGg9IjQzIiBoZWlnaHQ9IjQzIiByeD0iMyIgc3Ryb2tlPSIjQ0JDQkNCIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTEgMzIuNUwxMCAyM0wxOSAzMi41TDMzIDE4TDQ0IDMyLjUiIHN0cm9rZT0iI0NCQ0JDQiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjE5IiBjeT0iMTEiIHI9IjQiIHN0cm9rZT0iI0NCQ0JDQiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPgo=";

export function isDataURL(s: string) {
  return !!s.match(isDataURL.regex);
}
isDataURL.regex = /^\s*data:([a-z]+\/[a-z0-9\-\+]+(;[a-z\-]+\=[a-z0-9\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;

export default class NHCreatePost extends NHComponent {
  @property() feedStore!: FeedStore;
  @property() sensemakerStore!: SensemakerStore;
  @property() editMode: boolean = false;
  @property() editPost?: Post;
  @property() editConfirmBtn?: NHButton;
  @property() editSubmitOverload?: (_model: object) => {};

  @state() currentHashTag!: string;

  @query("nh-select-avatar") postImage : any;
  @query('nh-form') _form!: NHForm;

  async createEntries(model: object) {
    const formData : { title?: string, text_content?: string, hash_tags?: string[] } = model;
    let postEntryRecord : EntryRecord<any>;
    let error;
    try {
      postEntryRecord = await this.feedStore.createPost({title: formData.title, text_content: formData.text_content, hash_tags: undefined, image_content: undefined} as any);
    } catch (error) {
      console.error('error :>> ', parseZomeError(error as Error));
      error = Promise.reject(Error('Error creating post: ' + parseZomeError(error as Error)))
    }
    if(error) return error;
    
    await this.updateComplete;
    this.dispatchEvent(
      new CustomEvent('post-created', {
        composed: true,
        bubbles: true,
        detail: {
          postHash: postEntryRecord!.actionHash,
        },
      })
    );
  }

  // onHashTagEnter(e: CustomEvent) {
  //   debugger;
  //   if(e.detail.key !== "Enter") {
  //     this.onChangeValue.call(this, e);
  //     return
  //   }
  //   this._post.hash_tags?.push(e.detail.value)
  // }
  
  renderForm() {
    return html`
      <nh-form
        .config=${(() => ({
          rows: [1, 1],
          submitBtnRef: (() => this.editMode ? this.editConfirmBtn : null)(),
          submitBtnLabel: (() => this.editMode ? undefined : "Submit Post")(),
          fields: [
            [
              {
              type: 'text',
              name: "title",
              id: "title",
              defaultValue: this.editMode ? this.editPost?.title : "",
              size: "medium",
              required: true,
              placeholder: 'Enter a title',
              label: 'Title',
              }
            ],
            [
              {
              type: 'textarea',
              name: "text_content",
              id: "text-content",
              defaultValue: this.editMode ? this.editPost?.text_content : "",
              size: "medium",
              required: true,
              placeholder: 'Write your post',
              label: 'Body',
              }
            ]
          ],
          submitOverload: (model: any) => this.editMode && !!this.editSubmitOverload ? this.editSubmitOverload!.call(null, model) : this.createEntries.call(this, model),
          schema: (_model: object) => (object({
            title: string().min(1, "Must be at least 1 character").required(),
            text_content: string().min(1, "Must be at least 1 character").required(),
            hash_tags: array().of(string().min(1, "Must be at least 1 character")),
            image_content: string().matches(
              isDataURL.regex,
              'Must be a valid image data URI',
            ),
          }))
        }))()}
      >
      </nh-form>
    `
  }

  render() {
    return html`
      <nh-card
        class="squarish"  
        .theme=${"dark"}
        .title=${ this.editMode ? "Edit your post" : "What's on your mind?"}
        .hasContextMenu=${false}
        .hasPrimaryAction=${false}
        .textSize=${"sm"}
        .footerAlign=${"c"}
      >
        ${this.renderForm()}
      </nh-card>
    `;
  }
  
  static elementDefinitions = {
    "sl-textarea": SlTextarea,
    "sl-input": SlInput,
    "sl-tag": SlTag,
    "nh-select-avatar": NHSelectAvatar,
    "nh-card": NHCard,
    "nh-button": NHButton,
    "nh-form": NHForm,
  }
  
  static styles: CSSResult[] = [
    super.styles as CSSResult,
    css`
      /* Layout */
      nh-form {
        flex-direction: column;
      }
    `,
  ];
}