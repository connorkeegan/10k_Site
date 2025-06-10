#!/usr/bin/env ts-node

import { SECService } from './services/SECService';
import { Filing10KData } from './types/index';

class TenKFetcher {
  private secService: SECService;

  constructor() {
    this.secService = new SECService();
  }

  /**
   * Display formatted 10K data
   */
  displayTenKData(data: Filing10KData): void {
    console.log('\n' + '='.repeat(60));
    console.log(`COMPANY: ${data.companyInfo.name}`);
    console.log(`CIK: ${data.companyInfo.cik}`);
    if (data.companyInfo.ticker) {
      console.log(`TICKER: ${data.companyInfo.ticker}`);
    }
    console.log('='.repeat(60));

    if (data.latestFiling) {
      console.log('\n📋 LATEST 10-K FILING INFORMATION:');
      console.log('-'.repeat(40));
      console.log(`📅 Filing Date: ${data.latestFiling.filingDate}`);
      console.log(`📄 Form Type: ${data.latestFiling.form}`);
      console.log(`🔗 Accession Number: ${data.latestFiling.accessionNumber}`);
      console.log(`📂 Primary Document: ${data.latestFiling.primaryDocument}`);
      console.log(`📊 File Size: ${(data.latestFiling.size / 1024).toFixed(1)} KB`);
      
      if (data.latestFiling.reportDate) {
        console.log(`📈 Report Date: ${data.latestFiling.reportDate}`);
      }
    }

    console.log('\n💡 NOTE: This version shows filing metadata only.');
    console.log('💡 For detailed financial data, additional XBRL parsing would be required.');
    console.log('\n' + '='.repeat(60));
  }

  /**
   * Search and display multiple companies
   */
  async searchCompanies(query: string): Promise<void> {
    try {
      console.log(`🔍 Searching for companies matching: "${query}"`);
      const companies = await this.secService.searchCompany(query);

      if (companies.length === 0) {
        console.log('❌ No companies found matching your search.');
        return;
      }

      console.log(`\n✅ Found ${companies.length} companies:`);
      companies.slice(0, 10).forEach((company, index) => {
        console.log(`${index + 1}. ${company.name} (${company.ticker || 'N/A'}) - CIK: ${company.cik}`);
      });

      if (companies.length > 10) {
        console.log(`... and ${companies.length - 10} more results.`);
      }
    } catch (error) {
      console.error('❌ Error searching for companies:', error);
    }
  }

  /**
   * Fetch and display 10K data for a specific company
   */
  async fetch10K(input: string): Promise<void> {
    try {
      console.log(`\n🚀 Fetching 10-K data for: ${input}`);
      const data = await this.secService.getMostRecent10K(input);
      this.displayTenKData(data);
    } catch (error) {
      console.error('❌ Error fetching 10-K data:', error);
      
      // If search failed, try searching for similar companies
      console.log('\n💡 Trying to find similar companies...');
      await this.searchCompanies(input);
    }
  }

  /**
   * Display help information
   */
  displayHelp(): void {
    console.log(`
📋 SEC 10-K Fetcher - Usage Guide

USAGE:
  npm run fetch-10k [COMPANY_IDENTIFIER]

EXAMPLES:
  npm run fetch-10k AAPL          # Search by ticker symbol
  npm run fetch-10k Apple         # Search by company name
  npm run fetch-10k 320193        # Search by CIK number
  npm run fetch-10k "Microsoft"   # Search with quotes for exact match

FEATURES:
  • Fetches the most recent 10-K filing data
  • Displays key financial metrics (Revenue, Net Income, Assets, etc.)
  • Supports search by ticker symbol, company name, or CIK
  • Uses the official SEC EDGAR API (free, no API key required)

NOTES:
  • Data is sourced directly from SEC EDGAR filings
  • Financial figures are displayed in millions (M)
  • Only shows data from 10-K forms (annual reports)
  • Requires internet connection to fetch data

For more information, visit: https://www.sec.gov/edgar
`);
  }
}

// Main execution
async function main(): Promise<void> {
  const fetcher = new TenKFetcher();
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    fetcher.displayHelp();
    return;
  }

  // Check if first argument is "search"
  if (args[0].toLowerCase() === 'search') {
    if (args.length < 2) {
      console.log('❌ Please provide a search term. Example: npm run fetch-10k search Apple');
      return;
    }
    await fetcher.searchCompanies(args.slice(1).join(' '));
    return;
  }

  // Otherwise treat the entire input as a company identifier
  const input = args.join(' ').trim();
  await fetcher.fetch10K(input);
}

// Execute the main function
main().catch(error => {
  console.error('❌ Application error:', error);
  process.exit(1);
}); 