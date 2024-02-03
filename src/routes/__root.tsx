import { Center, LoadingOverlay } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { createRootRoute, Navigate, Outlet } from '@tanstack/react-router';
import * as localForage from 'localforage';
import * as pako from 'pako';
import * as React from 'react';
import { ReactNode, Suspense, useEffect } from 'react';
import { ColorSchemeSwitch } from '../components/ColorSchemeSwitch.tsx';
import { DataFiles } from '../models.ts';
import { useStore } from '../store.ts';
import classes from './__root.module.css';

const TanStackRouterDevtools = import.meta.env.DEV
  ? React.lazy(() =>
      import('@tanstack/router-devtools').then(res => ({
        default: res.TanStackRouterDevtools,
      })),
    )
  : () => null;

localForage.config({
  name: 'battlecode-2024-statistics',
});

export const Route = createRootRoute({
  component: Root,
});

function getInitialRoute(): string | null {
  const { search } = window.location;
  if (!search.startsWith('?')) {
    return null;
  }

  return search.substring(1);
}

async function request(url: string): Promise<Response> {
  const response = await fetch(url);
  if (!response.ok) {
    console.error(response);
    throw new Error(`Something went wrong while retrieving '${url}', see the browser console for more details`);
  }

  return response;
}

async function loadData<T extends keyof DataFiles>(key: T): Promise<[DataFiles[T], Date]> {
  const timestampKey = `${key}-timestamp`;
  const dataKey = `${key}-data`;

  const localTimestamp = await localForage.getItem(timestampKey);
  const latestTimestampResponse = await request(import.meta.env.BASE_URL + `${key}.txt`);
  const latestTimestamp = parseInt(await latestTimestampResponse.text());

  if (localTimestamp === latestTimestamp) {
    const localData = await localForage.getItem(dataKey);
    if (localData !== null) {
      return [localData as DataFiles[T], new Date(localTimestamp)];
    }
  }

  const dataResponse = await request(import.meta.env.BASE_URL + `${key}.bin`);
  const latestData = JSON.parse(pako.inflate(await dataResponse.arrayBuffer(), { to: 'string' }));

  await localForage.setItem(dataKey, latestData);
  await localForage.setItem(timestampKey, latestTimestamp);

  return [latestData, new Date(latestTimestamp)];
}

function Root(): ReactNode {
  const initialRoute = getInitialRoute();

  const teamsTimestamp = useStore(state => state.teamsTimestamp);
  const scrimmagesTimestamp = useStore(state => state.scrimmagesTimestamp);

  const setTeams = useStore(state => state.setTeams);
  const setScrimmages = useStore(state => state.setScrimmages);

  useEffect(() => {
    if (initialRoute !== null) {
      return;
    }

    (async () => {
      const [data, timestamp] = await loadData('teams');
      setTeams(data, timestamp);
    })();

    (async () => {
      const [data, timestamp] = await loadData('scrimmages');
      setScrimmages(data, timestamp);
    })();
  }, [initialRoute]);

  if (initialRoute !== null) {
    return <Navigate to={initialRoute} />;
  }

  if (teamsTimestamp === null || scrimmagesTimestamp === null) {
    return <LoadingOverlay visible />;
  }

  return (
    <ModalsProvider>
      <div className={classes.container}>
        <Outlet />
        <Center>
          <ColorSchemeSwitch />
        </Center>
      </div>
      <Suspense fallback={null}>
        <TanStackRouterDevtools />
      </Suspense>
    </ModalsProvider>
  );
}
