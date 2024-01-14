# lit-v3-ssr-demo

A repo for running Lit+SSR demos using v3.

## Setup

1. Clone the repo
1. Run `npm ci`

## Demos

- `npm run demo:greeting`
- `npm run demo:async`
- `npm run demo:document` (server only templates example)
- `npm run demo:page` (server only "components" example, e.g. no DSD - experimental)
- `npm run demo:bundle`

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

### [Server Only Templates](https://www.npmjs.com/package/@lit-labs/ssr#server-only-templates) ✅

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

> _**edit: from a call with the Lit team, they were not familiar with that `async` demo referenced and confirmed it would only have worked with hacks involved, so only current option would be to build the linked PR above from source.**_

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

### Server Only Components / No DSD❓

Similar in spirit to Server Only Templates, this "page" example demonstrates what it would be like if we could use the `LitElement` component model but "unwrap" the Declarative Shadow DOM / SSR somehow and just get straight HTML, no shadow dom.  The motivation is to be able to support [Greenwood's custom element as pages feature](https://www.greenwoodjs.io/blog/release/v0-26-0/#custom-elements-as-pages).

> _Though as pointed out in a call with the Lit team, that's kind of already what server only templates do I suppose, but combined with `async` support in components / SSR, this what a dynamic page server rendered could look like in a file-based routing context._

```js
// pages/products.js
import { LitElement } from 'lit';
import { html } from '@lit-labs/ssr';
import './card.js';

export default class ProductsPage extends LitElement {
  constructor() {
    super();
    this.products = [];
  }

  // assuming this worked to escape from the Shadow DOM
  createRenderRoot() {
    return this;
  }

  // assuming we get some sort of async support
  async connectedCallback() {
    this.products = await fetch('http://example.com/api/products').then(resp => resp.json());
  }

  render() {
    const { products } = this;

    return html`
      ${
        products.map((product, idx) => {
          const { title, thumbnail } = product;
          return html`
            <app-card
              title="${idx + 1}) ${title}"
              thumbnail="${thumbnail}"
            ></app-card>
          `;
        })
      }
    `;
  }
}

customElements.define('products-page', GreetingPage);
```

As it stands, currently a couple things are a bit of an issue, based on the current output
```sh
{
  ssrContent: '\n' +
    '  <greeting-page><template shadowroot="open" shadowrootmode="open"><!--lit-part ciKPcCd10pU=--><simple-greeting  name="World" defer-hydration><template shadowroot="open" shadowrootmode="open"><style>p { color: blue }</style><!--lit-part EvGichL14uw=--><p>Hello, <!--lit-part-->World<!--/lit-part-->!</p><!--/lit-part--></template></simple-greeting><!--/lit-part--></template></greeting-page>\n'
}
```

1. [ ] We're stuck with a wrapping `<template>`, which is part of Lit, as they are [DSD only](https://github.com/lit/lit/issues/3080).  So will have to hack around that in the meantime to extract the Light DOM only content?
1. [ ] Still getting hydration markers (`<!--lit-part-->`) but I suppose this would be fine with or without hydration?  Even when using the Server Only Templates based `html` function.

## Bundling ✅

This demo is for testing the ability to entirely bundle Lit's SSR capabilities, like if bundling and deploying to a server or Lambda environment.  Currently using Rollup for this and a basic test in _handler.js_.

```js
import { render } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js'
import { html } from 'lit';
import './components/simple-greeting.js';

const template = (name) => html`
  <simple-greeting .name="${name}"></simple-greeting>
`;

export async function handler(data) {
  const { name } = data;
  const ssrResult = render(template(name));
  const contents = await collectResult(ssrResult);

  console.log({ contents });

  return new Response(contents, { 
    headers: new Headers({
      'Content-Type': 'text/html'
    })
  });
}

(async () => {
  await handler({ 'name': 'handler' });
})();
```
<details>
  <blockquote>
    <u><i>This was actually resolved by extending rollup.config.js nodeResolve plugin to support <b>"node"</b> as an <a href="https://github.com/thescientist13/lit-v3-ssr-demo/blob/master/rollup.config.js#L11">exportCondition</a></u></i>
  </blockquote>

  Getting an error that `HTMLElement is undefined` from the bundled output.

  <pre>
    ➜  lit-v3-ssr-demo git:(master) ✗ npm run demo:bundle   

    # ...

    ReferenceError: HTMLElement is not defined
        at file:///Users/owenbuckley/Workspace/github/lit-v3-ssr-demo/build/handler.dist.js:206:752
        at ModuleJob.run (node:internal/modules/esm/module_job:193:25)
        at async Promise.all (index 0)
        at async ESMLoader.import (node:internal/modules/esm/loader:530:24)
        at async loadESM (node:internal/process/esm_loader:91:5)
        at async handleMainPromise (node:internal/modules/run_main:65:12)
  </pre>

  Interestingly, just running the unbundled version things work fine
  <pre>
  ➜  lit-v3-ssr-demo git:(master) ✗ npm run demo:no-bundle

  # ...

  {
    contents: '<!--lit-part My2136iVtRs=-->\n' +
      '  <!--lit-node 0--><simple-greeting ><template shadowroot="open" shadowrootmode="open"><style>p { color: blue }</style><!--lit-part EvGichL14uw=--><p>Hello, <!--lit-part-->handler<!--/lit-part-->!</p><!--/lit-part--></template></simple-greeting>\n' +
      '<!--/lit-part-->'
  }
  </pre>
</details>