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

const transcript = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi pulvinar placerat magna sit amet posuere. Curabitur interdum, nibh id hendrerit dictum, risus eros pellentesque nibh, in fermentum nunc libero ut justo. In hac habitasse platea dictumst. Nunc id lacus ullamcorper, blandit libero nec, dignissim turpis. Nunc placerat nisi quis quam maximus varius. Duis ullamcorper eu ex ac congue. Nam eu scelerisque tellus, vitae vehicula turpis. Sed vitae varius magna, in convallis ligula. Mauris rhoncus massa lorem, vel tempus quam luctus vitae.\n
            
Donec quis lacinia augue. Nam at purus a nisi luctus dignissim in non tellus. Curabitur a erat ut dolor maximus posuere. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Integer accumsan dui tellus, ut ultrices libero molestie at. In dui massa, mattis at leo nec, porttitor pharetra elit. Maecenas eget lorem tincidunt, sodales sem eget, egestas felis. In vestibulum finibus odio, vitae venenatis lectus dapibus eu. Aenean pharetra dolor nec gravida dictum.\n
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ut volutpat lorem. Suspendisse gravida, sem vel gravida condimentum, sapien odio lobortis massa, sagittis fermentum neque nisi et odio. Maecenas eros felis, rhoncus in lectus ut, interdum tincidunt massa. In nibh tellus, placerat placerat velit vel, suscipit pharetra ex. Aenean quis lorem arcu. Aliquam a gravida erat, et placerat massa. Donec interdum tincidunt nunc, vel luctus odio fringilla nec.\n
Nulla ut leo eu urna ullamcorper ullamcorper non sit amet nibh. Nunc semper erat sit amet nisi tincidunt, id maximus nunc consequat. Morbi a augue justo. In dui nulla, finibus ac odio et, pellentesque maximus odio. Praesent at mi nec nisi hendrerit pretium pulvinar nec nisl. Nulla felis mi, euismod eget porta eu, vestibulum sit amet arcu. Maecenas vehicula auctor mollis. Vivamus quis sem sed risus hendrerit dignissim nec ut eros. Maecenas vel elementum tellus. Aliquam lorem justo, auctor vel pharetra at, maximus ut erat.\n
Sed suscipit justo lobortis volutpat auctor. Morbi rutrum est libero, eget congue libero fermentum lacinia. Donec ac ullamcorper tellus, sed vulputate ante. Aenean ut aliquam lorem. Sed vitae eros et lectus efficitur tristique. Integer ut gravida quam. Phasellus ornare metus leo, sed rutrum lectus luctus sit amet. Nam porta eros ut massa efficitur euismod.`

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
          <Box sx={{ width: '99%', position: 'fixed', top: 230, mb: 2 }}>
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
