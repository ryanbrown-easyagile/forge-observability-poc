import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import { initTracing } from './app/tracing';
import '@atlaskit/css-reset';

initTracing('ea-notes-forge-remotes-ui');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
      <App />
  </StrictMode>
);
