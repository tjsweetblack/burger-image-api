const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const dotenv = require('dotenv');
const cors = require('cors'); // Add cors

dotenv.config(); // Load environment variables

const app = express();
app.use(cors()); // Enable CORS

const upload = multer({ dest: 'uploads/' }); // Temporary upload folder

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Upload endpoint
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    res.json({ imageUrl: result.secure_url, public_id: result.public_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
