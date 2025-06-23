import axios from 'axios';

export const listenAudio = async (TTS, voice_id) => {
    try {
        const response = await axios.get('http://localhost:5000/api/getElevenLabsResponse', {
            params: { TTS: TTS, voice_id: voice_id },
            responseType: 'blob'
        });
        console.log(response);
       
        return response.data;

    } catch (error) {
        console.error("Error playing audio:", error);
    }
}

export const getGeminiResponse = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/getOpenAIResponse');
        // Use response.data.message as needed
        return response.data.message;
    }
    catch (error) {
        console.error("Error fetching Gemini response:", error);
    }
}

export const sendUserResponse = async (userResponse, groundTruth) => {
    try {
        const response = await axios.post('http://localhost:8000/userResponse', {
            userInput: userResponse,
            groundTruth: groundTruth,
        });
        return response.data;
    } catch (error) {
        console.error("Error sending user response:", error);
    }
}