import { render } from 'preact';
import { html } from 'htm/preact';

function App(props) {
  return html`<h1>Hello ${props.name}!</h1>`;
}

render(html`<${App} name="World" />`, document.body);
