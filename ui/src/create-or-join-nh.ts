import { customElement, query } from "lit/decorators.js";
import { LitElement, html, css } from "lit";

@customElement('create-or-join-nh')
export class CreateOrJoinNh extends LitElement {
    @query('#ca-pubkey')
    input!: HTMLInputElement;

    render() {
        return html`
            <div class="nh-creation-container">
                <button outlined=true @click=${this.dispatchCreateNeighbourhood}>Create Neighbourhood</button>
                <div>
                    <input id="ca-pubkey" placeholder=${`community activator pubkey`}></input>
                    <button outlined=true @click=${this.dispatchJoinNeighbourhood}>Join Neighbourhood</button>
                </div>
            </div>
        `
    }

    dispatchCreateNeighbourhood() {
        this.dispatchEvent(new CustomEvent('create-nh'))
    }

    dispatchJoinNeighbourhood() {
        const newValue = this.input.value;
        if (newValue) {
            const options = {
                detail: {newValue},
                bubbles: true,
                composed: true
            };
            console.log('ca key', newValue)
            this.dispatchEvent(new CustomEvent('join-nh', options))
            this.input.value = ''
        }
    }

    static styles = css`
        .nh-creation-container {
            display: flex;
            flex-direction: column;
        }
    `
}
