# Document Similarity Detector

A web application that compares two text documents and calculates their similarity score. Built with Node.js, Express, and React.

## Features

- Upload and compare two text documents
- Calculate similarity score between 0 and 1
- Modern and responsive UI
- Real-time feedback and error handling

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository
2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
```

## Running the Application

1. Start the backend server:
```bash
npm start
```

2. In a new terminal, start the frontend development server:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Usage

1. Open the application in your web browser
2. Click "Select Documents" to choose two text files
3. Click "Compare Documents" to see the similarity score
4. The result will show a percentage indicating how similar the documents are

## API Endpoints

- POST /api/compare - Compare two documents
- GET /api/health - Health check endpoint

## Technologies Used

- Backend:
  - Node.js
  - Express
  - Multer (file upload)
  - Natural (text processing)
  - CORS

- Frontend:
  - React
  - Material-UI
  - Axios
  - CSS3 