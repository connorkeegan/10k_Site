# SEC 10-K Fetcher

A full-featured web application and CLI tool that fetches and displays 10-K filing information for any publicly traded company using the SEC's official EDGAR submissions API.

## ✨ Features

### 🌐 **Web Application**
- **Modern web interface** with real-time search and download capabilities
- **Company search suggestions** as you type
- **One-click downloads** of actual 10-K documents 
- **Direct SEC viewing** - open documents on SEC's website
- **Mobile-responsive design** with beautiful UI
- **Real-time file information** display

### 🔍 **Search Capabilities**
- **Search by ticker symbol** (AAPL, MSFT, GOOGL)
- **Search by company name** (Apple, Microsoft, Google)
- **Search by CIK number** (320193, 789019)
- **Auto-complete suggestions** with company details

### 📋 **Filing Information**
- **Latest 10-K filing metadata** and information
- **Filing dates, accession numbers, and document details**
- **File sizes and report periods**
- **Direct download links** to actual SEC documents
- **SEC website integration** for viewing

### 🆓 **Completely Free**
- Uses SEC's official API (no API key required)
- No rate limits or usage restrictions
- Fast and reliable data directly from SEC EDGAR

## 🚀 Live Demo

**Web Application**: [Deploy on Render](https://render.com/) - See deployment instructions below

## 📦 Installation

### Web Application (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd sec-10k-fetcher
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run locally:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   ```
   http://localhost:3000
   ```

### CLI Tool

For command-line usage:
```bash
npm run fetch-10k AAPL
npm run fetch-10k "Apple Inc"
npm run fetch-10k 320193
npm run fetch-10k search Tesla
```

## 🌐 Web Application Usage

### Search and View
1. **Enter a company identifier** (ticker, name, or CIK) in the search box
2. **Select from suggestions** or press Enter to search
3. **View filing information** including dates, document details, and file sizes
4. **Download documents** with the download button
5. **View on SEC website** with the view button

### API Endpoints

The web application provides several API endpoints:

- `GET /api/search?q={query}` - Search for companies
- `GET /api/company/{identifier}/10k` - Get 10-K data for a company
- `GET /api/download/{cik}/{accessionNumber}/{document}` - Download document
- `GET /api/download-url/{cik}/{accessionNumber}/{document}` - Get SEC URL
- `GET /api/health` - Health check

## 🚀 Deploy on Render

### One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Manual Deployment

1. **Create a Render account** at [render.com](https://render.com)

2. **Connect your repository:**
   - Link your GitHub repository to Render
   - Select "Web Service" when creating a new service

3. **Configure deployment:**
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node.js
   - **Plan**: Free tier works perfectly

4. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   ```

5. **Deploy:**
   - Render will automatically build and deploy your application
   - Your app will be available at `https://your-app-name.onrender.com`

### Render Configuration

The included `render.yaml` file automatically configures:
- Node.js runtime
- Build and start commands
- Environment variables
- Health checks
- Free tier deployment

## 📊 Example Usage

### Web Interface Examples

**Search Apple:**
- Enter "AAPL" → View latest 10-K → Download/View document

**Search Microsoft:**
- Enter "Microsoft" → Select from suggestions → Download filing

**Search by CIK:**
- Enter "320193" → Get Apple's latest 10-K information

### API Examples

```bash
# Search for companies
curl "https://your-app.onrender.com/api/search?q=Apple"

# Get 10-K data
curl "https://your-app.onrender.com/api/company/AAPL/10k"

# Download document (returns file)
curl "https://your-app.onrender.com/api/download/320193/0000320193-23-000106/aapl-20230930.htm"
```

## 🏗️ Architecture

### Frontend
- **Vanilla JavaScript** with modern ES6+ features
- **Responsive CSS** with mobile-first design
- **Real-time search** with debounced API calls
- **File download handling** with progress indicators

### Backend
- **Express.js** REST API server
- **TypeScript** for type safety and development experience
- **CORS enabled** for cross-origin requests
- **Error handling** with user-friendly messages

### Data Source
- **SEC EDGAR API** - Official SEC submissions database
- **Real-time data** directly from government source
- **No API keys required** - completely free access

## 🛠️ Development

### Local Development

```bash
# Install dependencies
npm install

# Run development server (auto-reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# CLI usage
npm run fetch-10k AAPL
```

### File Structure

```
sec-10k-fetcher/
├── src/
│   ├── types/index.ts          # TypeScript interfaces
│   ├── services/SECService.ts  # SEC API integration
│   ├── server.ts               # Express.js server
│   └── fetch10k.ts            # CLI tool
├── public/
│   ├── index.html             # Web interface
│   ├── style.css              # Styling
│   └── script.js              # Frontend logic
├── dist/                      # Compiled JavaScript
├── package.json
├── tsconfig.json
└── render.yaml               # Render deployment config
```

## 📋 Technical Details

### SEC API Integration
- **Submissions endpoint**: `https://data.sec.gov/submissions/CIK{cik}.json`
- **Document downloads**: `https://www.sec.gov/Archives/edgar/data/{cik}/{accession}/{document}`
- **User-Agent required**: All requests include proper identification
- **Rate limiting friendly**: Reasonable request patterns

### Data Processing
- **10-K filtering**: Automatically finds latest 10-K filings
- **Form type detection**: Supports 10-K, 10-K/A, and related forms
- **Date sorting**: Most recent filings first
- **Error handling**: Graceful fallbacks for missing data

### Security
- **CORS configured** for secure cross-origin requests
- **Input validation** on all API endpoints
- **Error sanitization** to prevent information disclosure
- **No sensitive data storage** - all data from public SEC APIs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- **SEC EDGAR database** for providing free access to public filing data
- **Render.com** for free web application hosting
- **TypeScript** and **Express.js** communities for excellent tooling

---

**Built with ❤️ for transparency in public company financial data** 