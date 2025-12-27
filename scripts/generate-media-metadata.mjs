#!/usr/bin/env node

/**
 * Script to generate media metadata (aspect ratio + base64 placeholder) for lazy loading.
 * Handles both videos (requires ffmpeg) and images (requires sharp via npx).
 * Run with: node scripts/generate-media-metadata.mjs
 */

import { execSync } from 'child_process';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, basename, extname } from 'path';

const PUBLIC_DIR = join(process.cwd(), 'public');
const OUTPUT_FILE = join(PUBLIC_DIR, 'media-metadata.json');
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov'];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

function getVideoMetadata(videoPath) {
  const filename = basename(videoPath);
  console.log(`Processing video: ${filename}`);

  try {
    // Get video dimensions using ffprobe
    const probeOutput = execSync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${videoPath}"`,
      { encoding: 'utf-8' }
    ).trim();
    
    const [width, height] = probeOutput.split(',').map(Number);
    const aspectRatio = width / height;

    // Extract a frame and create a tiny placeholder (20px wide for blur effect)
    const placeholderWidth = 20;
    const placeholderHeight = Math.round(placeholderWidth / aspectRatio);
    
    // Extract first frame, resize to tiny size, output as base64 JPEG
    const base64Output = execSync(
      `ffmpeg -y -i "${videoPath}" -vframes 1 -vf "scale=${placeholderWidth}:${placeholderHeight}" -f image2pipe -c:v mjpeg - 2>/dev/null | base64`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    ).trim().replace(/\n/g, '');

    const placeholder = `data:image/jpeg;base64,${base64Output}`;

    return {
      type: 'video',
      aspectRatio: Math.round(aspectRatio * 1000) / 1000,
      placeholder,
      width,
      height,
    };
  } catch (error) {
    console.error(`Error processing ${filename}:`, error.message);
    return null;
  }
}

function getImageMetadata(imagePath) {
  const filename = basename(imagePath);
  console.log(`Processing image: ${filename}`);

  try {
    // Use sips (built into macOS) to get image dimensions
    const sipsOutput = execSync(
      `sips -g pixelWidth -g pixelHeight "${imagePath}" 2>/dev/null`,
      { encoding: 'utf-8' }
    );
    
    const widthMatch = sipsOutput.match(/pixelWidth:\s*(\d+)/);
    const heightMatch = sipsOutput.match(/pixelHeight:\s*(\d+)/);
    
    if (!widthMatch || !heightMatch) {
      throw new Error('Could not parse image dimensions');
    }

    const width = parseInt(widthMatch[1], 10);
    const height = parseInt(heightMatch[1], 10);
    const aspectRatio = width / height;

    // Create a tiny placeholder using sips (resize) and base64
    const placeholderWidth = 20;
    const placeholderHeight = Math.round(placeholderWidth / aspectRatio);
    
    // Create temp file, resize, convert to base64
    const tempFile = `/tmp/placeholder_${Date.now()}.jpg`;
    execSync(
      `sips -s format jpeg -z ${placeholderHeight} ${placeholderWidth} "${imagePath}" --out "${tempFile}" 2>/dev/null`,
      { encoding: 'utf-8' }
    );
    
    const base64Output = execSync(`base64 -i "${tempFile}"`, { encoding: 'utf-8' })
      .trim()
      .replace(/\n/g, '');
    
    // Clean up temp file
    execSync(`rm -f "${tempFile}"`);

    const placeholder = `data:image/jpeg;base64,${base64Output}`;

    return {
      type: 'image',
      aspectRatio: Math.round(aspectRatio * 1000) / 1000,
      placeholder,
      width,
      height,
    };
  } catch (error) {
    console.error(`Error processing ${filename}:`, error.message);
    return null;
  }
}

function main() {
  console.log('Generating media metadata...\n');

  // Find all media files in public directory
  const files = readdirSync(PUBLIC_DIR);
  const videoFiles = files.filter(file => 
    VIDEO_EXTENSIONS.includes(extname(file).toLowerCase())
  );
  const imageFiles = files.filter(file => 
    IMAGE_EXTENSIONS.includes(extname(file).toLowerCase())
  );

  if (videoFiles.length === 0 && imageFiles.length === 0) {
    console.log('No media files found in public directory.');
    return;
  }

  const metadata = {};

  // Process videos
  for (const file of videoFiles) {
    const videoPath = join(PUBLIC_DIR, file);
    const result = getVideoMetadata(videoPath);
    if (result) {
      metadata[`/${file}`] = result;
    }
  }

  // Process images
  for (const file of imageFiles) {
    const imagePath = join(PUBLIC_DIR, file);
    const result = getImageMetadata(imagePath);
    if (result) {
      metadata[`/${file}`] = result;
    }
  }

  // Write metadata to JSON file
  writeFileSync(OUTPUT_FILE, JSON.stringify(metadata, null, 2));
  console.log(`\nGenerated metadata for ${Object.keys(metadata).length} media files.`);
  console.log(`Output: ${OUTPUT_FILE}`);
}

main();

