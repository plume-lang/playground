import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '#root/src/app';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import '#assets/index.css';
import Editor from './pages/editor';
import { Error } from './components/error';

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <Error 
      error="Requested page was not found"
      description="This generally happens when the URL is malformed or the page does not exist. If you believe this is a server error, please let us know." />,
    children: [
      {
        index: true,
        element: <App />
      },
      {
        path: 'editor',
        children: [
          {
            path: ':id',
            element: <Editor />
          },
          {
            path: 'local/:id',
            element: <Editor isLocal />
          }
        ]
      },

    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
