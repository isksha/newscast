# Text-to-speech API from https://cloud.google.com/text-to-speech/

import openai
import retrieve_from_gmail
from google.cloud import texttospeech

openai.api_key = "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"
newsletters = retrieve_from_gmail.main()
transcript = [(0, "Good morning, here is your morning briefing, powered by Newscast.")]
fulltext = ''

def generate_summarize_prompt(text):
    return """Summarize the following newsletter in three to four sentences in the third person:
    "{}" """.format(text)


def summarize(text):
    reply = openai.Completion.create(
        model="text-davinci-002",
        prompt=generate_summarize_prompt(text),
        temperature=0.6,
        max_tokens=700
    )
    return reply['choices'][0]['text'][2:]


def up_next_segment():
    for idx, elt in enumerate(newsletters):
        transcript.append((idx + 1, summarize(elt[2])))


up_next_segment()
transcript.append((0, "Buh bye"))


def generate_string():
    for i in transcript:
        global fulltext
        fulltext += i[1] + '\n'


generate_string()



# Instantiates a client
client = texttospeech.TextToSpeechClient()

# Set the text input to be synthesized
synthesis_input = texttospeech.SynthesisInput(text=fulltext)

# Build the voice request, select the language code ("en-US") and the ssml
# voice gender ("neutral")
voice = texttospeech.VoiceSelectionParams(
language_code="en-US", ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
)

# Select the type of audio file you want returned
audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)

# Perform the text-to-speech request on the text input with the selected
# voice parameters and audio file type
response = client.synthesize_speech(
    input=synthesis_input, voice=voice, audio_config=audio_config
)

# The response's audio_content is binary.
with open("newscast/src/output.mp3", "wb") as out:
    # Write the response to the output file.
    out.write(response.audio_content)
    print('Audio content written to file "output.mp3"')
