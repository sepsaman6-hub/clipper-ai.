
const fileInput = document.getElementById("videoInput");
const video = document.getElementById("videoPreview");
const uploadButton = document.getElementById("uploadButton");
const previewButton = document.getElementById("previewClip");
const startInput = document.getElementById("startTime");
const endInput = document.getElementById("endTime");
const message = document.getElementById("message");

let videoURL = "";

if (uploadButton && fileInput) {
  uploadButton.addEventListener("click", () => fileInput.click());
}

if (fileInput && video) {
  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Silakan pilih file video.");
      fileInput.value = "";
      return;
    }

    if (videoURL) URL.revokeObjectURL(videoURL);
    videoURL = URL.createObjectURL(file);
    video.src = videoURL;
    video.load();

    if (message) {
      message.textContent = "Video siap diputar. Atur waktu klip di bawah.";
    }
  });
}

if (previewButton && video && startInput && endInput) {
  previewButton.addEventListener("click", () => {
    const start = Number(startInput.value);
    const end = Number(endInput.value);

    if (!video.src || !Number.isFinite(start) ||
        !Number.isFinite(end) || start < 0 || end <= start) {
      if (message) {
        message.textContent = "Pilih video dan periksa waktu mulai serta selesai.";
      }
      return;
    }

    if (Number.isFinite(video.duration) && end > video.duration) {
      if (message) {
        message.textContent =
          "Waktu selesai melebihi durasi video.";
      }
      return;
    }

    video.currentTime = start;
    video.play();

    if (message) {
      message.textContent =
        `Memutar pratinjau mulai detik ${start}. Hentikan di detik ${end}.`;
    }

    const stopPreview = () => {
      if (video.currentTime >= end) {
        video.pause();
        video.removeEventListener("timeupdate", stopPreview);
      }
    };

    video.addEventListener("timeupdate", stopPreview);
  });
}

const checkButton = document.getElementById("checkButton");
const youtubeUrl = document.getElementById("youtubeUrl");
const youtubeMessage = document.getElementById("youtubeMessage");

if (checkButton && youtubeUrl && youtubeMessage) {
  checkButton.addEventListener("click", async () => {
    youtubeMessage.textContent = "Memeriksa tautan...";

    try {
      const response = await fetch("/api/source-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl.value.trim() })
      });

      const result = await response.json();
      youtubeMessage.textContent = result.message;
    } catch {
      youtubeMessage.textContent =
        "Tidak bisa memeriksa tautan. Pastikan website sudah dijalankan.";
    }
  });
}
