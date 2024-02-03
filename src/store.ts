import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { allEligibilities, AugmentedTeam, DataFiles, Eligibility, getTeamEligibilities, Scrimmage } from './models.ts';

interface State {
  teams: AugmentedTeam[];
  teamsTimestamp: Date | null;

  scrimmages: Scrimmage[];
  scrimmagesTimestamp: Date | null;

  scrimmagesByTeam: Map<number, Scrimmage[]>;

  selectedEligibilities: Eligibility[];

  filteredTeams: AugmentedTeam[];
  filteredScrimmages: Scrimmage[];

  stateHydrated: boolean;

  setHydrated: (state: boolean) => void;

  setTeams: (data: DataFiles['teams'], timestamp: Date) => void;
  setScrimmages: (data: DataFiles['scrimmages'], timestamp: Date) => void;

  setSelectedEligibilities: (eligibilities: Eligibility[]) => void;
}

function filterTeams(teams: AugmentedTeam[], eligibilities: Eligibility[]): AugmentedTeam[] {
  return teams.filter(t => eligibilities.some(e => t.eligibilities.includes(e)));
}

function filterScrimmages(scrimmages: Scrimmage[], teams: AugmentedTeam[]): Scrimmage[] {
  const teamIds = new Set<number>();
  for (const team of teams) {
    teamIds.add(team.id);
  }

  return scrimmages.filter(
    s => s.participants !== null && (teamIds.has(s.participants[0].team) || teamIds.has(s.participants[1].team)),
  );
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      teams: [],
      teamsTimestamp: null,

      scrimmages: [],
      scrimmagesTimestamp: null,

      scrimmagesByTeam: new Map(),

      selectedEligibilities: allEligibilities,

      filteredTeams: [],
      filteredScrimmages: [],

      stateHydrated: false,

      setHydrated: state => {
        set({
          stateHydrated: state,
        });
      },

      setTeams: (data, timestamp) => {
        const teams = Object.values(data)
          .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
          .map(team => ({
            ...team,
            eligibilities: getTeamEligibilities(team),
          }));

        const filteredTeams = filterTeams(teams, get().selectedEligibilities);
        const filteredScrimmages = filterScrimmages(get().filteredScrimmages, filteredTeams);

        set({
          teams: teams,
          teamsTimestamp: timestamp,

          filteredTeams,
          filteredScrimmages,
        });
      },

      setScrimmages: (data, timestamp) => {
        const scrimmages = Object.values(data).sort((a, b) => Date.parse(a.created) - Date.parse(b.created));

        const scrimmagesByTeam = new Map<number, Scrimmage[]>();
        for (const scrimmage of scrimmages) {
          if (scrimmage.participants === null) {
            continue;
          }

          for (const participant of scrimmage.participants) {
            if (!scrimmagesByTeam.has(participant.team)) {
              scrimmagesByTeam.set(participant.team, []);
            }

            scrimmagesByTeam.get(participant.team)!.push(scrimmage);
          }
        }

        const filteredScrimmages = filterScrimmages(scrimmages, get().teams);

        set({
          scrimmages,
          scrimmagesByTeam,
          scrimmagesTimestamp: timestamp,
          filteredScrimmages,
        });
      },

      setSelectedEligibilities: eligibilities => {
        const filteredTeams = filterTeams(get().teams, eligibilities);
        const filteredScrimmages = filterScrimmages(get().scrimmages, filteredTeams);

        set({
          selectedEligibilities: eligibilities,
          filteredTeams,
          filteredScrimmages,
        });
      },
    }),
    {
      name: 'battlecode-2024-statistics-config',
      partialize: state => ({
        selectedEligibilities: state.selectedEligibilities,
      }),
    },
  ),
);
