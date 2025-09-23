 // !! IMPORTANT: Storing API key directly is for demonstration ONLY.
        // For production, use a secure backend proxy to prevent exposure.
        const API_KEY = "AIzaSyBdCANz8kiQgLqqk8x6fWAE1Pw7EIPO5tc"; // Replace with your actual key
        const MODEL_ID = "gemini-2.5-flash-preview-05-20";
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${API_KEY}`;
        
        const SYSTEM_PROMPT = "You are a helpful and empathetic mental wellness assistant. Your goal is to provide supportive, non-judgmental, and general advice.";

        const chatBox = document.getElementById("chatBox");
        const input = document.getElementById("userInput");
        const themeToggle = document.getElementById("themeToggle");

        function addMessage(text, sender) {
            const msg = document.createElement("div");
            msg.classList.add("message", sender);
            msg.innerText = text;
            chatBox.appendChild(msg);
            chatBox.scrollTop = chatBox.scrollHeight;
            return msg;
        }

        function addTypingIndicator() {
            const typing = document.createElement("div");
            typing.classList.add("typing");
            typing.id = "typing";
            typing.innerHTML = `
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            `;
            chatBox.appendChild(typing);
            chatBox.scrollTop = chatBox.scrollHeight;
            return typing;
        }

        async function sendMessage() {
            const text = input.value.trim();
            if (!text) return;

            addMessage(text, "user");
            input.value = "";

            const typingMsg = addTypingIndicator();

            try {
                const payload = {
                    "contents": [{"parts": [{"text": text}]}],
                    "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]}
                };

                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(payload)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                typingMsg.remove();
                
                const botResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
                addMessage(botResponse, "bot");
            } catch (error) {
                typingMsg.remove();
                addMessage(`⚠️ Error: ${error.message}`, "bot");
            }
        }

        input.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
            }
        });

        themeToggle.addEventListener("change", () => {
            document.body.classList.toggle("dark", themeToggle.checked);
        });

        addMessage("Hi, I’m MindCare 🤖. How are you feeling today?", "bot");