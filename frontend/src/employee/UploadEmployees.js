import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
const UploadEmployees = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const [previewData, setPreviewData] = useState([]);
    const [errors, setErrors] = useState([]); // Add state for errors

    // Handle file selection
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);

        // Read and preview Excel data
        const reader = new FileReader();
        reader.onload = (event) => {
            const binaryStr = event.target.result;
            const wb = XLSX.read(binaryStr, { type: "binary" });
            // Read the first sheet by default
            const ws = wb.Sheets[wb.SheetNames[0]];
            if (!ws) {
                setPreviewData([]);
                return;
            }
            const data = XLSX.utils.sheet_to_json(ws);
            setPreviewData(data);  // Store preview data
        };
        reader.readAsBinaryString(selectedFile);
    };

    // Upload the file
    const handleUpload = async () => {
        if (!file) {
            setMessage("Please select a file!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/uploadEmployees`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setMessage(response.data.message);
            setPreviewData([]); // Clear preview after upload
            // Check for errors in response
            if (response.data.errors && response.data.errors.length > 0) {
                setErrors(response.data.errors);
            } else {
                setErrors([]);
            }
        } catch (error) {
            console.error("Upload Error:", error);
            setMessage("Error uploading file");
            setErrors([error.response?.data?.message || "Unknown error"]);
        }
    };

    // Function to download the Excel template
    const handleDownloadTemplate = () => {
        const headers = ["Emp Name", "Emp Email", "Reviewer Email", "Role"];
        // Add a sample data row
        const sampleData = [" ", " ", " ", "Reviewer, Employee"];
        
        // Create a worksheet from headers and sample data
        const data = [headers, sampleData];
        const ws = XLSX.utils.aoa_to_sheet(data);
        
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, "EmployeeReviewerTemplate.xlsx");
    };

    return (
        <div className="app">
            <Navbar />
            <div className="content-wrapper">
                <Sidebar />
                <div className="dashboard-container">
                    <div className="container mt-5">
                        <h2 className="mb-3">Upload Employees from Excel</h2>

                        {/* Download Template Button */}
                        <button 
                            onClick={handleDownloadTemplate} 
                            className="btn btn-secondary mb-3 me-2"
                        >
                            Download Template
                        </button>

                        <div className="mb-3">
                            <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="form-control" />
                        </div>
                        <button onClick={handleUpload} className="btn btn-primary mb-3" style={{backgroundColor: "#167340"}}>Upload</button>
                        {message && <p className="alert alert-info">{message}</p>}

                        {/* Show errors if any */}
                        {errors.length > 0 && (
                            <div className="alert alert-danger">
                                <h5>Errors:</h5>
                                <ul>
                                    {errors.map((err, idx) => (
                                        <li key={idx}>{typeof err === 'string' ? err : JSON.stringify(err)}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {previewData.length > 0 && (
                            <div className="table-responsive">
                                <h4>Preview Data ({previewData.length} rows):</h4>
                                <table className="table table-bordered">
                                    <thead className="table-dark">
                                        <tr>
                                            {/* Dynamically generate table headers from previewData keys */}
                                            {Object.keys(previewData[0] || {}).map(key => (
                                                <th key={key}>{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.map((item, index) => (
                                            <tr key={index}>
                                                {Object.keys(previewData[0] || {}).map(key => (
                                                    <td key={key}>{item[key] || '-'}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>

    );
};

export default UploadEmployees;
