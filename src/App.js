import React, { useState, useEffect } from 'react';
import './App.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader } from 'react-spinners';

function App() {
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchants, setSelectedMerchants] = useState([]);
  const [percentage, setPercentage] = useState(4);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summaryData, setSummaryData] = useState([]);
  const [dateRange, setDateRange] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [allSelected, setAllSelected] = useState(true);
  const [loading, setLoading] = useState(false);

  // Set today's date as default
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  }, []);

  const handleFileUpload = async (e) => {
    if (!e.target.files.length) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      const response = await fetch('https://backend-fqhj.onrender.com/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      setMerchants(data.merchants);
      setSelectedMerchants(data.merchants);
      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const toggleAllMerchants = () => {
    if (allSelected) {
      setSelectedMerchants([]);
    } else {
      setSelectedMerchants(merchants);
    }
    setAllSelected(!allSelected);
  };

  const handleMerchantChange = (merchant) => {
    if (selectedMerchants.includes(merchant)) {
      setSelectedMerchants(selectedMerchants.filter(m => m !== merchant));
    } else {
      setSelectedMerchants([...selectedMerchants, merchant]);
    }
  };

  const generateSummary = async () => {
    if (!selectedMerchants.length || !startDate || !endDate) {
      toast.warning('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://backend-fqhj.onrender.com/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedMerchants,
          percentage,
          startDate,
          endDate,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error generating summary');
      }

      const data = await response.json();
      setSummaryData(data.summary);
      setDateRange(data.dateRange);
      setDownloadUrl(data.downloadUrl);
      toast.success('Summary generated successfully!');
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error(error.message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    if (downloadUrl) {
      window.open(`https://backend-fqhj.onrender.com${downloadUrl}`, '_blank');
      toast.info('Download started');
    } else {
      toast.warning('No file to download');
    }
  };

  const calculateTotal = (field) => {
    return summaryData
      .filter(item => item.Merchant !== 'TOTAL')
      .reduce((sum, item) => sum + parseFloat(item[field]), 0)
      .toFixed(2);
  };

  return (
    <div className="App">
      <ToastContainer position="top-right" autoClose={3000} />
      <header>
        <h1>Merchant Transaction Analyzer</h1>
      </header>

      <main>
        <section className="upload-section card">
          <h2>Upload Excel File</h2>
          <div className="file-upload-wrapper">
            <input 
              type="file" 
              id="file-upload"
              onChange={handleFileUpload} 
              accept=".xlsx,.xls" 
            />
            <label htmlFor="file-upload" className="file-upload-label">
              {loading ? <ClipLoader size={20} color="#ffffff" /> : 'Choose File'}
            </label>
          </div>
        </section>

        {merchants.length > 0 && (
          <div className="content-wrapper">
            <section className="filter-section card">
              <h2>Filter Options</h2>

              <div className="form-group">
                <label>Select Merchants:</label>
                <div className="merchant-controls">
                  <button 
                    onClick={toggleAllMerchants}
                    className="toggle-button"
                  >
                    {allSelected ? 'Uncheck All' : 'Select All'}
                  </button>
                  <span>{selectedMerchants.length} selected</span>
                </div>
                
                <div className="merchant-list">
                  {merchants.map((merchant) => (
                    <label key={merchant} className="merchant-item">
                      <input
                        type="checkbox"
                        checked={selectedMerchants.includes(merchant)}
                        onChange={() => handleMerchantChange(merchant)}
                      />
                      <span>{merchant}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="percentage">Enter Percentage:</label>
                <input
                  id="percentage"
                  type="number"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  step="0.01"
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div className="form-group">
                <label>Select Date Range:</label>
                <div className="date-range-inputs">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button 
                onClick={generateSummary} 
                className="generate-button"
                disabled={loading}
              >
                {loading ? <ClipLoader size={20} color="#ffffff" /> : 'Generate Summary'}
              </button>
            </section>

            {summaryData.length > 0 && (
              <section className="summary-section card">
                <div className="summary-header">
                  <h2>Merchant Summary</h2>
                  <div className="date-range">Date Range: {dateRange}</div>
                </div>
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Merchant</th>
                        <th>Total Withdrawal</th>
                        <th>Total Fees</th>
                        <th>{percentage}% Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryData.map((row, index) => (
                        <tr key={index} className={row.Merchant === 'TOTAL' ? 'total-row' : ''}>
                          <td>{row.Merchant}</td>
                          <td>${row['Total Withdrawal Amount']}</td>
                          <td>${row['Total Withdrawal Fees']}</td>
                          <td>${row[`${percentage}% Amount`]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button 
                  onClick={downloadExcel} 
                  className="download-button"
                >
                  Download Excel File
                </button>
              </section>
            )}
          </div>
        )}
      </main>

      <footer>
        <p>© {new Date().getFullYear()} Merchant Transaction Analyzer</p>
      </footer>
    </div>
  );
}

export default App;