document.getElementById("chat-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    
    
    const userInput = document.getElementById("user_input").value;
    const fileInput = document.getElementById("file_input").files[0];  
    if (userInput.trim() === "" && !fileInput) return;  

    
    addMessage("user", userInput);

    
    document.getElementById("user_input").value = "";

    
    const typingMessage = addMessage("bot", "Typing...");

    
    const formData = new FormData();
    formData.append("user_input", userInput);
    if (fileInput) {
        formData.append("file", fileInput);  
    }

    
    try {
        const response = await fetch("/get_response", {
            method: "POST",
            body: formData,  
        });

        const data = await response.json();

        
        const formattedResponse = formatBotMessage(data.response);

        
        typingMessage.innerHTML = formattedResponse;
    } catch (error) {
        console.error("Error:", error);
        typingMessage.textContent = "Sorry, something went wrong. Please try again.";
    }
});


function addMessage(sender, text) {
    const messageElement = document.createElement("div");
    messageElement.classList.add(sender);
    
    if (sender === "bot") {
        messageElement.innerHTML = text; 
    } else {
        messageElement.textContent = text; 
    }

    document.getElementById("messages").appendChild(messageElement);
    document.getElementById("chatbox").scrollTop = document.getElementById("chatbox").scrollHeight;
    return messageElement;
}


function formatBotMessage(message) {
    
    const points = message.split(/(?:\n|[0-9]+\.\s+|- )/).filter(Boolean);
    
    
    return points.map(point => `<p>${point.trim()}</p>`).join("");
}


document.getElementById("voice_command").addEventListener("click", function() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = function() {
        console.log("Voice recognition started.");  
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById("user_input").value = transcript;  
        document.getElementById("chat-form").dispatchEvent(new Event('submit'));  
    };

    recognition.onerror = function(event) {
        console.error("Speech recognition error:", event.error);
    };

    recognition.start();  
});