import logo from './logo.svg';
import './App.css';
import Transcription from './Pages/Transcription/Transcription';
import '@fontsource/roboto';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});


function App() {
  return (
    <div>

      <ThemeProvider theme={theme}>
        <Transcription />
      </ThemeProvider>
    </div>
  );
}

export default App;
