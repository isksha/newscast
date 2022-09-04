## Inspiration
Newsletters are an underpreciated medium and the experience of accessing them each morning could be made much more convenient if they hadn't to be clicked through one by one. Furthermore, with all the craze around AI, why not have an artificial companion to deliver the morning updates to us?
## What it does
Newscast aggregates all newsletters a Gmail user has received during the day and narrates the most salient points from each one using personable AI-generated summaries powered by OpenAI.
## How we built it
Fetching mail from Gmail API -> Generating transcripts in OpenAI -> Converting text to speech via Google Cloud -> Running on MUI frontend
## Challenges we ran into
Gmail API was surprisingly trickly to operate with; it took a long time to bring the email strings to a form where OpenAi wouldn't struggle with them too much.
## Accomplishments that we're proud of
Building a full-stack app that we could see ourselves using! Successfully tackling a front-end solution on React, after spending most of our time doing backend.
## What we learned
Integrating APIs with one another, building a workable frontend solution in React and MUI.
## What's next for Newscast
Generating narratives grouped by publication/day/genre. Adding more UI features, e.g. cards pertaining to indidividual newspapers.
