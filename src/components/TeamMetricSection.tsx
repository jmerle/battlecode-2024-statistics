import { Anchor, Card } from '@mantine/core';
import { ReactNode } from 'react';
import { AugmentedTeam } from '../models.ts';
import { useStore } from '../store.ts';
import { formatNumber } from '../utils/format.ts';
import { openTeamListModal } from '../utils/modals.tsx';
import { Section } from './Section.tsx';
import { StatisticsTable, StatisticsTableRow } from './StatisticsTable.tsx';

export interface TeamMetricSectionProps {
  metric: (team: AugmentedTeam) => number;
  title: string;
  labelSingular: string;
  labelPlural: string;
  decimals?: number;
}

export function TeamMetricSection({
  metric,
  title,
  labelSingular,
  labelPlural,
  decimals,
}: TeamMetricSectionProps): ReactNode {
  const teams = useStore(state => state.filteredTeams);

  const sortedTeams = teams
    .map(team => [team, metric(team)] as [AugmentedTeam, number])
    .sort((a, b) => b[1] - a[1])
    .map(
      ([team, value]) =>
        [team, `${formatNumber(value, decimals || 0)} ${value === 1 ? labelSingular : labelPlural}`] as [
          AugmentedTeam,
          string,
        ],
    );

  const rowsTop10: StatisticsTableRow[] = sortedTeams.slice(0, 10).map(([team, value], i) => [
    `${i + 1}.`,
    {
      label: team.name,
      to: `/teams/${team.id}`,
    },
    value,
  ]);

  return (
    <Section title={title}>
      <Card.Section withBorder>
        <StatisticsTable rows={rowsTop10} />
      </Card.Section>

      <Card.Section inheritPadding py="xs">
        <Anchor
          href="#"
          onClick={e => {
            openTeamListModal(title, sortedTeams);
            e.preventDefault();
          }}
        >
          More...
        </Anchor>
      </Card.Section>
    </Section>
  );
}
