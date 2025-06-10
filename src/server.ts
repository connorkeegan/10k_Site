import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { SECService } from './services/SECService';

const app = express();
const port = process.env.PORT || 3000;
const secService = new SECService();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes

/**
 * Search for companies
 */
app.get('/api/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const companies = await secService.searchCompany(q);
    res.json({ companies });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search companies' });
  }
});

/**
 * Get 10-K data for a company
 */
app.get('/api/company/:identifier/10k', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    
    if (!identifier) {
      return res.status(400).json({ error: 'Company identifier is required' });
    }

    const data = await secService.getMostRecent10K(identifier);
    res.json(data);
  } catch (error) {
    console.error('10-K fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch 10-K data' });
  }
});

/**
 * Download 10-K document
 */
app.get('/api/download/:cik/:accessionNumber/:primaryDocument', async (req: Request, res: Response) => {
  try {
    const { cik, accessionNumber, primaryDocument } = req.params;
    
    if (!cik || !accessionNumber || !primaryDocument) {
      return res.status(400).json({ error: 'CIK, accession number, and primary document are required' });
    }

    const content = await secService.downloadFilingDocument(accessionNumber, primaryDocument, cik);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${primaryDocument}"`);
    res.send(content);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

/**
 * Get download URL for a document (without downloading)
 */
app.get('/api/download-url/:cik/:accessionNumber/:primaryDocument', (req: Request, res: Response) => {
  try {
    const { cik, accessionNumber, primaryDocument } = req.params;
    
    if (!cik || !accessionNumber || !primaryDocument) {
      return res.status(400).json({ error: 'CIK, accession number, and primary document are required' });
    }

    const url = secService.getFilingDownloadUrl(accessionNumber, primaryDocument, cik);
    res.json({ downloadUrl: url });
  } catch (error) {
    console.error('URL generation error:', error);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
});

/**
 * Health check
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve frontend for all other routes
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 SEC 10-K Fetcher server running on port ${port}`);
  console.log(`📋 API available at http://localhost:${port}/api`);
  console.log(`🌐 Web interface at http://localhost:${port}`);
});

export default app; 