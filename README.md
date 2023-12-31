# lit-v3-ssr-demo

A repo for running Lit+SSR demos using v3.

## Setup

1. Clone the repo
1. Run `npm ci`

## Demos

- `npm run demo:greeting`
- `npm run demo:document` (server only templates)
- `npm run demo:async`
- `npm run demo:component` (server only components)

### Greeting ✅

This is the Greeting example taken from the [Lit playground](https://lit.dev/playground/) and following [this section of the docs](https://lit.dev/docs/ssr/server-usage/#rendering-templates) to demonstrate basic server rendering of a `LitElement`.

```js
import { html, css, LitElement} from 'lit';

class SimpleGreeting extends LitElement {
  static styles = css`p { color: blue }`;

  static properties = {
    name: {type: String},
  };

  constructor() {
    super();
    this.name = 'Somebody';
  }

  render() {
    return html`<p>Hello, ${this.name}!</p>`;
  }
}
customElements.define('simple-greeting', SimpleGreeting);
```

The code is in _greeting.js_ and you can run it with `npm run demo:greeting`.  The output is as expected with the attribute value being reflected in the output.
```sh
{
  greetingHtml: '\n' +
    '  <simple-greeting  name="World"><template shadowroot="open" shadowrootmode="open"><style>p { color: blue }</style><!--lit-part EvGichL14uw=--><p>Hello, <!--lit-part-->World<!--/lit-part-->!</p><!--/lit-part--></template></simple-greeting>\n'
}
```

### [Server Only Templates](https://www.npmjs.com/package/@lit-labs/ssr#server-only-templates) ⚠️

This is the "document" example taken from this [GitHub issue](https://github.com/lit/lit/issues/2441#issuecomment-1816903951) and following [this section of the docs](https://lit.dev/docs/ssr/server-usage/#collectresult()), primarily to demonstrate rendering a full HTML document on the server.
```js
import { render, html } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js'

const template = ({ title, lang }) => html`
  <!DOCTYPE html>
  <html lang="${lang}">
    <head>
      <!-- Works within a server only template -->
      <title>${title}</title>
    </head>
    <body>
      <p>${title}</p>
    </body>
  </html>
`;

const ssrResult = render(template({ title: 'My Website', lang: 'en'}));
const ssrContent = await collectResult(ssrResult);

console.log({ ssrContent });
```

The code is in _document.js_ and you can run it with `npm run demo:document`, though currently getting an error about invalid locations though?

<details>
  <pre>
    file:///Users/owenbuckley/Workspace/github/lit-v3-ssr-demo/node_modules/@lit-labs/ssr/lib/render-value.js:605
        throw new Error(errorMsg);
              ^

    Error:
        Unexpected final partIndex: 2 !== 3 while processing the following template:


      <!DOCTYPE html>
      <html lang="${...}">
        <head>
          <!-- Works within a server only template -->
          <title>${...}</title>
        </head>
        <body>
          <p>${...}</p>
        </body>
      </html>


        This could be because you're attempting to render an expression in an invalid location. See
        https://lit.dev/docs/templates/expressions/#invalid-locations for more information about invalid expression
        locations.
  </pre>
</details>

edit: Looks like its the `lang=${...}` bit.  If I remove it, it works fine.  I guess the question is if its intentional that it should work or not in this case, since the docs do indicate [attribute are not allowed](https://lit.dev/docs/templates/expressions/#invalid-locations).  Opened [an issue](https://github.com/lit/lit/issues/4417) with the Lit team.
```sh
{
  ssrContent: '\n' +
    '  <!DOCTYPE html>\n' +
    '  <html>\n' +
    '    <head>\n' +
    '      <!-- Works within a server only template -->\n' +
    '      <title>My Website</title>\n' +
    '    </head>\n' +
    '    <body>\n' +
    '      <p>My Website</p>\n' +
    '    </body>\n' +
    '  </html>\n'
}
```

### [Async Operations](https://github.com/lit/lit/issues/2469) ❌

There are cases where doing `async` work on the server would be nice, like fetching data or reading from the filesystem.  As an example:

> _This doesn't seem supported yet but a [PR is in draft](https://github.com/lit/lit/pull/4390) to expose these capabilities._

```js
import { html, css, LitElement} from 'lit';

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
    return html`<p>Hello, ${until(greetingLoader)}!</p>`;
  }
}

customElements.define('simple-greeting', SimpleGreeting);
```

But the contents just come out empty.

```sh
{
  greetingHtml: '\n' +
    '  <simple-greeting><template shadowroot="open" shadowrootmode="open"><!--lit-part EvGichL14uw=--><p>Hello, <!--lit-part--><!--/lit-part-->!</p><!--/lit-part--></template></simple-greeting>\n'
}
```

---

There is also [this demo](https://github.com/PonomareVlad/lit-ssr-vercel) referenced in the linked issue, but I couldn't get it working; `greetingLoader.then` worked, but the template contents were empty.  Not sure if that's because that demo is using Lit `2.x`_?


```js
import { html, css, LitElement} from 'lit';
import {until} from 'lit/directives/until.js'

async function getGreeting() {
  return Promise.resolve('ASYNC');
}

class SimpleGreeting extends LitElement {
  static styles = css`p { color: blue }`;

  static properties = {
    name: {type: String},
  };


  render() {
    const greetingLoader = getGreeting();
    greetingLoader.then(greeting => console.log({ greeting }));

    return html`<p>Hello, ${until(greetingLoader)}!</p>`;
  }
}

customElements.define('simple-greeting', SimpleGreeting);
```

### Server Only Components ❓

Similar to Server Only Templates, it would be nice if we could do something like this, and "unwrap" the Declarative Shadow DOM somehow?

```js
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

customElements.define('greeting-page', GreetingPage);
```

As it stands, currently a couple things are a bit of an issue, based on the current output
```sh
{
  ssrContent: '\n' +
    '  <greeting-page><template shadowroot="open" shadowrootmode="open"><!--lit-part ciKPcCd10pU=--><simple-greeting  name="World" defer-hydration><template shadowroot="open" shadowrootmode="open"><style>p { color: blue }</style><!--lit-part EvGichL14uw=--><p>Hello, <!--lit-part-->World<!--/lit-part-->!</p><!--/lit-part--></template></simple-greeting><!--/lit-part--></template></greeting-page>\n'
}
```

1. [ ] We're stuck with a wrapping `<template>`, which is part of Lit, as they are [DSD only](https://github.com/lit/lit/issues/3080).
1. [ ] Still getting hydration markers (`<!--lit-part-->`) but I suppose this would be fine with or without hydration?  Maybe the Server Only Templates based `html` function would help here?