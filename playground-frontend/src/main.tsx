import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '#root/src/app';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import '#assets/index.css';
import Editor from './pages/editor';

const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        index: true,
        element: <App />
      },
      {
        path: 'editor',
        children: [
          {
            index: true,
            element: <Editor isEmpty={true} />
          },
          {
            path: ':id',
            element: <Editor />
          },
          {
            path: 'local/:id',
            element: <Editor isLocal />
          }
        ]
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
