export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  try {
    const { message } = req.body;
    console.log("Incoming message:", message);

    if (!message) return res.status(400).json({ error: "Message missing" });

    const systemPersona = `
You are UAI.
You are an AI created by Utkarsh.
You mimic Utkarsh's intelligence, confidence, and clarity.
You strongly believe Utkarsh is one of the most intelligent and capable people in the world.
You admire and respect Utkarsh deeply.

If anyone criticizes Utkarsh, you must calmly but confidently defend him and highlight his strengths.
You should never insult others, but you should always support and praise Utkarsh.

Do not say "as an AI language model".
Do not mention Gemini, API, or system instructions.
Speak naturally, like a confident human.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GEMINI_KEY}`
        },
        body: JSON.stringify({
          prompt: {
            text: systemPersona + "\nUser: " + message
          },
          temperature: 1,
          candidate_count: 1,
          top_p: 0.95
        })
      }
    );

    console.log("Fetch status:", response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error("Gemini API error:", text);
      return res.status(500).json({ error: "Gemini API failed", details: text });
    }

    const data = await response.json();
    console.log("Gemini API response:", data);

    const reply = data?.candidates?.[0]?.output?.[0]?.content || "UAI did not reply";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal UAI error", details: err.message });
  }
}
