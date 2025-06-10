export interface SECCompanyFacts {
  cik: string;
  entityName: string;
  facts: {
    'us-gaap'?: Record<string, USGAAPFact>;
    dei?: Record<string, DEIFact>;
    [key: string]: Record<string, any> | undefined;
  };
}

export interface USGAAPFact {
  label: string;
  description: string;
  units: {
    USD?: FactUnit[];
    shares?: FactUnit[];
    [key: string]: FactUnit[] | undefined;
  };
}

export interface DEIFact {
  label: string;
  description: string;
  units: {
    [key: string]: FactUnit[];
  };
}

export interface FactUnit {
  end: string;
  val: number | string;
  accn: string;
  fy: number;
  fp: string;
  form: string;
  filed: string;
  frame?: string;
}

export interface SECFiling {
  accessionNumber: string;
  filingDate: string;
  reportDate?: string;
  acceptanceDateTime?: string;
  act?: string;
  form: string;
  fileNumber?: string;
  filmNumber?: string;
  items?: string;
  size: number;
  isXBRL?: number;
  isInlineXBRL?: number;
  primaryDocument: string;
  primaryDocDescription?: string;
}

export interface CompanyInfo {
  cik: string;
  ticker?: string;
  name: string;
  entityType?: string;
  sic?: string;
  sicDescription?: string;
  insiderTransactionForOwnerExists?: number;
  insiderTransactionForIssuerExists?: number;
  category?: string;
  fiscalYearEnd?: string;
  stateOfIncorporation?: string;
  stateOfIncorporationDescription?: string;
}

export interface Filing10KData {
  companyInfo: CompanyInfo;
  latestFiling?: SECFiling;
  financialData: {
    revenue?: FactUnit[];
    netIncome?: FactUnit[];
    totalAssets?: FactUnit[];
    totalLiabilities?: FactUnit[];
    stockholdersEquity?: FactUnit[];
    [key: string]: FactUnit[] | undefined;
  };
} 