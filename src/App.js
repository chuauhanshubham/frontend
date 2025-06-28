import React, { useState } from 'react';
import './App.css';

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

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      const response = await fetch('https://backend-fqhj.onrender.com/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setMerchants(data.merchants);
      setSelectedMerchants(data.merchants);
    } catch (error) {
      console.error('Error uploading file:', error);
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
      alert('Please fill all fields');
      return;
    }

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
        alert(error.error || 'Error generating summary');
        return;
      }

      const data = await response.json();
      setSummaryData(data.summary);
      setDateRange(data.dateRange);
      setDownloadUrl(data.downloadUrl);
    } catch (error) {
      console.error('Error generating summary:', error);
    }
  };

  const downloadExcel = () => {
    if (downloadUrl) {
      window.open(`https://backend-fqhj.onrender.com${downloadUrl}`, '_blank');
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
      <h2>Upload Excel</h2>
      <input type="file" onChange={handleFileUpload} accept=".xlsx,.xls" />

      {merchants.length > 0 && (
        <div className="container">
          <div className="filter-section">
            <h3>Filter Options</h3>

            <label>Select Merchants:</label><br />
            <button onClick={toggleAllMerchants}>
              {allSelected ? 'Uncheck All' : 'Select All'}
            </button><br /><br />
            
            <div className="merchant-list">
              {merchants.map((merchant) => (
                <label key={merchant}>
                  <input
                    type="checkbox"
                    checked={selectedMerchants.includes(merchant)}
                    onChange={() => handleMerchantChange(merchant)}
                  />
                  {merchant}
                </label>
              ))}
            </div>

            <label>Enter Percentage:</label><br />
            <input
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              step="0.01"
              required
            /><br /><br />

            <label>Select Date Range:</label><br />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            /><br /><br />

            <button onClick={generateSummary}>Generate Summary</button>
          </div>

          {summaryData.length > 0 && (
            <div className="summary-section">
              <h3>Merchant Summary:</h3>
              <div className="date-range">Date Range: {dateRange}</div>
              <table>
                <thead>
                  <tr>
                    <th>Merchant</th>
                    <th>Total Withdrawal</th>
                    <th>Total Fees</th>
                    <th>% Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryData.map((row, index) => (
                    <tr key={index}>
                      <td>{row.Merchant}</td>
                      <td>{row['Total Withdrawal Amount']}</td>
                      <td>{row['Total Withdrawal Fees']}</td>
                      <td>{row[`${percentage}% Amount`]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={downloadExcel}>Download Excel File</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;