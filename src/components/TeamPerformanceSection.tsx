import { Card, Text } from '@mantine/core';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import merge from 'lodash/merge';
import { ReactNode, useMemo } from 'react';
import { useActualColorScheme } from '../hooks/use-actual-color-scheme.ts';
import { ScrimmageStatus } from '../models.ts';
import { useStore } from '../store.ts';
import { getChartThemeOptions, highchartsOptionsBase } from '../utils/chart.ts';
import { Section } from './Section.tsx';

export function TeamPerformanceSection(): ReactNode {
  const colorScheme = useActualColorScheme();

  const teams = useStore(state => state.filteredTeams);
  const scrimmagesByTeam = useStore(state => state.scrimmagesByTeam);

  const seriesByTeam = useMemo(() => {
    const series = new Map<number, Highcharts.SeriesLineOptions>();

    for (const [team, scrimmages] of scrimmagesByTeam.entries()) {
      const values: [number, number][] = [];

      const scrims = scrimmages.filter(
        s => s.status == ScrimmageStatus.Completed && s.is_ranked && s.participants !== null,
      );

      if (scrims.length > 0) {
        let scrimmageIndex = 0;

        const currentDate = new Date(Date.parse(scrims[0].created));
        currentDate.setMilliseconds(0);
        currentDate.setSeconds(0);
        currentDate.setMinutes(0);
        currentDate.setHours(currentDate.getHours() + 24);

        const endDate = Date.parse(scrims[scrims.length - 1].created);

        while (currentDate.getTime() < endDate) {
          currentDate.setHours(currentDate.getHours() + 1);

          for (let i = scrimmageIndex + 1; i < scrims.length; i++) {
            if (Date.parse(scrims[i].created) > currentDate.getTime()) {
              break;
            }

            scrimmageIndex++;
          }

          values.push([
            currentDate.getTime(),
            scrims[scrimmageIndex].participants!.find(p => p.team === team)!.rating!,
          ]);
        }
      }

      series.set(team, {
        type: 'line',
        data: values,
        marker: {
          enabled: false,
          symbol: 'circle',
        },
      });
    }

    return series;
  }, [scrimmagesByTeam]);

  const mobileLegend = useMemo(
    (): Highcharts.LegendOptions => ({
      layout: 'horizontal',
      align: 'left',
      verticalAlign: 'bottom',
      width: '100%',
      maxHeight: 100,
      alignColumns: false,
    }),
    [],
  );

  const desktopLegend = useMemo(
    (): Highcharts.LegendOptions => ({
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'top',
      width: 250,
      maxHeight: 1e6,
      alignColumns: false,
    }),
    [],
  );

  const options = useMemo((): Highcharts.Options => {
    const themeOptions = getChartThemeOptions(colorScheme);

    const chartOptions: Highcharts.Options = {
      ...highchartsOptionsBase,
      exporting: {
        chartOptions: {
          title: {
            text: 'Team Performance',
          },
        },
      },
      yAxis: {
        title: {
          text: 'Rating',
        },
      },
      title: {
        text: '',
      },
      legend: window.innerWidth < 992 ? mobileLegend : desktopLegend,
      responsive: {
        rules: [
          {
            condition: {
              callback: () => window.innerWidth < 992,
            },
            chartOptions: {
              legend: mobileLegend,
            },
          },
          {
            condition: {
              callback: () => window.innerWidth >= 992,
            },
            chartOptions: {
              legend: desktopLegend,
            },
          },
        ],
      },
      series: teams
        .filter(team => seriesByTeam.has(team.id))
        .sort((a, b) => b.profile.rating - a.profile.rating)
        .map((team, teamIndex) => {
          return {
            ...seriesByTeam.get(team.id)!,
            name: team.name,
            visible: teamIndex < 5,
          };
        }),
    };

    return merge(themeOptions, chartOptions);
  }, [colorScheme, mobileLegend, desktopLegend, teams, seriesByTeam]);

  return (
    <Section title="Team Performance">
      <Card.Section>
        <HighchartsReact highcharts={Highcharts} options={options} immutable />
      </Card.Section>

      <Card.Section inheritPadding py="sm">
        <Text>The first 24 hours of each team are hidden to account for stabilization of the initial rating.</Text>
      </Card.Section>
    </Section>
  );
}
