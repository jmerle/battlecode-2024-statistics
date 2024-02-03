import { Anchor, Checkbox, CheckboxGroupProps, Grid, Group, Stack, Text } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { ReactNode, useCallback } from 'react';
import { ScrimmageStatisticsSection } from '../components/ScrimmageStatisticsSection.tsx';
import { Section } from '../components/Section.tsx';
import { TeamDistributionSection } from '../components/TeamDistributionSection.tsx';
import { TeamMetricSection, TeamMetricSectionProps } from '../components/TeamMetricSection.tsx';
import { TeamPerformanceSection } from '../components/TeamPerformanceSection.tsx';
import { TeamStatisticsSection } from '../components/TeamStatisticsSection.tsx';
import { Eligibility, ScrimmageStatus } from '../models.ts';
import { useStore } from '../store.ts';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage(): ReactNode {
  const teamsTimestamp = useStore(state => state.teamsTimestamp!);

  const selectedEligibilities = useStore(state => state.selectedEligibilities);
  const setSelectedEligibilities = useStore(state => state.setSelectedEligibilities);

  const onEligibilityChange = useCallback<NonNullable<CheckboxGroupProps['onChange']>>(values => {
    setSelectedEligibilities(values as Eligibility[]);
  }, []);

  const scrimmagesByTeam = useStore(state => state.scrimmagesByTeam);

  const metricRating = useCallback<TeamMetricSectionProps['metric']>(team => team.profile.rating, []);

  const metricScrimmages = useCallback<TeamMetricSectionProps['metric']>(
    team => {
      const scrims = scrimmagesByTeam.get(team.id) || [];
      return scrims.filter(s => s.status === ScrimmageStatus.Completed).length;
    },
    [scrimmagesByTeam],
  );

  const metricRankedScrimmages = useCallback<TeamMetricSectionProps['metric']>(
    team => {
      const scrims = scrimmagesByTeam.get(team.id) || [];
      return scrims.filter(s => s.status === ScrimmageStatus.Completed && s.is_ranked).length;
    },
    [scrimmagesByTeam],
  );

  const metricUnrankedScrimmages = useCallback<TeamMetricSectionProps['metric']>(
    team => {
      const scrims = scrimmagesByTeam.get(team.id) || [];
      return scrims.filter(s => s.status === ScrimmageStatus.Completed && !s.is_ranked).length;
    },
    [scrimmagesByTeam],
  );

  const metricMatches = useCallback<TeamMetricSectionProps['metric']>(
    team => {
      const scrims = scrimmagesByTeam.get(team.id) || [];
      return scrims
        .filter(s => s.status === ScrimmageStatus.Completed && s.maps !== null)
        .reduce((acc, val) => acc + val.maps!.length, 0);
    },
    [scrimmagesByTeam],
  );

  const metricUnrankedMatches = useCallback<TeamMetricSectionProps['metric']>(
    team => {
      const scrims = scrimmagesByTeam.get(team.id) || [];
      return scrims
        .filter(s => s.status === ScrimmageStatus.Completed && s.maps !== null && !s.is_ranked)
        .reduce((acc, val) => acc + val.maps!.length, 0);
    },
    [scrimmagesByTeam],
  );

  const metricMatchesPerUnrankedScrimmage = useCallback<TeamMetricSectionProps['metric']>(
    team => {
      const scrims = metricUnrankedScrimmages(team);
      return scrims === 0 ? 0 : metricUnrankedMatches(team) / scrims;
    },
    [metricUnrankedScrimmages, metricUnrankedMatches],
  );

  const createStreakMetric = useCallback(
    (continueStreak: (selfScore: number, opponentScore: number) => boolean): TeamMetricSectionProps['metric'] => {
      return team => {
        const teamScrimmages = scrimmagesByTeam.get(team.id) || [];

        let longestStreak = 0;
        let currentStreak = 0;

        for (const scrimmage of teamScrimmages.filter(s => s.status == ScrimmageStatus.Completed && s.is_ranked)) {
          const selfScore = scrimmage.participants!.find(p => p.team === team.id)!.score;
          const opponentScore = scrimmage.participants!.find(p => p.team !== team.id)!.score;

          if (selfScore === null || opponentScore === null) {
            continue;
          }

          if (continueStreak(selfScore, opponentScore)) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
          } else {
            currentStreak = 0;
          }
        }

        return longestStreak;
      };
    },
    [scrimmagesByTeam],
  );

  const metricWinStreak = useCallback<TeamMetricSectionProps['metric']>(
    createStreakMetric((self, opponent) => self > opponent),
    [createStreakMetric],
  );

  const metricLoseStreak = useCallback<TeamMetricSectionProps['metric']>(
    createStreakMetric((self, opponent) => self < opponent),
    [createStreakMetric],
  );

  return (
    <Grid>
      <Grid.Col span={12}>
        <Section title="Battlecode 2024 Statistics">
          {/* prettier-ignore */}
          <Stack mt="sm" gap="xs">
            <Text>
              Based on data scraped from the Battlecode 2024 API at {teamsTimestamp.toString()}.
            </Text>
            <Text>
              The source code and raw data are available in the <Anchor href="https://github.com/jmerle/battlecode-2024-statistics" target="_blank">jmerle/battlecode-2024-statistics</Anchor> GitHub repository.
            </Text>
            <Text>
              Previous editions: <Anchor href="https://jmerle.github.io/battlecode-2022-statistics/" target="_blank">2022</Anchor> <Anchor href="https://jmerle.github.io/battlecode-2023-statistics/" target="_blank">2023</Anchor>
            </Text>
          </Stack>
        </Section>
      </Grid.Col>
      <Grid.Col span={12}>
        <Section title="Eligibility selector">
          <Stack mt="sm" gap="xs">
            <Text>
              You can filter the data shown on team eligibility. Eligibility information is based on user-reported
              eligibility, whether or not all members uploaded a resume is not public information and is thus not taken
              into account.
            </Text>
            <Checkbox.Group defaultValue={selectedEligibilities} onChange={onEligibilityChange}>
              <Group>
                <Checkbox value={Eligibility.US} label={Eligibility.US} />
                <Checkbox value={Eligibility.International} label={Eligibility.International} />
                <Checkbox value={Eligibility.MITNewbie} label={Eligibility.MITNewbie} />
                <Checkbox value={Eligibility.HighSchool} label={Eligibility.HighSchool} />
                <Checkbox value={Eligibility.NonStudent} label={Eligibility.NonStudent} />
              </Group>
            </Checkbox.Group>
          </Stack>
        </Section>
      </Grid.Col>
      <Grid.Col span={12}>
        <TeamPerformanceSection />
      </Grid.Col>
      <Grid.Col span={{ md: 4, sm: 12 }}>
        <ScrimmageStatisticsSection />
      </Grid.Col>
      <Grid.Col span={{ md: 4, sm: 12 }}>
        <TeamStatisticsSection />
      </Grid.Col>
      <Grid.Col span={{ md: 4, sm: 12 }}>
        <TeamDistributionSection />
      </Grid.Col>
      <Grid.Col span={{ md: 4, sm: 12 }}>
        <TeamMetricSection
          metric={metricScrimmages}
          title="Scrimmages Played"
          labelSingular="scrimmage"
          labelPlural="scrimmages"
        />
      </Grid.Col>
      <Grid.Col span={{ md: 4, sm: 12 }}>
        <TeamMetricSection
          metric={metricRankedScrimmages}
          title="Ranked Scrimmages Played"
          labelSingular="scrimmage"
          labelPlural="scrimmages"
        />
      </Grid.Col>
      <Grid.Col span={{ md: 4, sm: 12 }}>
        <TeamMetricSection
          metric={metricUnrankedScrimmages}
          title="Unranked Scrimmages Played"
          labelSingular="scrimmage"
          labelPlural="scrimmages"
        />
      </Grid.Col>
      <Grid.Col span={{ md: 4, sm: 12 }}>
        <TeamMetricSection metric={metricMatches} title="Matches Played" labelSingular="match" labelPlural="matches" />
      </Grid.Col>
      <Grid.Col span={{ md: 4, sm: 12 }}>
        <TeamMetricSection
          metric={metricUnrankedMatches}
          title="Unranked Matches Played"
          labelSingular="match"
          labelPlural="matches"
        />
      </Grid.Col>
      <Grid.Col span={{ md: 4, sm: 12 }}>
        <TeamMetricSection
          metric={metricMatchesPerUnrankedScrimmage}
          title="Matches Per Unranked Scrimmage"
          labelSingular="match"
          labelPlural="matches"
          decimals={2}
        />
      </Grid.Col>
      <Grid.Col span={{ md: 4, sm: 12 }}>
        <TeamMetricSection metric={metricRating} title="Rating" labelSingular="rating" labelPlural="rating" />
      </Grid.Col>
      <Grid.Col span={{ md: 4, sm: 12 }}>
        <TeamMetricSection
          metric={metricWinStreak}
          title="Longest Ranked Win Streak"
          labelSingular="scrimmage"
          labelPlural="scrimmages"
        />
      </Grid.Col>
      <Grid.Col span={{ md: 4, sm: 12 }}>
        <TeamMetricSection
          metric={metricLoseStreak}
          title="Longest Ranked Lose Streak"
          labelSingular="scrimmage"
          labelPlural="scrimmages"
        />
      </Grid.Col>
    </Grid>
  );
}
