import { Anchor, Table, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { ReactNode } from 'react';

export type StatisticsTableCell = string | { label: string; to: string } | { label: string; action: () => void };
export type StatisticsTableRow =
  | [StatisticsTableCell, StatisticsTableCell]
  | [StatisticsTableCell, StatisticsTableCell, StatisticsTableCell];

export interface StatisticsTableProps {
  rows: StatisticsTableRow[];
}

export function StatisticsTable({ rows }: StatisticsTableProps): ReactNode {
  const rowElements = rows.map((row, i) => {
    const cells = row.map((cell, j) => {
      if (typeof cell === 'string') {
        return <Text key={j}>{cell}</Text>;
      } else if ('to' in cell) {
        return (
          <Anchor key={j} component={Link} to={cell.to}>
            {cell.label}
          </Anchor>
        );
      } else {
        return (
          <Anchor
            key={j}
            href="#"
            onClick={e => {
              cell.action();
              e.preventDefault();
            }}
          >
            {cell.label}
          </Anchor>
        );
      }
    });

    if (row.length === 2) {
      return (
        <Table.Tr key={i}>
          <Table.Td>{cells[0]}</Table.Td>
          <Table.Td style={{ textAlign: 'right' }}>{cells[1]}</Table.Td>
        </Table.Tr>
      );
    } else {
      return (
        <Table.Tr key={i}>
          <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap', width: '1px' }}>{cells[0]}</Table.Td>
          <Table.Td>{cells[1]}</Table.Td>
          <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{cells[2]}</Table.Td>
        </Table.Tr>
      );
    }
  });

  return (
    <Table>
      <Table.Tbody>{rowElements}</Table.Tbody>
    </Table>
  );
}
