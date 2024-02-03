import '@mantine/core/styles.css';

import { createTheme, MantineProvider } from '@mantine/core';
import { createRouter, Navigate, NotFoundRoute, RouterProvider } from '@tanstack/react-router';
import { ReactNode, StrictMode } from 'react';
import { Route as rootRoute } from './routes/__root.tsx';
import { routeTree } from './routeTree.gen';

const theme = createTheme({
  colors: {
    // Mantine 7.3.0 changes the dark colors to be more slightly lighter than they used to be
    // See https://mantine.dev/changelog/7-3-0/#improved-dark-color-scheme-colors for more information
    // The old dark colors offer better contrast between default text and background colors
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5c5f66',
      '#373A40',
      '#2C2E33',
      '#25262b',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
  },
});

const notFoundRoute = new NotFoundRoute({
  getParentRoute: () => rootRoute,
  component: () => <Navigate to="/" />,
});

const router = createRouter({
  routeTree,
  notFoundRoute,
  basepath: import.meta.env.BASE_URL,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function App(): ReactNode {
  return (
    <StrictMode>
      <MantineProvider theme={theme}>
        <RouterProvider router={router} />
      </MantineProvider>
    </StrictMode>
  );
}
