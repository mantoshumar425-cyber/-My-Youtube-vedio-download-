export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Method not allowed"
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  try {
    const body = await req.json();

    const videoId = body?.videoId;
    const format = body?.format || "720";

    if (
      typeof videoId !== "string" ||
      !/^[A-Za-z0-9_-]{11}$/.test(videoId)
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid video ID."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const allowedFormats = [
      "720",
      "1080",
      "480",
      "audio"
    ];

    if (!allowedFormats.includes(format)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid format."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error:
          "No authorized video file is connected yet. Connect your own video storage/file source to enable downloads."
      }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Invalid JSON request."
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}
