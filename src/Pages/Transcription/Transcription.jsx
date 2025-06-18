// AccentComprehensionApp.jsx
import React, { useState, useRef } from "react";
import {
    Container, Typography, Card, CardContent, Button, TextField, Select,
    MenuItem, FormControl, InputLabel, Tabs, Tab, Box, CircularProgress,
    IconButton
} from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import SpeedIcon from '@mui/icons-material/Speed';

import { listenAudio, getGeminiResponse } from "./TranscriptionService";

const accentOptions = {
    us: { voice_id: "EXAVITQu4vr4xnSDxMaL", lang: "us" },
    gb: { voice_id: "JBFqnCBsd6RMkjVDRZzb", lang: "gb" },
    au: { voice_id: "IKne3meq5aSn9XLyUdCD", lang: "au" },
    zh: { voice_id: "jGf6Nvwr7qkFPrcLThmD", lang: "zh" },
    sc: { voice_id: "y6p0SvBlfEe2MH4XN7BP", lang: "sc" }
};

const AccentComprehensionApp = () => {
    const [selectedAccent, setSelectedAccent] = useState("us");
    const [userInput, setUserInput] = useState("");
    const [score, setScore] = useState(null);
    const [showTranscript, setShowTranscript] = useState(false);
    const [tabIndex, setTabIndex] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [groundTruth, setGroundTruth] = useState("");
    const [loading, setLoading] = useState(false);
    const audioRef = useRef(null);

    const createAndPlayAudio = async (text, voiceId) => {
        setLoading(true);
        try {
            const response = await listenAudio(text, voiceId);
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.playbackRate = playbackSpeed;
            audio.onended = () => setIsPlaying(false);
            audioRef.current = audio;
            audio.play();
            setIsPlaying(true);
        } catch (error) {
            console.error("Error playing audio:", error);
        } finally {
            setLoading(false);
        }
    };

    const playAudioFromText = async (text) => {
        await createAndPlayAudio(text, accentOptions[selectedAccent].voice_id);
    };

    const handlePlayNewAudio = async () => {
        const generatedText = await getGeminiResponse();
        if (!generatedText) return;
        setGroundTruth(generatedText);
        await playAudioFromText(generatedText);
    };

    const handleAccentChange = async (e) => {
        const newAccent = e.target.value;
        setSelectedAccent(newAccent);
        if (groundTruth) await createAndPlayAudio(groundTruth, accentOptions[newAccent].voice_id);
    };

    const handlePlay = () => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackSpeed;
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handlePause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleReplay = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.playbackRate = playbackSpeed;
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleSubmit = () => {
        // Future: NLP based comparison
        // const words1 = userInput.trim().toLowerCase().split(/\s+/);
        // const words2 = groundTruth.toLowerCase().split(/\s+/);
        // const matched = words1.filter((word, idx) => word === words2[idx]);
        // const percentage = Math.round((matched.length / words2.length) * 100);
        // setScore(percentage);
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Accent Comprehension Tool
            </Typography>

            <Tabs
                value={tabIndex}
                onChange={(_, newValue) => setTabIndex(newValue)}
                centered
                textColor="primary"
                indicatorColor="primary"
                sx={{ mb: 3 }}
            >
                <Tab label="Transcription" />
                <Tab label="Dialog Flow" disabled />
                <Tab label="Repeat Mode" disabled />
            </Tabs>

            <Card elevation={4} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Choose Accent</InputLabel>
                        <Select
                            value={selectedAccent}
                            label="Choose Accent"
                            onChange={handleAccentChange}
                        >
                            <MenuItem value="us">🇺🇸 American</MenuItem>
                            <MenuItem value="gb">🇬🇧 British</MenuItem>
                            <MenuItem value="au">🇦🇺 Australian</MenuItem>
                            <MenuItem value="zh">🇨🇳 Chinese</MenuItem>
                            <MenuItem value="sc">🇸🇨 Scottish</MenuItem>
                        </Select>
                    </FormControl>

                    <Box display="flex" justifyContent="center">
                        <Button
                            variant="contained"
                            onClick={handlePlayNewAudio}
                            disabled={loading}
                            sx={{
                                backgroundColor: "black",
                                color: "white",
                                textTransform: "none",
                                borderRadius: 5,
                                px: 4,
                                fontWeight: "bold"
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Play New Audio"}
                        </Button>
                    </Box>

                    <Box display="flex" justifyContent="center" alignItems="center" gap={2} flexWrap="wrap">
                        <IconButton
                            onClick={isPlaying ? handlePause : handlePlay}
                            disabled={!audioRef.current}
                        >
                            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>
                        <IconButton onClick={handleReplay} disabled={!audioRef.current}>
                            <ReplayIcon />
                        </IconButton>

                        <FormControl size="small" sx={{ minWidth: 80 }}>
                            <InputLabel><SpeedIcon fontSize="small" /></InputLabel>
                            <Select
                                value={playbackSpeed}
                                onChange={(e) => {
                                    const newSpeed = e.target.value;
                                    setPlaybackSpeed(newSpeed);
                                    if (audioRef.current) {
                                        audioRef.current.playbackRate = newSpeed;
                                    }
                                }}
                                label="Speed"
                            >
                                {[0.5, 1.0, 1.25, 1.5, 2.0].map(speed => (
                                    <MenuItem key={speed} value={speed}>{speed}x</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <TextField
                        fullWidth
                        label="Type what you heard"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        multiline
                        rows={3}
                        size="small"
                    />

                    <Box display="flex" justifyContent="center">
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            sx={{
                                backgroundColor: "black",
                                color: "white",
                                textTransform: "none",
                                borderRadius: 5,
                                px: 4,
                                fontWeight: "bold"
                            }}
                        >
                            Submit
                        </Button>
                    </Box>

                    {score !== null && (
                        <Box textAlign="center" mt={2}>
                            <Typography variant="h6" fontWeight="medium">Accuracy: {score}%</Typography>
                            <Button
                                variant="outlined"
                                onClick={() => setShowTranscript(!showTranscript)}
                                sx={{ mt: 1 }}
                            >
                                {showTranscript ? "Hide" : "Show"} Correct Transcript
                            </Button>
                            {/* {showTranscript && <Typography variant="body2" sx={{ mt: 1 }}>{groundTruth}</Typography>} */}
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};

export default AccentComprehensionApp;
