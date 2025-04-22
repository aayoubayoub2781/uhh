require("dotenv").config();
const express = require("express");
const { spawn } = require("child_process");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (for assets like CSS, JS)
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Streaming endpoint
app.get("/stream/:key/:m3u8", (req, res) => {
  const { key, m3u8 } = req.params;

  const decodedM3u8 = decodeURIComponent(m3u8);
  const fbUrl = `rtmps://live-api-s.facebook.com:443/rtmp/${key}`;

  const ffmpeg = spawn(ffmpegPath, [
    "-re",
    "-i", decodedM3u8,
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-tune", "zerolatency",
    "-b:v", "2500k",
    "-bufsize", "3000k",
    "-s", "1280x720", // Set video resolution to 720p
    "-c:a", "aac",
    "-b:a", "96k",
    "-ac", "2",
    "-f", "flv",
    fbUrl,
  ]);

  ffmpeg.stderr.on("data", data => {
    console.log(`[ffmpeg] ${data}`);
  });

  ffmpeg.on("close", code => {
    console.log(`FFmpeg exited with code ${code}`);
  });

  ffmpeg.on("error", err => {
    console.error("FFmpeg error:", err.message);
  });

  res.json({
    message: "Streaming started.",
    stream_to: fbUrl,
    input: decodedM3u8,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
