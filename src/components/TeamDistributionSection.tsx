import { ReactNode, useCallback } from 'react';
import { allEligibilities, AugmentedTeam, Eligibility } from '../models.ts';
import { formatNumber } from '../utils/format.ts';
import { openTeamListModal } from '../utils/modals.tsx';
import { SplitTeamSection, SplitTeamSectionProps } from './SplitTeamSection.tsx';
import { StatisticsTableRow } from './StatisticsTable.tsx';

export function TeamDistributionSection(): ReactNode {
  const rowBuilder = useCallback<SplitTeamSectionProps['rowBuilder']>((teams, hasSubmission) => {
    const teamsByEligibility = new Map<Eligibility, AugmentedTeam[]>();
    const titleSuffix = hasSubmission ? ' with submission' : '';

    for (const team of teams) {
      for (const eligibility of team.eligibilities) {
        if (!teamsByEligibility.has(eligibility)) {
          teamsByEligibility.set(eligibility, []);
        }

        teamsByEligibility.get(eligibility)!.push(team);
      }
    }

    const eligibilityRows: StatisticsTableRow[] = allEligibilities
      .filter(eligibility => teamsByEligibility.has(eligibility))
      .map(eligibility => {
        const title = `${eligibility} teams`;
        const matchingTeams = teamsByEligibility.get(eligibility)!;

        return [
          title,
          {
            label: formatNumber(matchingTeams.length),
            action: () => openTeamListModal(title + titleSuffix, matchingTeams),
          },
        ];
      });

    return [
      [
        'Teams',
        {
          label: formatNumber(teams.length),
          action: () => openTeamListModal('Teams' + titleSuffix, teams),
        },
      ],
      ...eligibilityRows,
    ];
  }, []);

  return <SplitTeamSection title="Team Distribution" rowBuilder={rowBuilder} />;
}
