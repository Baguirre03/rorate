import type { Tables, TablesInsert } from "@/types/supabase";
// Form and API Types
export type SubmissionInsert = TablesInsert<"submissions">;

export type SubmissionResponse = {
  success: boolean;
  data: Tables<"submissions">;
};

export type SubmissionFormData = {
  linkedinUrl: string;
  companyName: string;
  year: number;
  term: string;
  internType: string;
  returnOfferExtended: boolean | null;
  positionType: string | null;
};

export type SubmissionRequestBody = {
  linkedinUrl: string;
  companyName: string;
  year: number;
  term: string;
  internType?: string;
  returnOfferExtended: boolean;
  positionType: string;
  schoolName?: string;
  source?: string;
};
