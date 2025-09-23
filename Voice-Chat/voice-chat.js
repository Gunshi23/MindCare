const API_KEY = "AIzaSyBdCANz8kiQgLqqk8x6fWAE1Pw7EIPO5tc"; // Do not provide a real API key. The Canvas will provide it in runtime.
        const TEXT_MODEL_NAME = "gemini-2.5-flash-preview-05-20";
        const TTS_MODEL_NAME = "gemini-2.5-flash-preview-tts";

        let mediaRecorder;
        let audioChunks = [];

        const recordButton = document.getElementById('recordButton');
        const stopButton = document.getElementById('stopButton');
        const chatBox = document.getElementById('chat-box');
        const themeToggle = document.getElementById('theme-toggle');

        recordButton.onclick = startRecording;
        stopButton.onclick = stopRecording;
        themeToggle.onclick = toggleTheme;

        function toggleTheme() {
            document.body.classList.toggle('dark');
        }

        async function startRecording() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };
                mediaRecorder.onstop = processAudio;
                
                mediaRecorder.start();
                recordButton.disabled = true;
                stopButton.disabled = false;
                addMessage('Recording...', 'bot');
            } catch (error) {
                console.error('Error accessing microphone:', error);
                addMessage('Failed to access microphone. Please check permissions.', 'bot');
            }
        }

        function stopRecording() {
            mediaRecorder.stop();
            recordButton.disabled = false;
            stopButton.disabled = true;
        }

        async function processAudio() {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            addMessage('<audio controls src="' + audioUrl + '"></audio>', 'user');
            
            const arrayBuffer = await audioBlob.arrayBuffer();
            const base64Audio = arrayBufferToBase64(arrayBuffer);
            
            const loadingMessage = addMessage('<div id="loading"></div>', 'bot');

            try {
                // Step 1: Call the multi-modal model for transcription and text response
                const textResponse = await callTextAPI(base64Audio);
                
                // Update the loading message with the transcribed text
                loadingMessage.innerHTML = textResponse;

                // Step 2: Call the TTS model to get the audio for the text response
                await callTTSAPI(textResponse);
                
            } catch (error) {
                console.error('Error in processing:', error);
                loadingMessage.textContent = 'Sorry, I could not generate a response. Please try again.';
            }
        }
        
        function arrayBufferToBase64(buffer) {
            let binary = '';
            const bytes = new Uint8Array(buffer);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        }

        async function callTextAPI(audioData) {
            let retries = 0;
            const maxRetries = 3;
            const initialDelay = 1000;

            const payload = {
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: "Provide a friendly, helpful chatbot response based on this audio. Do not include a transcription in the response."},
                            { inlineData: { mimeType: "audio/webm", data: audioData } }
                        ]
                    }
                ]
            };
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL_NAME}:generateContent?key=${API_KEY}`;
            
            while (retries < maxRetries) {
                try {
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    
                    if (!response.ok) {
                        const errorResponse = await response.json();
                        console.error('Text API call failed with status:', response.status);
                        console.error('Text API response body:', errorResponse);
                        throw new Error(`Text API call failed with status: ${response.status}`);
                    }

                    const result = await response.json();
                    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
                    
                    if (text) {
                        return text;
                    } else {
                        throw new Error('Text response was empty.');
                    }
                } catch (error) {
                    console.error('Error calling Text API:', error);
                    retries++;
                    if (retries < maxRetries) {
                        await new Promise(res => setTimeout(res, initialDelay * Math.pow(2, retries - 1)));
                    } else {
                        throw error;
                    }
                }
            }
        }

        async function callTTSAPI(text) {
            let retries = 0;
            const maxRetries = 3;
            const initialDelay = 1000;

            const payload = {
                contents: [
                    {
                        role: "user",
                        parts: [{ text: text }]
                    }
                ],
                generationConfig: {
                    responseModalities: ["AUDIO"],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: "Zephyr" }
                        }
                    }
                },
            };
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL_NAME}:generateContent?key=${API_KEY}`;
            
            while (retries < maxRetries) {
                try {
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        const errorResponse = await response.json();
                        console.error('TTS API call failed with status:', response.status);
                        console.error('TTS API response body:', errorResponse);
                        throw new Error(`TTS API call failed with status: ${response.status}`);
                    }

                    const result = await response.json();
                    const audioBase64 = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData && p.inlineData.mimeType.startsWith('audio/'))?.inlineData?.data;

                    if (audioBase64) {
                        const audioData = base64ToArrayBuffer(audioBase64);
                        const wavBlob = pcmToWav(new Int16Array(audioData), 24000);
                        const audioUrl = URL.createObjectURL(wavBlob);
                        
                        addMessage(`<audio controls autoplay src="${audioUrl}"></audio>`, 'bot');
                    } else {
                        throw new Error('Audio response was empty.');
                    }
                    return;
                } catch (error) {
                    console.error('Error calling TTS API:', error);
                    retries++;
                    if (retries < maxRetries) {
                        await new Promise(res => setTimeout(res, initialDelay * Math.pow(2, retries - 1)));
                    } else {
                        throw error;
                    }
                }
            }
        }

        function base64ToArrayBuffer(base64) {
            const binaryString = window.atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        }

        function pcmToWav(pcmData, sampleRate) {
            const numChannels = 1;
            const bytesPerSample = 2;
            const blockAlign = numChannels * bytesPerSample;
            const byteRate = sampleRate * blockAlign;
            
            const buffer = new ArrayBuffer(44 + pcmData.length * bytesPerSample);
            const view = new DataView(buffer);
            
            // RIFF chunk
            writeString(view, 0, 'RIFF');
            view.setUint32(4, 36 + pcmData.length * bytesPerSample, true);
            writeString(view, 8, 'WAVE');
            
            // FMT chunk
            writeString(view, 12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true); // PCM format
            view.setUint16(22, numChannels, true);
            view.setUint32(24, sampleRate, true);
            view.setUint32(28, byteRate, true);
            view.setUint16(32, blockAlign, true);
            view.setUint16(34, bytesPerSample * 8, true);
            
            // DATA chunk
            writeString(view, 36, 'data');
            view.setUint32(40, pcmData.length * bytesPerSample, true);
            
            // Write PCM data
            let offset = 44;
            for (let i = 0; i < pcmData.length; i++) {
                view.setInt16(offset, pcmData[i], true);
                offset += bytesPerSample;
            }
            
            return new Blob([view], { type: 'audio/wav' });
        }
        
        function writeString(view, offset, string) {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        }

        function addMessage(text, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message fade-in ${sender}-message`;
            messageDiv.innerHTML = text;
            chatBox.appendChild(messageDiv);
            chatBox.scrollTop = chatBox.scrollHeight;
            return messageDiv; // Return the new message element for later updates
        }