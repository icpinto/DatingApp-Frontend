import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ThemeContext from './shared/context/ThemeContext';
import { I18nextProvider } from './i18n';
import { QueryClient, QueryClientProvider } from './lib/react-query';

const queryClient = new QueryClient();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element with id "root" not found');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <I18nextProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeContext>
        <App />
      </ThemeContext>
    </QueryClientProvider>
  </I18nextProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
