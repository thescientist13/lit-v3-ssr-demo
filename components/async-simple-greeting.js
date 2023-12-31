import { html, LitElement} from 'lit';

async function getGreeting() {
  return Promise.resolve('ASYNC');
}

class SimpleGreeting extends LitElement {
  static properties = {
    name: {type: String},
  };

  async connectedCallback() {
    this.name = await getGreeting();
  }

  render() {
    return html`<p>Hello, ${this.name}!</p>`;
  }
}

customElements.define('simple-greeting', SimpleGreeting);