import config from "../config/apiConfig.json";
import { defineStore } from 'pinia';
import axios from 'axios';
import * as XLSX from 'xlsx';
interface Election {
  code: number;
  name: string;
  isLive: boolean;
}
interface State {
  id: number;
  name: string;
}
interface Constituency {
  id: number;
  name: string;
}
interface Filters {
  electionCode: number | null;
  stateId: number | null;
  constituencyId: number | null;
  partyName: string | null;
}
interface BriefResult {
  electionCode: number;
  constituency: string;
  constituencyId: number;
  candidateCount: number;
  totalVotes: number;
  winningCandidate: string;
  winningParty: string;
  winningVotes: number;
}
interface DetailedResult {
  id: number;
  electionCode: number;
  candidateId: number;
  candidateName: string;
  partyName: string;
  votesReceived: number;
  votesPercentage: number;
  voteDifference: number;
  status: string;
  totalVotesCast: number;
  constituency: string;
  stateId: number;
  state: string;
  voterTurnout: number;
  partyAlliance: string;
  partyLogoUrl: string;
  isLive: boolean;
  constituencyId: number;
  totalVotes: number;
  electionDate: Date;
  electionName: string;
}
interface SortParams {
  column: string;
  direction: 'asc' | 'desc';
  type: 'brief' | 'detailed';
}
interface FilterParams {
  searchTerm: string;
  party: string | null;
}
interface ElectionState {
  elections: Election[];
  states: State[];
  constituencies: Constituency[];
  parties: string[];
  briefResults: BriefResult[];
  detailedResults: DetailedResult[];
  resultsType: "live" | "declared";
  loading: boolean;
  error: string | null;
  currentFilters: Filters; 
  firstLoad: boolean;
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
    }[];
  };
  votingData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
    }[];
  };
}
export const useElectionStore = defineStore('election', {
  state: (): ElectionState => ({
    elections: [],
    states: [],
    constituencies: [],
    parties: [],
    briefResults: [],
    detailedResults: [],
    resultsType: 'declared' as 'live' | 'declared',
    loading: false,
    error: null,
    currentFilters: {
      electionCode: null,
      stateId: null,
      constituencyId: null,
      partyName: null
    },
    firstLoad: true,
    chartData: {
      labels: [],
      datasets: [{
        label: 'Results',
        data: [],
        backgroundColor: []
      }]
    },
    votingData: {
      labels: [],
      datasets: [{
        label: 'Voting',
        data: [],
        backgroundColor: []
      }]
    }
  }),

  getters: {
    getBriefResults: (state) => (filters: Filters) => {
      return state.briefResults.filter(result => {
        if (filters.electionCode && result.electionCode !== filters.electionCode) return false;
        if (filters.constituencyId && result.constituencyId !== filters.constituencyId) return false;
        if (filters.partyName && result.winningParty !== filters.partyName) return false;
        return true;
      });
    },
    getDetailedResults: (state) => (filters: Filters) => {
      const filteredResults = state.detailedResults.filter(result => {
        const election = state.elections.find(e => e.code === result.electionCode);
        const isLive = election ? election.isLive : false; 
        return state.resultsType === 'live' ? isLive : !isLive;
      }).filter(result => {
        if (filters.constituencyId && result.constituencyId !== filters.constituencyId) {
          return false;
        }
        if (filters.partyName && result.partyName !== filters.partyName) {
          return false;
        }
        return true;
      });
    
      return filteredResults;
    },
    getMostRecentElections: (state) => (type: 'live' | 'declared') => {
      const filteredElections = state.elections.filter(election => 
        type === 'live' ? election.isLive : !election.isLive
      );
      const sortedElections = filteredElections.sort((a, b) => {
        const dateA = state.detailedResults.find(r => r.electionCode === a.code)?.electionDate || new Date(0);
        const dateB = state.detailedResults.find(r => r.electionCode === b.code)?.electionDate || new Date(0);
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      return sortedElections.slice(0, 2);
    },
    getChartData: (state) => (filters: Filters) => {
      const partyWiseResults = state.detailedResults.reduce((acc, curr) => {
        if (!acc[curr.partyName]) {
          acc[curr.partyName] = 0;
        }
        acc[curr.partyName] += curr.votesReceived;
        return acc;
      }, {} as Record<string, number>);
      const labels = Object.keys(partyWiseResults);
      const data = Object.values(partyWiseResults);
      const backgroundColor = labels.map(() => {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return `rgba(${r}, ${g}, ${b}, 0.6)`;
      });
      return {
        labels,
        datasets: [{
          label: 'Seats Won',
          data,
          backgroundColor
        }]
      };
    },
    getVotingChartData: (state) => (filters: Filters) => {
      let votingData = {
        votesCast: 0, 
        totalVotes: 0  
      };
      const filteredResults = state.detailedResults.filter(result => {
        return (!filters.electionCode || result.electionCode === filters.electionCode) &&
               (!filters.stateId || result.stateId === filters.stateId) &&
               (!filters.constituencyId || result.constituencyId === filters.constituencyId);
      });
      if (filteredResults.length === 0) {
        return {
          labels: ['Total Votes Cast','Remaining Votes'],
          datasets: [{
            label: 'Votes',
            data: [0, 0],
            backgroundColor: ['#36A2EB', '#FF6384'],
          }],
          percentage: "0%"
        };
      }
      if (filters.constituencyId) {
        votingData.votesCast = filteredResults.reduce((sum, curr) => sum + curr.totalVotesCast, 0);
        votingData.totalVotes = filteredResults[0]?.totalVotes || 0;
      } 
      else if (filters.stateId) {
        const constituencyElectionPairs = new Set(
          filteredResults.map(result => `${result.constituencyId}-${result.electionCode}`)
        );
        votingData.votesCast = filteredResults.reduce((sum, curr) => sum + curr.totalVotesCast, 0);
        votingData.totalVotes = Array.from(constituencyElectionPairs).reduce((sum, pair) => {
          const [constituencyId, electionCode] = pair.split('-').map(Number);
          const record = filteredResults.find(r => 
            r.constituencyId === constituencyId && r.electionCode === electionCode
          );
          return sum + (record?.totalVotes || 0);
        }, 0);
      }
      else if (filters.electionCode) {
        votingData.votesCast = filteredResults.reduce((sum, curr) => sum + curr.totalVotesCast, 0);
        const uniqueConstituencies = new Set(
          filteredResults.map(result => result.constituencyId)
        );
        votingData.totalVotes = Array.from(uniqueConstituencies).reduce((sum, constituencyId) => {
          const record = filteredResults.find(r => r.constituencyId === constituencyId);
          return sum + (record?.totalVotes || 0);
        }, 0);
      }
      else {
        votingData.votesCast = filteredResults.reduce((sum, curr) => sum + curr.totalVotesCast, 0);
        const constituencyElectionPairs = new Set(
          filteredResults.map(result => `${result.constituencyId}-${result.electionCode}`)
        );
        votingData.totalVotes = Array.from(constituencyElectionPairs).reduce((sum, pair) => {
          const [constituencyId, electionCode] = pair.split('-').map(Number);
          const record = filteredResults.find(r => 
            r.constituencyId === constituencyId && r.electionCode === electionCode
          );
          return sum + (record?.totalVotes || 0);
        }, 0);
      }
      const votePercentage = votingData.totalVotes > 0 
        ? ((votingData.votesCast / votingData.totalVotes) * 100).toFixed(2)
        : "0";
      return {
        labels: ['Total Votes Cast','Remaining Votes'],
        datasets: [{
          label: 'Votes',
          data: [votingData.votesCast, votingData.totalVotes],
          backgroundColor: ['#36A2EB', '#FF6384'],
        }],
        percentage: `${votePercentage}%`
      };
    }
  },
  actions: {
    async fetchElectionData(filters: Filters) {
      this.loading = true;
      this.error = null;
      try {
        const [
          briefResultsResponse,
          detailedResultsResponse
        ] = await Promise.all([
          axios.get(`${config.baseUrl}${config.endpoints.declaredbriefresults}`, { 
            params: { 
              ...filters, 
              electionId: filters.electionCode 
            }}),
          axios.get(`${config.baseUrl}${config.endpoints.declareddetailedresults}`, { params: filters })
        ]);
        const detailedResults = detailedResultsResponse.data as DetailedResult[];
        if (this.detailedResults.length > 0) {
          const recentLiveElections = this.getMostRecentElections('live');
          const recentDeclaredElections = this.getMostRecentElections('declared');
          const defaultElections = this.resultsType === 'live' 
            ? recentLiveElections 
            : recentDeclaredElections;
          if (this.firstLoad && defaultElections.length > 0) {
            this.firstLoad = false;
            filters.electionCode = defaultElections[0].code;
          }
        }
        function extractUniqueValues(key: 'electionCode', results?: DetailedResult[]): Election[];
        function extractUniqueValues(key: 'stateId', results?: DetailedResult[]): State[];
        function extractUniqueValues(key: 'constituencyId', results?: DetailedResult[]): Constituency[];
        function extractUniqueValues(
          key: 'electionCode' | 'stateId' | 'constituencyId', 
          results?: DetailedResult[]
        ): (Election | State | Constituency)[] {
          const resultsToUse = results || detailedResults;
          const uniqueMap = new Map<number, Election | State | Constituency>();
          resultsToUse
            .filter((result: DetailedResult) => result[key] != null)
            .forEach((result: DetailedResult) => {
              const id = result[key];
              if (!uniqueMap.has(id)) {
                if (key === 'electionCode') {
                  uniqueMap.set(id, { 
                    code: id, 
                    name: result['electionName'], 
                    isLive: result['isLive'] 
                  });
                } else if (key === 'stateId') {
                  uniqueMap.set(id, { 
                    id: id, 
                    name: result['state'] 
                  });
                } else if (key === 'constituencyId') {
                  uniqueMap.set(id, { 
                    id: id, 
                    name: result['constituency'] 
                  });
                }
              }
            });
          return Array.from(uniqueMap.values()).sort((a: any, b: any) => 
            a.name.localeCompare(b.name)
          );
        }
        let filteredResults = detailedResults;
        const applyFilter = (key: keyof DetailedResult, value: any) => {
          if (value) {
            filteredResults = filteredResults.filter((result: DetailedResult) => result[key] === value);
          }
        };
        applyFilter('stateId', filters.stateId);
        applyFilter('electionCode', filters.electionCode);
        applyFilter('constituencyId', filters.constituencyId);
    const extractDropdownOptions = () => {
      let filteredResults = detailedResults.filter(result => {
        const election = this.elections.find(e => e.code === result.electionCode);
        const isLive = election ? election.isLive : false;
        return this.resultsType === 'live' ? isLive : !isLive;
      });
      if (filters.electionCode) {
        filteredResults = filteredResults.filter(r => r.electionCode === filters.electionCode);
      }
      if (filters.stateId) {
        filteredResults = filteredResults.filter(r => r.stateId === filters.stateId);
      }
      if (filters.constituencyId) {
        filteredResults = filteredResults.filter(r => r.constituencyId === filters.constituencyId);
      }
      if (filters.electionCode) {
        const electionResults = detailedResults.filter(r => r.electionCode === filters.electionCode);
        this.states = extractUniqueValues('stateId', electionResults);
        
        if (filters.stateId) {
          const stateResults = electionResults.filter(r => r.stateId === filters.stateId);
          this.constituencies = extractUniqueValues('constituencyId', stateResults);
        } else {
          this.constituencies = extractUniqueValues('constituencyId', electionResults);
        }
      } else if (filters.stateId) {
        const stateResults = detailedResults.filter(r => r.stateId === filters.stateId);
        this.elections = extractUniqueValues('electionCode', stateResults);
        this.constituencies = extractUniqueValues('constituencyId', stateResults);
      } else if (filters.constituencyId) {
        const constituencyResults = detailedResults.filter(r => r.constituencyId === filters.constituencyId);
        this.elections = extractUniqueValues('electionCode', constituencyResults);
        this.states = extractUniqueValues('stateId', constituencyResults);
      } else {
        this.elections = extractUniqueValues('electionCode', detailedResults);
        this.states = extractUniqueValues('stateId', detailedResults);
        this.constituencies = extractUniqueValues('constituencyId', detailedResults);
      }
      this.parties = Array.from(
        new Set(
          filteredResults
            .map(result => result.partyName)
            .filter(party => party != null)
        )
      ).sort();
    };
    extractDropdownOptions();
    this.briefResults = briefResultsResponse.data;
    this.detailedResults = detailedResults;
  } catch (error) {
    this.error = error instanceof Error ? error.message : 'An error occurred';
    this.elections = [];
    this.states = [];
    this.constituencies = [];
    this.parties = [];
    this.briefResults = [];
    this.detailedResults = [];
  } finally {
    this.loading = false;
  }
},
    setResultsType(type: 'live' | 'declared') {
      this.resultsType = type;
      this.fetchElectionData({
        electionCode: null,
        stateId: null,
        constituencyId: null,
        partyName: null
      });
    },
    resetFilters() {
      this.currentFilters = {
        electionCode: null,
        stateId: null,
        constituencyId: null,
        partyName: null
      };
      this.fetchElectionData(this.currentFilters);
    },
    handleFilterChange(filterType: string, value: any) {
      this.currentFilters = {
        ...this.currentFilters,
        [filterType]: value
      };
      this.fetchElectionData(this.currentFilters);
    },
    updateChartData(filters: Filters) {
      const chartData = this.getChartData(filters);
      const votingData = this.getVotingChartData(filters);
      this.chartData = chartData;
      this.votingData = votingData;
    },
    sortResults({ column, direction, type }: SortParams) {
      const sortFn = (a: any, b: any) => {
        const multiplier = direction === 'asc' ? 1 : -1;
        return multiplier * (a[column] > b[column] ? 1 : -1);
      };
      if (type === 'brief') {
        this.briefResults = [...this.briefResults].sort(sortFn);
      } else {
        this.detailedResults = [...this.detailedResults].sort(sortFn);
      }
    },
    filterResults({ searchTerm, party }: FilterParams) {
      const filteredResults = this.detailedResults.filter(result => {
        const matchesSearch = searchTerm
          ? result.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.constituency.toLowerCase().includes(searchTerm.toLowerCase())
          : true;
        const matchesParty = party ? result.partyName === party : true;
        return matchesSearch && matchesParty;
      });
      this.detailedResults = filteredResults;
    },
    downloadBriefResultsExcel() {
      const worksheet = XLSX.utils.json_to_sheet(this.briefResults);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Brief Results");
      XLSX.writeFile(workbook, "brief_results.xlsx");
    },
    downloadDetailedResultsExcel() {
      const worksheet = XLSX.utils.json_to_sheet(this.detailedResults);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Detailed Results");
      XLSX.writeFile(workbook, "detailed_results.xlsx");
    }
  }
});