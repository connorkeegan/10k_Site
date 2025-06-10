import { SECCompanyFacts, CompanyInfo, Filing10KData, FactUnit } from '../types/index';

export class SECService {
  private readonly baseUrl = 'https://data.sec.gov';
  private readonly headers = {
    'User-Agent': 'SEC-10K-Fetcher/1.0.0 (contact@company.com)', // SEC requires a User-Agent
    'Accept': 'application/json',
  };

  /**
   * Search for a company by ticker symbol or name using hardcoded ticker data
   */
  async searchCompany(query: string): Promise<CompanyInfo[]> {
    try {
      // For this example, we'll provide some common companies to search
      // In a real implementation, you'd want to maintain a database of companies
      const commonCompanies: CompanyInfo[] = [
        { cik: '0000320193', ticker: 'AAPL', name: 'Apple Inc.' },
        { cik: '0000789019', ticker: 'MSFT', name: 'Microsoft Corporation' },
        { cik: '0001018724', ticker: 'AMZN', name: 'Amazon.com Inc' },
        { cik: '0001652044', ticker: 'GOOGL', name: 'Alphabet Inc.' },
        { cik: '0001326801', ticker: 'META', name: 'Meta Platforms Inc' },
        { cik: '0000051143', ticker: 'IBM', name: 'International Business Machines Corporation' },
        { cik: '0000886982', ticker: 'CRM', name: 'Salesforce Inc' },
        { cik: '0001045810', ticker: 'NVDA', name: 'NVIDIA Corporation' },
        { cik: '0000200406', ticker: 'JNJ', name: 'Johnson & Johnson' },
        { cik: '0000019617', ticker: 'JPM', name: 'JPMorgan Chase & Co.' },
      ];

      const results = commonCompanies.filter(company => 
        company.ticker?.toLowerCase().includes(query.toLowerCase()) ||
        company.name.toLowerCase().includes(query.toLowerCase()) ||
        company.cik === query.padStart(10, '0')
      );

      return results;
    } catch (error) {
      console.error('Error searching for company:', error);
      throw error;
    }
  }

  /**
   * Get company submissions data
   */
  async getCompanySubmissions(cik: string): Promise<any> {
    try {
      // Ensure CIK is properly formatted (10 digits with leading zeros)
      const formattedCik = cik.padStart(10, '0');
      
      const response = await fetch(`${this.baseUrl}/submissions/CIK${formattedCik}.json`, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching company submissions:', error);
      throw error;
    }
  }

  /**
   * Extract 10-K specific data from company submissions
   */
  extractTenKData(submissionsData: any): Filing10KData {
    const filings = submissionsData.filings?.recent;
    
    if (!filings) {
      throw new Error('No filings data found');
    }

    // Find the most recent 10-K filing
    const tenKIndex = filings.form.findIndex((form: string) => form === '10-K');
    
    if (tenKIndex === -1) {
      throw new Error('No 10-K filings found');
    }

    const filing = {
      accessionNumber: filings.accessionNumber[tenKIndex],
      filingDate: filings.filingDate[tenKIndex],
      reportDate: filings.reportDate[tenKIndex],
      form: filings.form[tenKIndex],
      primaryDocument: filings.primaryDocument[tenKIndex],
      size: filings.size[tenKIndex],
    };

    // Create mock financial data structure
    // Note: The submissions endpoint doesn't contain financial data
    // For actual financial data, you'd need to parse the XBRL documents
    const financialData: Filing10KData['financialData'] = {
      revenue: [],
      netIncome: [],
      totalAssets: [],
      totalLiabilities: [],
      stockholdersEquity: [],
    };

    return {
      companyInfo: {
        cik: submissionsData.cik,
        name: submissionsData.name,
        ticker: submissionsData.ticker,
      },
      latestFiling: filing,
      financialData,
    };
  }

  /**
   * Get the most recent 10-K data for a company
   */
  async getMostRecent10K(cikOrTicker: string): Promise<Filing10KData> {
    try {
      let companies: CompanyInfo[] = [];

      // If input looks like a CIK (all numbers), use it directly
      if (/^\d+$/.test(cikOrTicker)) {
        companies = [{
          cik: cikOrTicker.padStart(10, '0'),
          name: 'Unknown',
        }];
      } else {
        // Search for the company
        companies = await this.searchCompany(cikOrTicker);
        if (companies.length === 0) {
          throw new Error(`No company found for: ${cikOrTicker}`);
        }
      }

      const company = companies[0];
      console.log(`Found company: ${company.name} (CIK: ${company.cik})`);

      // Get company submissions
      const submissionsData = await this.getCompanySubmissions(company.cik);
      
      // Extract 10-K data
      const tenKData = this.extractTenKData(submissionsData);
      tenKData.companyInfo = { ...tenKData.companyInfo, ...company };

      return tenKData;
    } catch (error) {
      console.error('Error getting 10-K data:', error);
      throw error;
    }
  }

  /**
   * Format financial data for display
   */
  formatFinancialData(data: FactUnit[]): { value: string; year: number; date: string } | null {
    if (!data || data.length === 0) return null;

    // Get the most recent data point
    const mostRecent = data.sort((a, b) => new Date(b.end).getTime() - new Date(a.end).getTime())[0];
    
    const value = typeof mostRecent.val === 'number' 
      ? (mostRecent.val / 1000000).toFixed(2) + 'M' // Convert to millions
      : String(mostRecent.val);

    return {
      value,
      year: mostRecent.fy,
      date: mostRecent.end,
    };
  }

  /**
   * Get the download URL for a specific filing document
   */
  getFilingDownloadUrl(accessionNumber: string, primaryDocument: string, cik: string): string {
    // The SEC document URLs follow this pattern:
    // https://www.sec.gov/Archives/edgar/data/{CIK}/{AccessionNumber}/{PrimaryDocument}
    // where AccessionNumber has dashes removed for the directory structure
    const cleanAccessionNumber = accessionNumber.replace(/-/g, '');
    const cleanCik = cik.replace(/^0+/, ''); // Remove leading zeros from CIK
    return `https://www.sec.gov/Archives/edgar/data/${cleanCik}/${cleanAccessionNumber}/${primaryDocument}`;
  }

  /**
   * Download filing document content
   */
  async downloadFilingDocument(accessionNumber: string, primaryDocument: string, cik: string): Promise<string> {
    try {
      const url = this.getFilingDownloadUrl(accessionNumber, primaryDocument, cik);
      
      const response = await fetch(url, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      console.error('Error downloading filing document:', error);
      throw error;
    }
  }
} 