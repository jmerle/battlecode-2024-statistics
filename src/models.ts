export enum TeamProfileEligibility {
  Student = 1,
  HighSchool = 2,
  US = 3,
  Newbie = 4,
}

export interface TeamProfile {
  quote: string;
  biography: string;
  has_avatar: boolean;
  avatar_url: string | null;
  rating: number;
  auto_accept_ranked: boolean;
  auto_accept_unranked: boolean;
  eligible_for: TeamProfileEligibility[];
}

export interface TeamMemberProfile {
  school: string;
  biography: string;
  avatar_url: string | null;
  has_avatar: boolean;
}

export interface TeamMember {
  id: number;
  profile: TeamMemberProfile;
  username: string;
  is_staff: boolean;
}

export enum TeamStatus {
  Regular = 'R',
  Inactive = 'X',
  Staff = 'S',
  Invisible = 'O',
}

export interface Team {
  id: number;
  profile: TeamProfile;
  episode: string;
  name: string;
  members: TeamMember[];
  status: TeamStatus;
  has_active_submission: boolean;
}

export enum ScrimmageStatus {
  Created = 'NEW',
  Queued = 'QUE',
  Running = 'RUN',
  Retry = 'TRY',
  Completed = 'OK!',
  Errored = 'ERR',
  Cancelled = 'CAN',
}

export enum ScrimmageTournamentRoundReleaseStatus {
  Hidden = 0,
  Participants = 1,
  Results = 2,
}

export interface ScrimmageTournamentRound {
  id: number;
  tournament: string;
  external_id: number;
  name: string;
  maps: string[] | null;
  release_status: ScrimmageTournamentRoundReleaseStatus;
  display_order: number;
}

export interface ScrimmageParticipant {
  team: number;
  teamname: string;
  submission: null;
  match: number;
  player_index: number;
  score: number | null;
  rating: number;
  old_rating: number;
}

export interface Scrimmage {
  id: string;
  status: ScrimmageStatus;
  episode: string;
  tournament_round: ScrimmageTournamentRound | null;
  participants: ScrimmageParticipant[] | null;
  maps: string[] | null;
  alternate_order: boolean;
  created: string;
  is_ranked: boolean;
  replay_url: string | null;
}

export interface DataFiles {
  teams: Record<string, Team>;
  scrimmages: Record<string, Scrimmage>;
}

export enum Eligibility {
  US = 'US',
  International = 'International',
  MITNewbie = 'MIT Newbie',
  HighSchool = 'High School',
  NonStudent = 'Non-student',
}

export interface AugmentedTeam extends Team {
  eligibilities: Eligibility[];
}

export function getTeamEligibilities(team: Team): Eligibility[] {
  const eligibilities: Eligibility[] = [];
  const eligibleFor = team.profile.eligible_for;

  if (eligibleFor.includes(1) && !eligibleFor.includes(2) && eligibleFor.includes(3)) {
    eligibilities.push(Eligibility.US);
  }

  if (eligibleFor.includes(1) && !eligibleFor.includes(2) && !eligibleFor.includes(3)) {
    eligibilities.push(Eligibility.International);
  }

  if (eligibleFor.includes(1) && eligibleFor.includes(4)) {
    eligibilities.push(Eligibility.MITNewbie);
  }

  if (eligibleFor.includes(2)) {
    eligibilities.push(Eligibility.HighSchool);
  }

  if (eligibilities.length === 0) {
    eligibilities.push(Eligibility.NonStudent);
  }

  return eligibilities;
}

export const allEligibilities = [
  Eligibility.US,
  Eligibility.International,
  Eligibility.MITNewbie,
  Eligibility.HighSchool,
  Eligibility.NonStudent,
];
