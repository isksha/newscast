# Text-to-speech API from https://cloud.google.com/text-to-speech/
from datetime import datetime
import openai
import json

import retrieve_from_gmail
from google.cloud import texttospeech

openai.api_key = ""
newsletters = retrieve_from_gmail.main()[:5]
article_count = 0

fulltext = "Good morning! Here is your daily briefing, curated from your newsletters. "
fulltext += 'Today is ' + datetime.today().strftime('%A, %B %d.') + '\n'


def generate_summarize_prompt(text):
    return """Summarize the following newsletter in three to four sentences in the third person and with a conversational tone:
    "{}" """.format(text)


def summarize(text):
    reply = openai.Completion.create(
        model="text-davinci-002",
        prompt=generate_summarize_prompt(text),
        temperature=0.7,
        max_tokens=700
    )
    return reply['choices'][0]['text']


def up_next(i):
    global fulltext
    if i == 0:
        segment = "Here's your first update of the day:"
    elif i == len(newsletters) - 1:
        segment = "And here is the final newsletter for the day:"
    else:
        segment = "Next up:"
    fulltext += segment + '\n'


def summarizing_segment(i):
    global fulltext
    fulltext += summarize(newsletters[i][2])
    fulltext += '\n'


for i in range(len(newsletters)):
    up_next(i)
    summarizing_segment(i)

fulltext += "That's everything for today; thanks for tuning into Newscast!"


def text_to_speech(fulltext):
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
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3)

    # Perform the text-to-speech request on the text input with the selected
    # voice parameters and audio file type
    response = client.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )

    # The response's audio_content is binary.
    with open("newscast/src/output.mp3", "wb") as out:
        # Write the response to the output file.
        out.write(response.audio_content)


def export_json():
    dictionary = {
        "text": fulltext
    }

    json_object = json.dumps(dictionary)
    with open("newscast/src/fulltext.json", "w") as outfile:
        outfile.write(json_object)


print(fulltext)
text_to_speech(fulltext)
export_json()
