const ALLOWED_FORMATS = [
  "720",
  "1080",
  "480",
  "audio"
];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400"
};


export default {
  async fetch(request, env) {

    const url = new URL(request.url);


    /* =========================
       CORS PREFLIGHT
    ========================= */

    if (request.method === "OPTIONS") {

      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      });

    }


    /* =========================
       HEALTH
    ========================= */

    if (
      request.method === "GET" &&
      url.pathname === "/api/health"
    ) {

      return json({
        success: true,
        service: "MyTube Downloader V2",
        status: "online",
        storage: "none",
        authorizedDownloadsOnly: true
      });

    }


    /* =========================
       ANALYZE
    ========================= */

    if (
      request.method === "POST" &&
      url.pathname === "/api/analyze"
    ) {

      return analyzeVideo(request);

    }


    /* =========================
       DOWNLOAD
    ========================= */

    if (
      request.method === "POST" &&
      url.pathname === "/api/download"
    ) {

      return downloadVideo(request);

    }


    /* =========================
       API 404
    ========================= */

    return json({
      success: false,
      error: "API endpoint not found."
    }, 404);

  }
};


/* =========================
   ANALYZE VIDEO
========================= */

async function analyzeVideo(request) {

  try {

    const body =
      await request.json();

    const videoId =
      String(
        body.videoId || ""
      ).trim();


    if (
      !isValidVideoId(videoId)
    ) {

      return json({
        success: false,
        error: "Invalid YouTube video ID."
      }, 400);

    }


    return json({

      success: true,

      videoId,

      title:
        "Authorized YouTube Video",

      thumbnail:
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,

      message:
        "Video URL recognized successfully."

    });

  } catch (error) {

    return json({
      success: false,
      error: "Invalid JSON request."
    }, 400);

  }

}


/* =========================
   DOWNLOAD VIDEO
========================= */

async function downloadVideo(request) {

  try {

    const body =
      await request.json();


    const videoId =
      String(
        body.videoId || ""
      ).trim();


    const format =
      String(
        body.format || "720"
      ).trim();


    /* VIDEO ID */

    if (
      !isValidVideoId(videoId)
    ) {

      return json({
        success: false,
        error: "Invalid video ID."
      }, 400);

    }


    /* FORMAT */

    if (
      !ALLOWED_FORMATS.includes(format)
    ) {

      return json({
        success: false,
        error: "Unsupported format."
      }, 400);

    }


    /*
      No media extraction is performed here.

      An authorized file source can be connected
      later. For now this endpoint clearly reports
      that no authorized file storage is configured.
    */

    return json({

      success: false,

      authorized: true,

      videoId,

      format,

      error:
        "No authorized video file is connected to this Worker yet."

    }, 503);


  } catch (error) {

    return json({
      success: false,
      error: "Invalid JSON request."
    }, 400);

  }

}


/* =========================
   VIDEO ID VALIDATION
========================= */

function isValidVideoId(videoId) {

  return /^[A-Za-z0-9_-]{11}$/.test(
    videoId
  );

}


/* =========================
   JSON RESPONSE
========================= */

function json(
  data,
  status = 200
) {

  return new Response(
    JSON.stringify(
      data,
      null,
      2
    ),
    {
      status,

      headers: {
        ...CORS_HEADERS,

        "Content-Type":
          "application/json; charset=utf-8",

        "Cache-Control":
          "no-store"
      }
    }
  );

}
