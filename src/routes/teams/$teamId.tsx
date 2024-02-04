import { Avatar, Badge, Box, Button, Card, Grid, Group, Image, Stack, Text } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { createFileRoute, Link, Navigate } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { Section } from '../../components/Section.tsx';
import { StatisticsTable, StatisticsTableRow } from '../../components/StatisticsTable.tsx';
import { TeamChart, TeamChartProps } from '../../components/TeamChart.tsx';
import { allEligibilities, Eligibility, ScrimmageStatus } from '../../models.ts';
import { useStore } from '../../store.ts';
import { formatNumber, formatTeamStatus } from '../../utils/format.ts';

export const Route = createFileRoute('/teams/$teamId')({
  component: TeamDetailPage,
});

export function TeamDetailPage(): ReactNode {
  const { teamId } = Route.useParams();

  const teams = useStore(state => state.teams);
  const scrimmagesByTeam = useStore(state => state.scrimmagesByTeam);

  const parsedTeamId = parseInt(teamId);
  const team = teams.find(t => t.id === parsedTeamId);

  if (team === undefined) {
    return <Navigate to="/" />;
  }

  let globalRank = 1;
  const rankByEligibility = Object.fromEntries(allEligibilities.map(e => [e, 1])) as Record<Eligibility, number>;

  const sortedTeams = [...teams].sort((a, b) => b.profile.rating - a.profile.rating);
  for (const t of sortedTeams) {
    if (t.id === team.id) {
      break;
    }

    globalRank++;

    for (const eligibility of t.eligibilities) {
      rankByEligibility[eligibility]++;
    }
  }

  const propertyRows: StatisticsTableRow[] = [
    ['Name', team.name],
    ['Status', formatTeamStatus(team.status)],
    ['Auto-accept ranked', team.profile.auto_accept_ranked ? 'Yes' : 'No'],
    ['Auto-accept unranked', team.profile.auto_accept_unranked ? 'Yes' : 'No'],
    ['Has active submission', team.has_active_submission ? 'Yes' : 'No'],
    ['Eligibility', team.eligibilities.join(', ')],
    ['Rating', formatNumber(team.profile.rating)],
    ['Global rank', formatNumber(globalRank)],
  ];

  for (const eligibility of team.eligibilities) {
    propertyRows.push([`${eligibility} rank`, formatNumber(rankByEligibility[eligibility])]);
  }

  const memberRows: ReactNode[] = team.members.map((member, i) => {
    return (
      <Group key={i} gap="sm" wrap="nowrap">
        <Avatar src={member.profile.avatar_url || undefined} alt={`${member.username}'s avatar`} />
        <Box>
          <Text>
            {member.username}
            {member.is_staff && (
              <Badge color="blue" size="xs" ml={4} style={{ verticalAlign: 'middle' }}>
                Staff
              </Badge>
            )}
          </Text>
          <Text fz="sm">{member.profile.school}</Text>
        </Box>
      </Group>
    );
  });

  let firstScrimmage: number | null = null;

  const ratings: TeamChartProps['values'] = [];
  const unrankedScrimmagesPlayed: TeamChartProps['values'] = [];
  const unrankedMatchesPlayed: TeamChartProps['values'] = [];
  const rankedScrimmagesPlayed: TeamChartProps['values'] = [];

  const scrimmages = scrimmagesByTeam.get(team.id) || [];
  for (const scrimmage of scrimmages) {
    if (scrimmage.status != ScrimmageStatus.Completed) {
      continue;
    }

    const date = Date.parse(scrimmage.created);

    if (firstScrimmage === null) {
      firstScrimmage = date;
    }

    if (date - firstScrimmage > 24 * 60 * 60 * 1000) {
      ratings.push([date, scrimmage.participants!.find(p => p.team === team.id)!.rating!]);
    }

    if (scrimmage.is_ranked) {
      rankedScrimmagesPlayed.push([date, rankedScrimmagesPlayed.length + 1]);
    } else {
      unrankedScrimmagesPlayed.push([date, unrankedScrimmagesPlayed.length + 1]);

      const lastMatches =
        unrankedMatchesPlayed.length > 0 ? unrankedMatchesPlayed[unrankedMatchesPlayed.length - 1][1] : 0;
      unrankedMatchesPlayed.push([date, lastMatches + scrimmage.maps!.length]);
    }
  }

  return (
    <Grid>
      <Grid.Col span={12}>
        <Button component={Link} leftSection={<IconArrowLeft size="1rem" />} to="/">
          Home
        </Button>
      </Grid.Col>
      <Grid.Col span={{ md: 4, sm: 12 }}>
        <Section title={team.name}>
          <Stack mt={team.profile.avatar_url ? undefined : 'sm'} gap="xs">
            {team.profile.avatar_url && (
              <Card.Section>
                <Image src={team.profile.avatar_url} alt="Team avatar" h={124} fit="contain" />
              </Card.Section>
            )}

            {team.profile.quote && (
              <Box>
                <Text>Quote:</Text>
                <Text>{team.profile.quote}</Text>
              </Box>
            )}

            {team.profile.biography && (
              <Box>
                <Text>Biography:</Text>
                <Text>{team.profile.biography}</Text>
              </Box>
            )}

            {team.profile.avatar_url === null &&
              team.profile.quote.length === 0 &&
              team.profile.biography.length === 0 && <Text>Team has no avatar, quote, or biography.</Text>}
          </Stack>
        </Section>
      </Grid.Col>
      <Grid.Col span={{ md: 4, sm: 12 }}>
        <Section title="Properties">
          <Card.Section>
            <StatisticsTable rows={propertyRows} />
          </Card.Section>
        </Section>
      </Grid.Col>
      <Grid.Col span={{ md: 4, sm: 12 }}>
        <Section title="Members">
          <Stack mt="sm" gap="xs">
            {memberRows}
          </Stack>
        </Section>
      </Grid.Col>
      <Grid.Col span={12}>
        <Section title="Rating">
          <Card.Section>
            <TeamChart yAxisLabel="Rating" values={ratings} />
          </Card.Section>
          <Card.Section inheritPadding py="sm">
            <Text>The first 24 hours are hidden to account for stabilization of the initial rating.</Text>
          </Card.Section>
        </Section>
      </Grid.Col>
      <Grid.Col span={12}>
        <Section title="Ranked scrimmages played">
          <Card.Section>
            <TeamChart yAxisLabel="Scrimmages" values={rankedScrimmagesPlayed} />
          </Card.Section>
        </Section>
      </Grid.Col>
      <Grid.Col span={{ md: 6, sm: 12 }}>
        <Section title="Unranked scrimmages played">
          <Card.Section>
            <TeamChart yAxisLabel="Scrimmages" values={unrankedScrimmagesPlayed} />
          </Card.Section>
        </Section>
      </Grid.Col>
      <Grid.Col span={{ md: 6, sm: 12 }}>
        <Section title="Unranked matches played">
          <Card.Section>
            <TeamChart yAxisLabel="Matches" values={unrankedMatchesPlayed} />
          </Card.Section>
        </Section>
      </Grid.Col>
    </Grid>
  );
}
