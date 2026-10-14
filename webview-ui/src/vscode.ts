import { VSCodeAPI } from './types';

// Acquire VS Code API once — cannot be called more than once per webview.
declare function acquireVsCodeApi(): VSCodeAPI;

let api: VSCodeAPI | null = null;

export function getVSCodeAPI(): VSCodeAPI {
  if (!api) {
    try {
      api = acquireVsCodeApi();
    } catch {
      // Running in browser dev mode — provide a mock
      api = {
        postMessage: (msg) => console.log('[mock vscode] postMessage:', msg),
        getState: () => ({}),
        setState: () => {},
      };
    }
  }
  return api;
}
