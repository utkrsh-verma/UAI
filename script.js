const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");

// Local memory
let memory = JSON.parse(localStorage.getItem("uai_memory")) || [];

function appendMessage(sender, text) {
  const div = document.createElement("div");
  div.innerText = `${sender}: ${text}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  if (!input) {
    console.error("Input element not found");
    return;
  }

  const message = input.value.trim();
  if (!message) return;

  appendMessage("You", message);
  input.value = "";

  memory.push({ role: "user", text: message });
  localStorage.setItem("uai_memory", JSON.stringify(memory));

  appendMessage("UAI", "thinking...");

  try {
    console.log("Sending message to /api/chat:", message);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, memory })
    });

    console.log("Fetch completed, status:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Server returned error:", errorText);
      chatBox.lastChild.innerText = "UAI: Error from server";
      return;
    }

    const data = await res.json();
    console.log("Server response:", data);

    chatBox.lastChild.innerText = "UAI: " + (data.reply || "No reply received");

    memory.push({ role: "uai", text: data.reply || "No reply received" });
    localStorage.setItem("uai_memory", JSON.stringify(memory));

  } catch (err) {
    console.error("Error sending message:", err);
    chatBox.lastChild.innerText = "UAI: Error talking to server";
  }
}

// ENTER key support
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

function clearMemory() {
  localStorage.removeItem("uai_memory");
  memory = [];
  chatBox.innerHTML = "";
  console.log("Memory cleared");
}
