import { Anchor, Table } from '@mantine/core';
import { modals } from '@mantine/modals';
import { Link } from '@tanstack/react-router';
import { AugmentedTeam } from '../models.ts';

export function openTeamListModal(title: string, teams: AugmentedTeam[] | [AugmentedTeam, string][]): void {
  const rows = teams.map((value, i) => {
    const team = Array.isArray(value) ? value[0] : value;

    return (
      <Table.Tr key={i}>
        <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap', width: '1px' }}>{i + 1}.</Table.Td>
        <Table.Td>
          <Anchor component={Link} to={`/teams/${team.id}`} onClick={() => modals.closeAll()}>
            {team.name}
          </Anchor>
        </Table.Td>
        <Table.Td>{team.eligibilities.join(', ')}</Table.Td>
        {Array.isArray(value) && <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{value[1]}</Table.Td>}
      </Table.Tr>
    );
  });

  modals.open({
    title,
    size: 'xl',
    styles: {
      body: {
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 0,
      },
    },
    children: (
      <Table>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    ),
  });
}
