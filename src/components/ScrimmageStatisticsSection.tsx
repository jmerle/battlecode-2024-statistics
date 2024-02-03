import { Card } from '@mantine/core';
import { ReactNode } from 'react';
import { Scrimmage, ScrimmageStatus } from '../models.ts';
import { useStore } from '../store.ts';
import { formatNumber } from '../utils/format.ts';
import { Section } from './Section.tsx';
import { StatisticsTable, StatisticsTableRow } from './StatisticsTable.tsx';

function countMatches(scrimmages: Scrimmage[]): number {
  return scrimmages.reduce((acc, val) => acc + val.maps!.length, 0);
}

export function ScrimmageStatisticsSection(): ReactNode {
  const scrimmages = useStore(state => state.filteredScrimmages);

  const scrims = scrimmages.filter(s => s.status === ScrimmageStatus.Completed && s.maps !== null);
  const rankedScrims = scrims.filter(s => s.is_ranked);
  const unrankedScrims = scrims.filter(s => !s.is_ranked);

  const matches = countMatches(scrims);
  const rankedMatches = countMatches(rankedScrims);
  const unrankedMatches = countMatches(unrankedScrims);

  const rows: StatisticsTableRow[] = [
    ['Scrimmages played', formatNumber(scrims.length)],
    ['Ranked scrimmages played', formatNumber(rankedScrims.length)],
    ['Unranked scrimmages played', formatNumber(unrankedScrims.length)],
    ['Matches played', formatNumber(matches)],
    ['Ranked matches played', formatNumber(rankedMatches)],
    ['Unranked matches played', formatNumber(unrankedMatches)],
  ];

  return (
    <Section title="Scrimmage Statistics">
      <Card.Section>
        <StatisticsTable rows={rows} />
      </Card.Section>
    </Section>
  );
}
