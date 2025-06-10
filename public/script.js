class SECApp {
    constructor() {
        this.currentData = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const searchBtn = document.getElementById('searchBtn');
        const companyInput = document.getElementById('companyInput');
        const downloadBtn = document.getElementById('downloadBtn');
        const viewBtn = document.getElementById('viewBtn');
        const retryBtn = document.getElementById('retryBtn');

        // Search functionality
        searchBtn.addEventListener('click', () => this.searchCompany());
        companyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchCompany();
            }
        });

        // Download and view buttons
        downloadBtn.addEventListener('click', () => this.downloadDocument());
        viewBtn.addEventListener('click', () => this.viewOnSEC());

        // Retry button
        retryBtn.addEventListener('click', () => this.retryLastSearch());

        // Input suggestions
        companyInput.addEventListener('input', () => this.showSuggestions());
    }

    async searchCompany() {
        const input = document.getElementById('companyInput').value.trim();
        
        if (!input) {
            this.showError('Please enter a company ticker, name, or CIK number');
            return;
        }

        this.showLoading();
        this.hideSuggestions();

        try {
            const response = await fetch(`/api/company/${encodeURIComponent(input)}/10k`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.status}`);
            }

            const data = await response.json();
            this.currentData = data;
            this.displayResults(data);
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError(`Failed to fetch 10-K data: ${error.message}`);
        }
    }

    async showSuggestions() {
        const input = document.getElementById('companyInput').value.trim();
        
        if (input.length < 2) {
            this.hideSuggestions();
            return;
        }

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(input)}`);
            
            if (response.ok) {
                const data = await response.json();
                this.displaySuggestions(data.companies);
            }
        } catch (error) {
            console.error('Suggestions error:', error);
        }
    }

    displaySuggestions(companies) {
        const suggestionsDiv = document.getElementById('suggestions');
        
        if (!companies || companies.length === 0) {
            this.hideSuggestions();
            return;
        }

        suggestionsDiv.innerHTML = companies.slice(0, 5).map(company => `
            <div class="suggestion-item" onclick="app.selectSuggestion('${company.ticker || company.cik}')">
                <strong>${company.name}</strong> (${company.ticker || 'N/A'}) - CIK: ${company.cik}
            </div>
        `).join('');

        suggestionsDiv.classList.remove('hidden');
    }

    selectSuggestion(identifier) {
        document.getElementById('companyInput').value = identifier;
        this.hideSuggestions();
        this.searchCompany();
    }

    hideSuggestions() {
        document.getElementById('suggestions').classList.add('hidden');
    }

    displayResults(data) {
        this.hideLoading();
        this.hideError();

        // Company information
        document.getElementById('companyName').textContent = data.companyInfo.name;
        document.getElementById('companyTicker').textContent = data.companyInfo.ticker ? 
            `Ticker: ${data.companyInfo.ticker}` : '';
        document.getElementById('companyCik').textContent = `CIK: ${data.companyInfo.cik}`;

        // Filing information
        if (data.latestFiling) {
            const filing = data.latestFiling;
            document.getElementById('filingDate').textContent = filing.filingDate;
            document.getElementById('formType').textContent = filing.form;
            document.getElementById('accessionNumber').textContent = filing.accessionNumber;
            document.getElementById('primaryDocument').textContent = filing.primaryDocument;
            document.getElementById('fileSize').textContent = `${(filing.size / 1024).toFixed(1)} KB`;
            document.getElementById('reportDate').textContent = filing.reportDate || 'N/A';
        }

        document.getElementById('results').classList.remove('hidden');
    }

    async downloadDocument() {
        if (!this.currentData || !this.currentData.latestFiling) {
            this.showError('No filing data available for download');
            return;
        }

        const filing = this.currentData.latestFiling;
        const cik = this.currentData.companyInfo.cik;
        const downloadUrl = `/api/download/${cik}/${filing.accessionNumber}/${filing.primaryDocument}`;
        
        try {
            // Create a temporary link to trigger download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filing.primaryDocument;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Show success message
            this.showSuccessMessage('Download started! Check your downloads folder.');
            
        } catch (error) {
            console.error('Download error:', error);
            this.showError(`Failed to download document: ${error.message}`);
        }
    }

    async viewOnSEC() {
        if (!this.currentData || !this.currentData.latestFiling) {
            this.showError('No filing data available to view');
            return;
        }

        try {
            const filing = this.currentData.latestFiling;
            const cik = this.currentData.companyInfo.cik;
            const response = await fetch(`/api/download-url/${cik}/${filing.accessionNumber}/${filing.primaryDocument}`);
            
            if (response.ok) {
                const data = await response.json();
                window.open(data.downloadUrl, '_blank');
            } else {
                throw new Error('Failed to get SEC URL');
            }
            
        } catch (error) {
            console.error('View error:', error);
            this.showError(`Failed to open SEC document: ${error.message}`);
        }
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('results').classList.add('hidden');
        document.getElementById('error').classList.add('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    showError(message) {
        this.hideLoading();
        document.getElementById('errorText').textContent = message;
        document.getElementById('error').classList.remove('hidden');
        document.getElementById('results').classList.add('hidden');
    }

    hideError() {
        document.getElementById('error').classList.add('hidden');
    }

    showSuccessMessage(message) {
        // Create a temporary success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #48bb78;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    retryLastSearch() {
        const input = document.getElementById('companyInput').value.trim();
        if (input) {
            this.searchCompany();
        }
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the app when the page loads
const app = new SECApp();

// Add click outside listener to hide suggestions
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-section')) {
        app.hideSuggestions();
    }
}); 