// index.js
const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const dotenv = require('dotenv');
const cors = require('cors');
const streamifier = require('streamifier'); // Import streamifier

dotenv.config();

const app = express();
app.use(cors());

// Change to memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// Upload endpoint
app.post('/upload', upload.single('image'), async (req, res) => {
    console.log("Request Received"); // Debug: Request received
    console.log("File Received:", req.file); // Debug: File received (multer)

    if (!req.file) {
        console.log("No file received"); // Debug: No file
        return res.status(400).json({ error: 'No file provided' });
    }

    try {
        console.log("Starting Cloudinary Upload"); // Debug: Cloudinary start

        // Convert buffer to stream
        const stream = streamifier.createReadStream(req.file.buffer);

        // Upload the stream
        const result = await new Promise((resolve, reject) => {
            const streamUpload = cloudinary.uploader.upload_stream(
                { resource_type: 'image' },
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
            stream.pipe(streamUpload);
        });

        console.log("Cloudinary Result:", result); // Debug: Cloudinary result

        res.json({ imageUrl: result.secure_url, public_id: result.public_id });
    } catch (error) {
        console.error("Cloudinary Error:", error); // Debug: Cloudinary error (detailed)
        console.log("Cloudinary Error Stringified:", JSON.stringify(error)); // Debug: Cloudinary error stringified

        res.status(500).json({ error: 'Upload failed' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
