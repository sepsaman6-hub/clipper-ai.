
const fileInput = document.getElementById("videoInput");
const video = document.getElementById("videoPreview");
const uploadButton = document.getElementById("uploadButton");

if (fileInput && video) {
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Pilih file video terlebih dahulu.");
      fileInput.value = "";
      return;
    }

    video.src = URL.createObjectURL(file);
    video.load();
  });
}

if (uploadButton && fileInput) {
  uploadButton.addEventListener("click", () => {
    fileInput.click();
  });
}
