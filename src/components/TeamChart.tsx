import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import merge from 'lodash/merge';
import { ReactNode, useMemo } from 'react';
import { useActualColorScheme } from '../hooks/use-actual-color-scheme.ts';
import { getChartThemeOptions, highchartsOptionsBase } from '../utils/chart.ts';

export interface TeamChartProps {
  yAxisLabel: string;
  values: [number, number][];
}

export function TeamChart({ yAxisLabel, values }: TeamChartProps): ReactNode {
  const colorScheme = useActualColorScheme();

  const options = useMemo((): Highcharts.Options => {
    const themeOptions = getChartThemeOptions(colorScheme);

    const chartOptions: Highcharts.Options = {
      ...highchartsOptionsBase,
      chart: {
        ...highchartsOptionsBase.chart,
        height: 400,
      },
      yAxis: {
        title: {
          text: yAxisLabel,
        },
      },
      title: {
        text: '',
      },
      series: [
        {
          type: 'line',
          name: yAxisLabel,
          data: values,
          marker: {
            enabled: false,
            symbol: 'circle',
          },
        },
      ],
    };

    return merge(themeOptions, chartOptions);
  }, [colorScheme]);

  return <HighchartsReact highcharts={Highcharts} options={options} immutable />;
}
