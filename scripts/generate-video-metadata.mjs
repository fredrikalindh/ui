#!/usr/bin/env node

/**
 * Script to generate video metadata (aspect ratio + base64 placeholder) for lazy loading.
 * Run with: node scripts/generate-video-metadata.mjs
 * 
 * Requires ffmpeg to be installed.
 */

import { execSync } from 'child_process';
import { readdirSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, basename, extname } from 'path';

const PUBLIC_DIR = join(process.cwd(), 'public');
const OUTPUT_FILE = join(PUBLIC_DIR, 'video-metadata.json');
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov'];

function getVideoMetadata(videoPath) {
  const filename = basename(videoPath);
  console.log(`Processing: ${filename}`);

  try {
    // Get video dimensions using ffprobe
    const probeOutput = execSync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${videoPath}"`,
      { encoding: 'utf-8' }
    ).trim();
    
    const [width, height] = probeOutput.split(',').map(Number);
    const aspectRatio = width / height;

    // Extract a frame and create a tiny placeholder (10px wide for blur effect)
    const placeholderWidth = 20;
    const placeholderHeight = Math.round(placeholderWidth / aspectRatio);
    
    // Extract first frame, resize to tiny size, output as base64 JPEG
    const base64Output = execSync(
      `ffmpeg -y -i "${videoPath}" -vframes 1 -vf "scale=${placeholderWidth}:${placeholderHeight}" -f image2pipe -c:v mjpeg - 2>/dev/null | base64`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    ).trim().replace(/\n/g, '');

    const placeholder = `data:image/jpeg;base64,${base64Output}`;

    return {
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
  console.log('Generating video metadata...\n');

  // Find all video files in public directory
  const files = readdirSync(PUBLIC_DIR);
  const videoFiles = files.filter(file => 
    VIDEO_EXTENSIONS.includes(extname(file).toLowerCase())
  );

  if (videoFiles.length === 0) {
    console.log('No video files found in public directory.');
    return;
  }

  const metadata = {};

  for (const file of videoFiles) {
    const videoPath = join(PUBLIC_DIR, file);
    const result = getVideoMetadata(videoPath);
    if (result) {
      // Store with the public path as key (e.g., "/folder.mp4")
      metadata[`/${file}`] = result;
    }
  }

  // Write metadata to JSON file
  writeFileSync(OUTPUT_FILE, JSON.stringify(metadata, null, 2));
  console.log(`\nGenerated metadata for ${Object.keys(metadata).length} videos.`);
  console.log(`Output: ${OUTPUT_FILE}`);
}

main();

