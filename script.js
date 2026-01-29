document.addEventListener("DOMContentLoaded", () => {

  const chatBox = document.getElementById("chat-box");
  const input = document.getElementById("user-input");

  if (!chatBox || !input) {
    console.error("Required elements not found in DOM");
    return;
  }

  // local memory
  let memory = JSON.parse(localStorage.getItem("uai_memory")) || [];

  function appendMessage(sender, text) {
    const div = document.createElement("div");
    div.innerText = `${sender}: ${text}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    appendMessage("You", message);
    input.value = "";

    memory.push({ role: "user", text: message });
    localStorage.setItem("uai_memory", JSON.stringify(memory));

    appendMessage("UAI", "thinking...");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, memory })
      });

      const data = await res.json();

      chatBox.lastChild.innerText = "UAI: " + data.reply;

      memory.push({ role: "uai", text: data.reply });
      localStorage.setItem("uai_memory", JSON.stringify(memory));

    } catch (err) {
      chatBox.lastChild.innerText = "UAI: error talking to server";
      console.error(err);
    }
  }

  // expose functions globally (IMPORTANT)
  window.sendMessage = sendMessage;

  window.clearMemory = function () {
    localStorage.removeItem("uai_memory");
    memory = [];
    chatBox.innerHTML = "";
  };

  // ENTER key
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

});
