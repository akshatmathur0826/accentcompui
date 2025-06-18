import axios from 'axios';
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.elevenlabsAPI;
export const listenAudio = async (TTS,voice_id) => {
    try {
        console.log(voice_id)
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}?output_format=mp3_44100_128`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "xi-api-key": API_KEY,
            },
            body: JSON.stringify({
                text: TTS,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    speed: 1.2,
                },
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch audio");
        }
        return response;
        
    } catch (error) {
        console.error("Error playing audio:", error);
    }
}

export const getGeminiResponse = async () => {
    try{
        const response = await axios.get('http://localhost:8000/api/getOpenAIResponse');
    // Use response.data.message as needed
    return response.data.message;
    }
    catch (error) {
        console.error("Error fetching Gemini response:", error);
    }
}