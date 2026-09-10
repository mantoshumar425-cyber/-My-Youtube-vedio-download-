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

    if (
      typeof videoId !== "string" ||
      !/^[A-Za-z0-9_-]{11}$/.test(videoId)
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid YouTube video ID."
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
        success: true,
        videoId: videoId,
        title: "YouTube Video",
        thumbnail:
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Invalid request body."
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
