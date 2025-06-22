import axios from 'axios';

export const listenAudio = async (TTS,voice_id) => {
    try {

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}?output_format=mp3_44100_128`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "xi-api-key": "sk_7b2a24bd403219e500ab4ee700e412989d1b87771b71d862",
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
        const response = await axios.get('http://localhost:5000/api/getOpenAIResponse');
    // Use response.data.message as needed
    return response.data.message;
    }
    catch (error) {
        console.error("Error fetching Gemini response:", error);
    }
}

export const sendUserResponse = async (userResponse,groundTruth) => {
    try {
        const response = await axios.post('http://localhost:8000/userResponse', { userInput: userResponse,
      groundTruth: groundTruth, });
        return response.data;
    } catch (error) {
        console.error("Error sending user response:", error);
    }
}