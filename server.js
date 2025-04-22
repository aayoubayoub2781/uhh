require("dotenv").config();
const express = require("express");
const { spawn } = require("child_process");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

// Streaming Endpoint
app.get("/stream/:key/:m3u8", (req, res) => {
  const fbKey = req.params.key;
  const m3u8 = req.params.m3u8;

  const fbUrl = `rtmps://live-api-s.facebook.com:443/rtmp/${fbKey}`;

  const ffmpeg = spawn(ffmpegPath, [
    "-re",
    "-i", decodeURIComponent(m3u8),
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-tune", "zerolatency",
    "-maxrate", "2500k",
    "-bufsize", "3000k",
    "-c:a", "aac",
    "-b:a", "96k",
    "-ac", "2",
    "-f", "flv",
    fbUrl
  ]);

  ffmpeg.stderr.on("data", data => console.log(`[ffmpeg] ${data}`));

  ffmpeg.on("close", code => {
    console.log(`FFmpeg exited with code ${code}`);
  });

  res.json({ status: "Stream started", fbUrl });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});