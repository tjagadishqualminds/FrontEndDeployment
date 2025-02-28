interface Election {
  nominationDateFrom: string;
  nominationTo: string;
  campaignDateFrom: string;
  campaignDateTo: string;
  electionDate: string;
  electionTimeFrom: string;
  electionTimeTo: string;
}

export const validateElectionDates = (election: Election, stateId: number, depositAmount: number) => {
  const errors: { [key: string]: string } = {};

  const addError = (field: string, message: string) => {
    errors[field] = message;
  };

  switch (true) {
    case stateId === 0:
      addError("state", "You must select a state.");
      break;
    case depositAmount !== 1000:
      addError("depositAmount", "Deposit amount must be exactly 1000 rupees.");
      break;
    case new Date(election.nominationDateFrom) >= new Date(election.nominationTo):
      addError("nomination", "Nomination Start Date must be earlier than Nomination End Date.");
      break;
    case new Date(election.campaignDateFrom) >= new Date(election.campaignDateTo):
      addError("campaign", "Campaign Start Date must be earlier than Campaign End Date.");
      break;
    case new Date(`${election.electionDate}T${election.electionTimeFrom}`) >= new Date(`${election.electionDate}T${election.electionTimeTo}`):
      addError("electionTime", "Election Time From must be earlier than Election Time To.");
      break;
    case new Date(election.nominationTo) >= new Date(election.electionDate):
      addError("nominationEndDate", "Election Date must be after Nomination End Date.");
      break;
    case new Date(election.campaignDateTo) >= new Date(election.electionDate):
      addError("campaignEndDate", "Election Date must be after Campaign End Date.");
      break;
  }
  return errors;
};
