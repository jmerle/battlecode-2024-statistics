import Highcharts from 'highcharts';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsOfflineExporting from 'highcharts/modules/offline-exporting';
import HighchartsHighContrastDarkTheme from 'highcharts/themes/high-contrast-dark';
import { formatNumber } from './format.ts';

HighchartsAccessibility(Highcharts);
HighchartsExporting(Highcharts);
HighchartsOfflineExporting(Highcharts);

const tournaments = [
  ['Sprint 1', '2024-01-16T19:00:00-05:00'],
  ['Sprint 2', '2024-01-23T19:00:00-05:00'],
  ['International & US Qualifier', '2024-01-28T19:00:00-05:00'],
  ['MIT Newbie & High School', '2024-01-31T19:00:00-05:00'],
  ['Final', '2024-02-03T19:00:00-05:00'],
];

export const highchartsOptionsBase: Highcharts.Options = {
  chart: {
    zooming: {
      type: 'x',
    },
    panning: {
      enabled: true,
      type: 'x',
    },
    panKey: 'shift',
    numberFormatter: formatNumber,
  },
  time: {
    useUTC: false,
  },
  credits: {
    href: 'javascript:window.open("https://www.highcharts.com/?credits", "_blank")',
  },
  exporting: {
    sourceWidth: 1600,
    sourceHeight: 800,
    allowHTML: true,
  },
  xAxis: {
    type: 'datetime',
    title: {
      text: 'Local Date & Time',
    },
    crosshair: {
      width: 1,
    },
    plotLines: tournaments.map(([name, timestamp]) => ({
      color: '#ccd6eb',
      zIndex: 1000,
      value: Date.parse(timestamp),
      label: {
        text: name,
        useHTML: true,
        x: 12,
        y: 0,
        rotation: 270,
        align: 'left',
        verticalAlign: 'bottom',
        style: {
          background: 'rgba(255, 255, 255, 0.5)',
          color: '#000000',
          padding: '3px',
          border: '1px solid #ccd6eb',
          borderTop: '0',
        },
      },
    })),
  },
  yAxis: {
    allowDecimals: false,
  },
  tooltip: {
    split: true,
    valueDecimals: 0,
  },
};

export function getChartThemeOptions(colorScheme: 'light' | 'dark'): Highcharts.Options {
  if (colorScheme === 'light') {
    return {};
  }

  // Highcharts themes are distributed as Highcharts extensions
  // The normal way to use them is to apply these extensions to the global Highcharts object
  // However, themes work by overriding the default options, with no way to rollback
  // To make theme switching work, we merge theme options into the local chart options instead
  // This way we don't override the global defaults and can change themes without refreshing
  // This is a little workaround to be able to get the options a theme overrides
  const highchartsMock = {
    _modules: {
      'Core/Globals.js': {
        theme: null,
      },
      'Core/Defaults.js': {
        setOptions: () => {
          // Do nothing
        },
      },
    },
  };

  HighchartsHighContrastDarkTheme(highchartsMock as any);

  return highchartsMock._modules['Core/Globals.js'].theme! as Highcharts.Options;
}
