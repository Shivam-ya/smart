const https = require('https');
const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '..', 'public', 'models');

if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

const baseUrl = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/';

const files = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2'
];

function downloadFile(filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(modelsDir, filename);
    if (fs.existsSync(filePath)) {
      console.log(`${filename} already exists, skipping.`);
      return resolve();
    }
    
    console.log(`Downloading ${filename}...`);
    const file = fs.createWriteStream(filePath);
    
    https.get(baseUrl + filename, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      console.error(`Error downloading ${filename}: ${err.message}`);
      reject(err);
    });
  });
}

async function main() {
  for (const file of files) {
    try {
      await downloadFile(file);
    } catch (err) {
      console.error('Download failed.');
      process.exit(1);
    }
  }
  console.log('All models downloaded successfully!');
}

main();
