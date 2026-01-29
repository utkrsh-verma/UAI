export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message missing" });

    const systemPersona = `
You are UAI.
You are an AI created by Utkarsh.
You mimic Utkarsh's intelligence, confidence, and clarity.
...
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GEMINI_KEY}` // ✅ env variable
        },
        body: JSON.stringify({
          contents: [
            { role: "system", parts: [{ text: systemPersona }] },
            { role: "user", parts: [{ text: message }] }
          ]
        })
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Gemini API ERROR:", text);
      return res.status(500).json({ error: "Gemini API failed" });
    }

    const data = await response.json();

    console.log("Gemini response:", JSON.stringify(data, null, 2));

    let reply = "UAI is thinking...";
    if (data?.candidates?.length) {
      reply = data.candidates[0]?.content?.[0]?.text ||
              data.candidates[0]?.content?.parts?.[0]?.text ||
              reply;
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("UAI SERVER ERROR:", err);
    return res.status(500).json({ error: "Internal UAI error" });
  }
}
