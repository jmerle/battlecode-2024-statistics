import { ReactNode, useCallback } from 'react';
import { AugmentedTeam } from '../models.ts';
import { formatNumber } from '../utils/format.ts';
import { openTeamListModal } from '../utils/modals.tsx';
import { SplitTeamSection, SplitTeamSectionProps } from './SplitTeamSection.tsx';
import { StatisticsTableRow } from './StatisticsTable.tsx';

export function TeamStatisticsSection(): ReactNode {
  const rowBuilder = useCallback<SplitTeamSectionProps['rowBuilder']>((teams, hasSubmission) => {
    const teamsBySize = new Map<number, AugmentedTeam[]>();
    let totalMembers = 0;

    for (const team of teams) {
      const memberCount = team.members.length;

      if (!teamsBySize.has(memberCount)) {
        teamsBySize.set(memberCount, []);
      }

      teamsBySize.get(memberCount)!.push(team);
      totalMembers += memberCount;
    }

    const sizeRows: StatisticsTableRow[] = [...teamsBySize.keys()]
      .sort((a, b) => a - b)
      .map(size => {
        const title = `${size}-person teams`;
        const matchingTeams = teamsBySize.get(size)!;

        return [
          title,
          {
            label: formatNumber(matchingTeams.length),
            action: () => openTeamListModal(title + (hasSubmission ? ' with submission' : ''), matchingTeams),
          },
        ];
      });

    return [['Average team size', formatNumber(totalMembers === 0 ? 0 : totalMembers / teams.length, 2)], ...sizeRows];
  }, []);

  return <SplitTeamSection title="Team Statistics" rowBuilder={rowBuilder} />;
}
