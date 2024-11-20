import React, { useState } from 'react';
import Papa from 'papaparse'; // Library for parsing CSV files
import Child1 from './Child1';

function App() {
  const [data, setData] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          setData(results.data);
        },
      });
    }
  };

  return (
    <div className="App">
      <h1>Stock Price Visualizer</h1>
      <div>
        <label htmlFor="fileInput">Upload CSV File: </label>
        <input
          type="file"
          id="fileInput"
          accept=".csv"
          onChange={handleFileUpload}
        />
      </div>
      {data ? (
        <Child1 data={data} />
      ) : (
        <p>Please upload a CSV file to visualize the data.</p>
      )}
    </div>
  );
}

export default App;
