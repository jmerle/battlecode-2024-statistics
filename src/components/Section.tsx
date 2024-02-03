import { Card, Title } from '@mantine/core';
import { ReactNode } from 'react';

export interface SectionProps {
  title: string;
  children: ReactNode;
}

export function Section({ title, children }: SectionProps): ReactNode {
  return (
    <Card withBorder shadow="sm">
      <Card.Section withBorder inheritPadding py="sm">
        <Title order={4}>{title}</Title>
      </Card.Section>

      {children}
    </Card>
  );
}
