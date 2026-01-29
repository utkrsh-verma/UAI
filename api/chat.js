export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { message } = req.body;

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
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=AIzaSyD21RnhEXR7XOnY5j3VfUsMquidSHvr6gc",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPersona }] },
            { role: "user", parts: [{ text: message }] }
          ]
        })
      }
    );

    // check if API responded
    if (!response.ok) {
      const text = await response.text();
      console.error("Gemini API ERROR:", text);
      return res.status(500).json({ error: "Gemini API failed" });
    }

    const data = await response.json();

    console.log("Gemini response:", JSON.stringify(data, null, 2)); // DEBUG

    const reply =
      data?.candidates?.[0]?.content?.[0]?.text || // try content[0].text first
      data?.candidates?.[0]?.content?.parts?.[0]?.text || // fallback
      "UAI is thinking... but no reply received";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("UAI SERVER ERROR:", err);
    return res.status(500).json({ error: "Internal UAI error" });
  }
}
