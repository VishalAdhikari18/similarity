const express = require('express');
const multer = require('multer');
const cors = require('cors');
const natural = require('natural');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use /tmp for Heroku
    const uploadDir = process.env.NODE_ENV === 'production' ? '/tmp' : 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only text files
    if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt files are allowed'));
    }
  }
});

// Helper function to read file content
const readFileContent = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

// Calculate similarity between two documents
const calculateSimilarity = (doc1, doc2) => {
  try {
    // Tokenize and normalize the documents
    const tokenizer = new natural.WordTokenizer();
    const tokens1 = tokenizer.tokenize(doc1.toLowerCase());
    const tokens2 = tokenizer.tokenize(doc2.toLowerCase());

    if (!tokens1 || !tokens2 || tokens1.length === 0 || tokens2.length === 0) {
      throw new Error('One or both documents are empty or contain no valid words');
    }

    // Create TF-IDF vectors
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(tokens1);
    tfidf.addDocument(tokens2);

    // Calculate cosine similarity
    const vector1 = tfidf.tfidfs(tokens1);
    const vector2 = tfidf.tfidfs(tokens2);

    // Calculate cosine similarity manually
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      norm1 += vector1[i] * vector1[i];
      norm2 += vector2[i] * vector2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    const similarity = dotProduct / (norm1 * norm2);
    return isNaN(similarity) ? 0 : similarity;
  } catch (error) {
    console.error('Error calculating similarity:', error);
    throw error;
  }
};

// Routes
app.post('/api/compare', upload.array('documents', 2), async (req, res) => {
  try {
    if (!req.files || req.files.length !== 2) {
      return res.status(400).json({ error: 'Please upload exactly 2 documents' });
    }

    const [file1, file2] = req.files;
    console.log('Processing files:', file1.originalname, file2.originalname);

    const content1 = await readFileContent(file1.path);
    const content2 = await readFileContent(file2.path);

    if (!content1 || !content2) {
      throw new Error('Failed to read file contents');
    }

    console.log('File contents length:', content1.length, content2.length);

    const similarity = calculateSimilarity(content1, content2);
    console.log('Similarity score:', similarity);

    // Clean up uploaded files
    try {
      fs.unlinkSync(file1.path);
      fs.unlinkSync(file2.path);
    } catch (error) {
      console.error('Error cleaning up files:', error);
    }

    res.json({
      similarity: similarity,
      message: `Documents similarity score: ${similarity.toFixed(4)}`
    });
  } catch (error) {
    console.error('Error processing documents:', error);
    res.status(500).json({ 
      error: 'Error processing documents',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 