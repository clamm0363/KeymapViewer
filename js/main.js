const { createElement } = React;
const { createRoot } = ReactDOM;
const html = htm.bind(createElement);

import { App } from './App.js';

const root = createRoot(document.getElementById('root'));
root.render(html`<${App} />`);
