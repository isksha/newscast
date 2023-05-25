// player courtesy of https://www.npmjs.com/package/material-ui-audio-player
import {Box} from '@mui/system';
import {Typography} from '@mui/material';
import AudioPlayer from 'material-ui-audio-player';
// accordion courtesy of https://mui.com/material-ui/react-accordion/
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import sound from './output.mp3'
import text from './fulltext.json'

const transcript = text.text

export default function App() {
    return (
        <div className = "App">
            <header className = "App-header">
                <Typography variant = 'h2' component = 'p'>Your daily newsletter brief, automated!</Typography>
                <Box sx={{ width: '99%', position: 'fixed', top: 100}}>
                    <AudioPlayer
                        preload="auto"
                        src={sound}
                        muted="true"
                    />
                </Box>
                <Box sx={{ width: '99%', position: 'fixed', left: 5, top: 230, mb: 2 }}>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Typography>See the transcript!</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography id="modal-description"
                                        sx={{ whiteSpace: 'pre-line', mb: 2,
                                            display: "flex",
                                            flexDirection: "column",
                                            height: 500,
                                            overflow: "hidden",
                                            overflowY: "scroll"}}>
                                {transcript}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </header>
        </div>
    );
}
