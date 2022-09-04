## Inspiration
Newsletters are an underpreciated medium and the experience of accessing them each morning could be made much more convenient if they hadn't to be clicked through one by one.
## What it does
Newscast aggregates all newsletters the user has received during the day and narrates the most salient points from each one using personable AI-generated summaries.
## How we built it
Fetching mail from Gmail API -> Generating transcripts in OpenAI -> Converting text to speech via Google Cloud -> Running on MUI frontend
## Challenges we ran into
Gmail API was surprisingly trickly to operate with; it took a long time to parse the email strings so that they are acceptable as input to the OpenAI API
## Accomplishments that we're proud of
We'll see!
## What we learned
A bit of frontend, many different APIs, connecting information gathered together through many different tools
## What's next for Newscast
Generating narratives grouped by publication/day/genre. 
