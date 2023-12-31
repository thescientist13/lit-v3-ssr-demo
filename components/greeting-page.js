import { LitElement } from 'lit';
import { html } from '@lit-labs/ssr';
import './simple-greeting.js';

export default class GreetingPage extends LitElement {

  constructor() {
    super();
    this.greeting = 'World';
  }

  render() {
    const { greeting } = this;

    return html`<simple-greeting name=${greeting}></simple-greeting>`;
  }
}

// for now these are needed for the Lit specific implementations
customElements.define('greeting-page', GreetingPage);