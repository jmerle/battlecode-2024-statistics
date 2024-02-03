import { Card, Tabs } from '@mantine/core';
import { ReactNode } from 'react';
import { AugmentedTeam } from '../models.ts';
import { useStore } from '../store.ts';
import { Section } from './Section.tsx';
import { StatisticsTable, StatisticsTableRow } from './StatisticsTable.tsx';

export interface SplitTeamSectionProps {
  title: string;
  rowBuilder: (teams: AugmentedTeam[], hasSubmission: boolean) => StatisticsTableRow[];
}

export function SplitTeamSection({ title, rowBuilder }: SplitTeamSectionProps): ReactNode {
  const teams = useStore(state => state.filteredTeams);
  const teamsWithSubmissions = teams.filter(t => t.has_active_submission);

  return (
    <Section title={title}>
      <Card.Section>
        <Tabs keepMounted={false} defaultValue="all">
          <Tabs.List grow>
            <Tabs.Tab value="all">All teams</Tabs.Tab>
            <Tabs.Tab value="submissions">Teams with submissions</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="all">
            <StatisticsTable rows={rowBuilder(teams, false)} />
          </Tabs.Panel>

          <Tabs.Panel value="submissions">
            <StatisticsTable rows={rowBuilder(teamsWithSubmissions, true)} />
          </Tabs.Panel>
        </Tabs>
      </Card.Section>
    </Section>
  );
}
