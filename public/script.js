document.getElementById("streamForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const key = document.getElementById("key").value;
  const m3u8 = document.getElementById("m3u8").value;

  const result = document.getElementById("result");
  result.textContent = "Starting stream...";

  try {
    const res = await fetch(`/stream/${key}/${encodeURIComponent(m3u8)}`);
    const data = await res.json();
    result.textContent = data.status;
  } catch (err) {
    result.textContent = "Error starting stream.";
  }
});