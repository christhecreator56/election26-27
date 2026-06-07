export type Candidate = {
  id: string;
  role: "spl" | "aspl";
  name: string;
  image_url: string;
  display_order: number;
};

export type StudentStatus = {
  ok: boolean;
  admission_number?: string;
  name?: string;
  class?: string;
  section?: string;
  has_voted_spl?: boolean;
  has_voted_aspl?: boolean;
  already_voted?: boolean;
  next_step?: "spl" | "aspl" | "complete";
};

export type LoginResult = StudentStatus & {
  error?: string;
};

export type TallyItem = {
  id: string;
  name: string;
  image_url: string;
  display_order: number;
  vote_count: number;
};

export type VoterRecord = {
  admission_number: string;
  name: string;
  class: string;
  section: string;
  spl_vote: string | null;
  aspl_vote: string | null;
  completed_at: string | null;
};

export type ElectionResults = {
  spl_tally: TallyItem[];
  aspl_tally: TallyItem[];
  voters: VoterRecord[];
  total_voted: number;
};
