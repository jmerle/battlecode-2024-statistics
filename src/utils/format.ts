import { TeamStatus } from '../models.ts';

export function formatNumber(value: number, decimals: number = 0): string {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: decimals > 0 ? decimals : 0,
    maximumFractionDigits: decimals > 0 ? decimals : 0,
  });
}

export function formatTeamStatus(status: TeamStatus): string {
  switch (status) {
    case TeamStatus.Regular:
      return 'Regular team';
    case TeamStatus.Inactive:
      return 'Inactive team';
    case TeamStatus.Staff:
      return 'Staff team';
    case TeamStatus.Invisible:
      return 'Invisible team';
  }
}
