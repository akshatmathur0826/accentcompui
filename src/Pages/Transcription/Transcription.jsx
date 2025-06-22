// AccentComprehensionApp.jsx
import React, { useState, useRef, useEffect } from "react";
import {
    Container, Typography, Card, CardContent, Button, TextField, Select,
    MenuItem, FormControl, InputLabel, Tabs, Tab, Box, CircularProgress,
    IconButton, Slider
} from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import SpeedIcon from '@mui/icons-material/Speed';

import { listenAudio, getGeminiResponse, sendUserResponse } from "./TranscriptionService";

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
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const audioRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        return () => clearInterval(intervalRef.current); // Cleanup
    }, []);

    const startTimer = () => {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (audioRef.current) {
                setCurrentTime(audioRef.current.currentTime);
            }
        }, 200);
    };

    const createAndPlayAudio = async (text, voiceId) => {
        try {
            const response = await listenAudio(text, voiceId);
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.playbackRate = playbackSpeed;
            audio.onended = () => {
                setIsPlaying(false);
                clearInterval(intervalRef.current);
            };
            audio.onloadedmetadata = () => {
                setDuration(audio.duration);
            };
            audioRef.current = audio;
            audio.play();
            setIsPlaying(true);
            startTimer();
        } catch (error) {
            console.error("Error playing audio:", error);
        }
    };

    const playAudioFromText = async (text) => {
        await createAndPlayAudio(text, accentOptions[selectedAccent].voice_id);
    };

    const handlePlayNewAudio = async () => {
        setLoading(true);
        const generatedText = await getGeminiResponse();
        if (!generatedText) {
            setLoading(false);
            return;
        }
        setGroundTruth(generatedText);
        await playAudioFromText(generatedText);
        setLoading(false);
        setScore(null);
    };

    const handleAccentChange = async (e) => {
        handlePause();
        const newAccent = e.target.value;
        setSelectedAccent(newAccent);
        if (groundTruth) {
            await createAndPlayAudio(groundTruth, accentOptions[newAccent].voice_id);
        }
    };

    const handlePlay = () => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackSpeed;
            audioRef.current.play();
            setIsPlaying(true);
            startTimer();
        }
    };

    const handlePause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
            clearInterval(intervalRef.current);
        }
    };

    const handleReplay = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.playbackRate = playbackSpeed;
            audioRef.current.play();
            setIsPlaying(true);
            startTimer();
        }
    };

    const handleSliderChange = (_, newValue) => {
        if (audioRef.current) {
            audioRef.current.currentTime = newValue;
            setCurrentTime(newValue);
        }
    };

    const handleSubmit = async () => {
        try {
            const res = await sendUserResponse(userInput, groundTruth);
            console.log("User response submitted:", res);
            if (res && res.combined_score) {
                setScore(res.combined_score);
            }
        } catch (err) {
            console.error("Error submitting user response:", err);
        }
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
                        <IconButton onClick={isPlaying ? handlePause : handlePlay} disabled={!audioRef.current}>
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

                    {/* Progress Bar */}
                    {duration > 0 && (
                        <Slider
                            value={currentTime}
                            min={0}
                            max={duration}
                            step={0.1}
                            onChange={handleSliderChange}
                            sx={{ mt: -2 }}
                        />
                    )}

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
                            disabled={!userInput || !groundTruth}
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
                        <Box textAlign="center" mt={4}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Accuracy Score:{" "}
                                <span style={{ color: score >= 85 ? "green" : score >= 60 ? "#fbc02d" : "red" }}>
                                    {score}%
                                </span>
                            </Typography>

                            <Typography variant="body2" gutterBottom sx={{ fontStyle: "italic" }}>
                                {score >= 85
                                    ? "🎯 Excellent comprehension!"
                                    : score >= 60
                                    ? "👍 Good attempt, try again for better clarity."
                                    : "⚠️ Needs improvement. Listen again carefully."}
                            </Typography>

                            <Box mt={3}>
                                <Typography variant="subtitle1" fontWeight="medium">Correct Transcript:</Typography>
                                <Typography variant="body2" sx={{
                                    mt: 1,
                                    p: 2,
                                    backgroundColor: "#f5f5f5",
                                    borderRadius: "8px",
                                    fontStyle: "italic"
                                }}>
                                    {groundTruth}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};

export default AccentComprehensionApp;
