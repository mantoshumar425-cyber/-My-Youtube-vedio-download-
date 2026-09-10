const API_BASE =
  "https://youtube-vedio-download.novasearch.workers.dev";


/* =========================
   ELEMENTS
========================= */

const urlInput =
  document.getElementById("urlInput");

const clearButton =
  document.getElementById("clearButton");

const analyzeButton =
  document.getElementById("analyzeButton");

const downloadButton =
  document.getElementById("downloadButton");

const themeToggle =
  document.getElementById("themeToggle");

const message =
  document.getElementById("message");

const resultCard =
  document.getElementById("resultCard");

const thumbnail =
  document.getElementById("thumbnail");

const videoTitle =
  document.getElementById("videoTitle");

const videoIdElement =
  document.getElementById("videoId");

const formatOptions =
  document.querySelectorAll(".format-option");


/* =========================
   STATE
========================= */

let currentVideoId = null;
let selectedFormat = "720";


/* =========================
   THEME
========================= */

const savedTheme =
  localStorage.getItem("mytube-theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
}

function updateThemeButton() {
  const dark =
    document.body.classList.contains("dark");

  if (themeToggle) {
    themeToggle.textContent =
      dark ? "☼" : "◐";

    themeToggle.setAttribute(
      "aria-label",
      dark
        ? "Switch to light theme"
        : "Switch to dark theme"
    );
  }
}

updateThemeButton();

themeToggle?.addEventListener(
  "click",
  () => {

    document.body.classList.toggle("dark");

    const dark =
      document.body.classList.contains("dark");

    localStorage.setItem(
      "mytube-theme",
      dark ? "dark" : "light"
    );

    updateThemeButton();
  }
);


/* =========================
   MESSAGE
========================= */

function showMessage(
  text,
  type = "info"
) {
  if (!message) return;

  message.textContent = text;

  message.className =
    "message show " + type;
}

function hideMessage() {
  if (!message) return;

  message.textContent = "";
  message.className = "message";
}


/* =========================
   VALIDATE VIDEO ID
========================= */

function isValidVideoId(videoId) {

  return /^[A-Za-z0-9_-]{11}$/.test(
    videoId
  );

}


/* =========================
   EXTRACT YOUTUBE ID
========================= */

function extractVideoId(value) {

  if (!value) {
    return null;
  }

  try {

    const url =
      new URL(value.trim());

    const hostname =
      url.hostname.toLowerCase();


    /* youtube.com/watch?v= */

    if (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com"
    ) {

      const watchId =
        url.searchParams.get("v");

      if (
        watchId &&
        isValidVideoId(watchId)
      ) {
        return watchId;
      }


      /* /shorts/VIDEO_ID */

      const shortsMatch =
        url.pathname.match(
          /\/shorts\/([A-Za-z0-9_-]{11})/
        );

      if (shortsMatch) {
        return shortsMatch[1];
      }


      /* /embed/VIDEO_ID */

      const embedMatch =
        url.pathname.match(
          /\/embed\/([A-Za-z0-9_-]{11})/
        );

      if (embedMatch) {
        return embedMatch[1];
      }


      /* /live/VIDEO_ID */

      const liveMatch =
        url.pathname.match(
          /\/live\/([A-Za-z0-9_-]{11})/
        );

      if (liveMatch) {
        return liveMatch[1];
      }

    }


    /* youtu.be/VIDEO_ID */

    if (
      hostname === "youtu.be"
    ) {

      const id =
        url.pathname
          .split("/")
          .filter(Boolean)[0];

      if (
        id &&
        isValidVideoId(id)
      ) {
        return id;
      }

    }

  } catch (error) {

    return null;

  }

  return null;
}


/* =========================
   RESET RESULT
========================= */

function resetResult() {

  currentVideoId = null;

  if (resultCard) {
    resultCard.classList.remove("show");
  }

  if (downloadButton) {
    downloadButton.disabled = true;
  }

  if (thumbnail) {
    thumbnail.removeAttribute("src");
  }

  if (videoTitle) {
    videoTitle.textContent =
      "YouTube Video";
  }

  if (videoIdElement) {
    videoIdElement.textContent = "";
  }

}


/* =========================
   CLEAR BUTTON
========================= */

clearButton?.addEventListener(
  "click",
  () => {

    urlInput.value = "";

    resetResult();

    hideMessage();

    urlInput.focus();

  }
);


/* =========================
   FORMAT SELECTION
========================= */

formatOptions.forEach(
  (option) => {

    option.addEventListener(
      "click",
      () => {

        formatOptions.forEach(
          (item) => {
            item.classList.remove(
              "active"
            );
          }
        );

        option.classList.add(
          "active"
        );

        selectedFormat =
          option.dataset.format ||
          "720";

      }
    );

  }
);


/* =========================
   ANALYZE
========================= */

analyzeButton?.addEventListener(
  "click",
  async () => {

    const input =
      urlInput.value.trim();


    if (!input) {

      showMessage(
        "Paste a YouTube video URL first.",
        "error"
      );

      urlInput.focus();

      return;
    }


    const videoId =
      extractVideoId(input);


    if (!videoId) {

      resetResult();

      showMessage(
        "Please enter a valid YouTube video URL.",
        "error"
      );

      return;
    }


    currentVideoId =
      videoId;


    analyzeButton.disabled = true;

    analyzeButton.innerHTML =
      "Analyzing <span>...</span>";


    downloadButton.disabled =
      true;


    showMessage(
      "Analyzing video URL...",
      "info"
    );


    try {

      const response =
        await fetch(
          `${API_BASE}/api/analyze`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              videoId: videoId
            })
          }
        );


      let data;

      try {
        data =
          await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response."
        );
      }


      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.error ||
          "Unable to analyze this video."
        );

      }


      const imageUrl =
        data.thumbnail ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;


      thumbnail.src =
        imageUrl;


      thumbnail.onerror =
        () => {

          thumbnail.src =
            `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

        };


      videoTitle.textContent =
        data.title ||
        "Authorized YouTube Video";


      videoIdElement.textContent =
        `Video ID: ${videoId}`;


      resultCard.classList.add(
        "show"
      );


      downloadButton.disabled =
        false;


      showMessage(
        "Video recognized successfully. Select a format.",
        "success"
      );


    } catch (error) {

      console.error(
        "Analyze error:",
        error
      );


      resetResult();


      showMessage(
        error.message ||
        "Unable to analyze the URL.",
        "error"
      );


    } finally {

      analyzeButton.disabled =
        false;

      analyzeButton.innerHTML =
        'Analyze <span>→</span>';

    }

  }
);


/* =========================
   DOWNLOAD
========================= */

downloadButton?.addEventListener(
  "click",
  async () => {

    if (!currentVideoId) {

      showMessage(
        "Analyze a video first.",
        "error"
      );

      return;
    }


    downloadButton.disabled =
      true;

    downloadButton.innerHTML =
      '<span>...</span> Checking file';


    showMessage(
      "Checking for an authorized video file...",
      "info"
    );


    try {

      const response =
        await fetch(
          `${API_BASE}/api/download`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              videoId:
                currentVideoId,

              format:
                selectedFormat
            })
          }
        );


      let data;

      try {
        data =
          await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response."
        );
      }


      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.error ||
          "Authorized file is not available."
        );

      }


      if (
        data.downloadUrl
      ) {

        const link =
          document.createElement("a");

        link.href =
          data.downloadUrl;

        link.download =
          "";

        link.target =
          "_blank";

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();


        showMessage(
          "Download started.",
          "success"
        );

      } else {

        showMessage(
          "The authorized file is ready, but the server did not return a download URL.",
          "info"
        );

      }


    } catch (error) {

      console.error(
        "Download error:",
        error
      );


      showMessage(
        error.message ||
        "Authorized download is currently unavailable.",
        "error"
      );


    } finally {

      downloadButton.disabled =
        false;

      downloadButton.innerHTML =
        '<span>↓</span> Download Authorized File';

    }

  }
);


/* =========================
   ENTER KEY
========================= */

urlInput?.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Enter") {

      event.preventDefault();

      analyzeButton.click();

    }

  }
);


/* =========================
   INPUT EVENTS
========================= */

urlInput?.addEventListener(
  "input",
  () => {

    if (
      !urlInput.value.trim()
    ) {
      resetResult();
      hideMessage();
    }

  }
);


/* =========================
   INITIAL STATE
========================= */

resetResult();
