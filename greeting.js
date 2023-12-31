import { render, html } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js'
import './components/simple-greeting.js';

const greetingResult = html`
  <simple-greeting name="World"></simple-greeting>
`;
const greetingHtml = await collectResult(render(greetingResult));

// greeting should say "Hello World"
console.log({ greetingHtml });