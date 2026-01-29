const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// local memory (browser)
let memory = JSON.parse(localStorage.getItem("uai-memory")) || [];

async function sendMessage() {
  const userMessage = input.value.trim();
  if (!userMessage) return;

  // show user message
  chatBox.innerHTML += `<div class="user">You: ${userMessage}</div>`;
  input.value = "";

  // show thinking
  const thinkingDiv = document.createElement("div");
  thinkingDiv.className = "bot";
  thinkingDiv.innerText = "UAI is thinking...";
  chatBox.appendChild(thinkingDiv);

  // save to memory
  memory.push({ role: "user", content: userMessage });
  localStorage.setItem("uai-memory", JSON.stringify(memory));

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: userMessage,
        memory: memory
      })
    });

    if (!res.ok) {
      throw new Error("API failed");
    }

    const data = await res.json();

    // remove thinking
    chatBox.removeChild(thinkingDiv);

    // show reply
    chatBox.innerHTML += `<div class="bot">UAI: ${data.reply}</div>`;

    // save bot reply
    memory.push({ role: "assistant", content: data.reply });
    localStorage.setItem("uai-memory", JSON.stringify(memory));

    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    chatBox.removeChild(thinkingDiv);
    chatBox.innerHTML += `<div class="bot error">Error: API not responding</div>`;
    console.error(err);
  }
}

// button click
sendBtn.addEventListener("click", sendMessage);

// enter to send
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
