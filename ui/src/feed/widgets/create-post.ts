import { CSSResult, css, html } from 'lit';
import { state, property, query } from 'lit/decorators.js';
import { AppAgentClient } from '@holochain/client';
import { consume } from '@lit/context';

import { EntryRecord } from '@holochain-open-dev/utils';
import { clientContext, feedStoreContext } from '../../contexts';
import { Post } from '../posts/types';
import { FeedStore } from '../../feed-store';
import { object, string, array, InferType } from 'yup';
import { SlInput, SlTag, SlTextarea } from '@scoped-elements/shoelace';
import { NHButton, NHCard, NHComponentShoelace, NHSelectAvatar } from '@neighbourhoods/design-system-components';
import { postImagePlaceholder } from '../components/b64images';

const ADD_IMAGE_ICON = "PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA0NSA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMSIgeT0iMSIgd2lkdGg9IjQzIiBoZWlnaHQ9IjQzIiByeD0iMyIgc3Ryb2tlPSIjQ0JDQkNCIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTEgMzIuNUwxMCAyM0wxOSAzMi41TDMzIDE4TDQ0IDMyLjUiIHN0cm9rZT0iI0NCQ0JDQiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjE5IiBjeT0iMTEiIHI9IjQiIHN0cm9rZT0iI0NCQ0JDQiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPgo=";

export function isDataURL(s: string) {
  return !!s.match(isDataURL.regex);
}
isDataURL.regex = /^\s*data:([a-z]+\/[a-z0-9\-\+]+(;[a-z\-]+\=[a-z0-9\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;

export default class NHCreatePost extends NHComponentShoelace {
    @consume({ context: clientContext })
    client!: AppAgentClient;
    @consume({ context: feedStoreContext, subscribe: true })
    feedStore!: FeedStore;

    @property()
    prompt!: string;
    @property()
    textAreaValue!: string;
    @state()
    currentHashTag!: string;

    @query("nh-button")
    btn!: NHButton;
    @query("nh-select-avatar")
    postImage : any;
    
    _postSchema = object({
      title: string().min(1, "Must be at least 1 character").required(),
      text_content: string().min(1, "Must be at least 1 character").required(),
      hash_tags: array().of(string().min(1, "Must be at least 1 character")),
      image_content: string().matches(
        isDataURL.regex,
        'Must be a valid image data URI',
      ),
    });
  
    _post: InferType<typeof this._postSchema> = { title: "", text_content: "", hash_tags: [], image_content: postImagePlaceholder };

    async reset(){
      this._post = { title: "", text_content: "", hash_tags: [], image_content: postImagePlaceholder };
      this.btn.loading = false;
      this.postImage.value = ADD_IMAGE_ICON;
      await this.requestUpdate();
    }

    onHashTagEnter(e: CustomEvent) {
      debugger;
      if(e.detail.key !== "Enter") {
        this.onChangeValue.call(this, e);
        return
      }
      this._post.hash_tags?.push(e.detail.value)
    }

    onChangeValue(e: CustomEvent) {
      const inputControl = (e.currentTarget as any);

      if (['title', 'text_content'].includes(inputControl.name)) {
        this._post[inputControl.name as keyof Post] = inputControl.value; 
      } else if(inputControl.name == 'hash-tags') {
        this.currentHashTag = inputControl.value;
      }
      else {
        this._post.image_content = e.detail.avatar;
      }
      this._postSchema.validateAt(inputControl.name, this._post)
        .then(this.resetValidationErrors.bind(this))
        .catch(this.handleValidationError.bind(this))
    }

    private async onSubmit(_e: any) {
      this._postSchema.validate(this._post)
        .then(async valid => {
          if(!valid) throw new Error("post input data invalid");
          this.btn.loading = true; this.btn.requestUpdate("loading");
  
          await this.createPost()
          await this.reset()
        })
        .catch(this.handleValidationError.bind(this))
    }

    resetValidationErrors(valid: any) {
      if(typeof valid !== 'object') return
      Object.keys(valid).forEach(key => {
        const errorDOM :any = this.renderRoot.querySelector("label[name=" + key + "]")
        if(!errorDOM) return;
        errorDOM.style.visibility = 'hidden';
        errorDOM.style.opacity = '0';
      })
    }

    handleValidationError(err: any) {
      console.log("Error validating profile for field: ", err.path);
      
      const errorDOM = this.renderRoot.querySelectorAll("label[name=" + err.path + "]")
      if(errorDOM.length == 0) return;
      errorDOM.forEach((errorLabel: any) => {
        errorLabel.style.visibility = 'visible';
        errorLabel.style.opacity = '1';
        if(err.path == "image_content") return;
        const slInput : any = errorLabel.previousElementSibling;
        slInput.setCustomValidity(err.message)
        slInput.reportValidity()
      })
    }

    async createPost() {
      try {
        const record: EntryRecord<Post> = await this.feedStore.service.createPost(
          this._post as Post
        );
        this.dispatchEvent(
          new CustomEvent('post-created', {
            composed: true,
            bubbles: true,
            detail: {
              postHash: record.actionHash,
            },
          })
        );
      } catch (e: any) {
        const errorSnackbar = this.shadowRoot?.getElementById(
          'create-error'
        ) as any;
        errorSnackbar.labelText = `Error creating the post: ${e.data.data}`;
        errorSnackbar.show();
        // TODO reimplement snackbars when design is decided on error reporting
      }
    }
    
    render() {
      return html`
        <nh-card
          class="squarish"  
          .theme=${"light"}
          .heading=${"What's on your mind?"}
          .hasContextMenu=${false}
          .hasPrimaryAction=${true}
          .textSize=${"sm"}
          .footerAlign=${"c"}
        >
          <form>
            <fieldset>
              <legend>Post Content</legend>
              <div class="field">
                <sl-input size="small" type="text" name="title" placeholder=${"Enter a title"} required @sl-input=${(e: CustomEvent) => this.onChangeValue(e)} value=${this._post.title}></sl-input>
                <label class="error" for="title" name="title">⁎</label>
              </div>
              <div class="field">
                <sl-textarea size="small" @sl-input=${(e: CustomEvent) => this.onChangeValue(e)}  value=${(() => this._post.text_content)()} name="text_content" filled placeholder=${"Write your post"} resize="auto"></sl-textarea>
                <label class="error" for="text_content" name="text_content">⁎</label>
              </div>
            
              <div class="field-row">
                <div class="field">
                  <sl-input size="small" type="text" name="title" placeholder=${"Enter a hashtag/topic"} required @sl-input=${(e: CustomEvent) => this.onHashTagEnter(e)} value=${this.currentHashTag}></sl-input>
                  <label class="error" for="title" name="title">⁎</label>
                  ${ this._post.hash_tags?.length
                    ? this._post.hash_tags.map(tag => html`<sl-tag size="small" removable>Small</sl-tag>`)
                    : null
                  }
                </div>
              
                <div class="field">
                  <nh-select-avatar
                    class="image-content-input"
                    name="image_content"
                    .defaultValue=${ADD_IMAGE_ICON}
                    .shape=${"square"}
                    .label=${""}
                    @avatar-selected=${(e: CustomEvent) => this.onChangeValue(e)}
                  ></nh-select-avatar>
                  <label class="error" for="image_content" name="image_content">⁎</label>
                </div>
              </div>
            </fieldset>
          </form>
            
          <nh-button
            slot="footer"
            class="submit-post-button"
            .variant=${"primary"}
            .size=${"md"}
            @click=${async (e: Event) => await this.onSubmit(e)}
          >
            Submit Post
          </nh-button>
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
    }
  
    static styles: CSSResult[] = [
      super.styles as CSSResult,
      css`
        /* Layout */
        :root, fieldset, .field, .field-row, .image-content-input {
          display: flex;
        }
  
        form, fieldset {
          padding: 0;
        }
        legend {
          visibility: hidden;
          opacity: 0;
          height: 0;
        }
        fieldset {
          border: none;
          flex-direction: column;
        }
        .field-row {
          justify-content: space-between;
          align-items: center;
        }
        .field {
          flex-direction: column-reverse;
        }

        /* Inputs */

        sl-input::part(base),
        sl-textarea::part(textarea) {
          --sl-input-height-small: calc(2px * var(--nh-spacing-xl));
          --sl-input-border-color: transparent;
          color:  var(--nh-theme-fg-muted);
          line-height: 1rem;
          background: var(--nh-theme-bg-element);
          border-radius: calc(1px * var(--nh-radii-sm));
        }
        sl-textarea::part(base) {
          background: var(--nh-theme-bg-element);
        }
        sl-input::part(input) {
          color:  var(--nh-theme-fg-muted);
        }
  
        sl-textarea:focus::part(textarea), sl-input:focus::part(base) {
          border: none;
          box-shadow: 0px 0px 6px 2px var(--nh-theme-accent-default); 
        }
        sl-textarea:active::part(textarea), sl-input:active::part(base) {
          border: none;
          box-shadow: 0px 0px 6px 2px var(--nh-theme-accent-muted); 
        }
        sl-textarea:hover::part(textarea), sl-input:hover::part(base) {
          background: var(--nh-theme-bg-surface); 
        }

        label {
          visibility: hidden;
          opacity: 0;
          display: flex;
          width: 100%;
          justify-content: end;
          padding: 0;
          font-size: 1.2rem;
          color: var(--nh-theme-error-default);
          position: relative;
          left: 14px;
          top: 12px;
        }
      `,
    ];
  }
  