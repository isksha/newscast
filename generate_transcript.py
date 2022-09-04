# import os
import openai
import retrieve_from_gmail
# from flask import Flask, redirect, render_template, request, url_for

# app = Flask(__name__)
openai.api_key = "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"
newsletters = retrieve_from_gmail.main()
transcript = [(0, "Good morning, here is your morning briefing, powered by Newscast.")]


def generate_summarize_prompt(text):
    return """Summarize the following in three to five sentences with a conversational tone:
    "{}" """.format(text)


def summarize(text):
    reply = openai.Completion.create(
        model="text-davinci-002",
        prompt=generate_summarize_prompt(text),
        temperature=0.6,
        max_tokens=1000
    )
    return reply['choices'][0]['text'][2:]


def up_next_segment():
    for idx, elt in enumerate(newsletters):
        transcript.append((idx + 1, summarize(elt[2])))
up_next_segment()
transcript.append((0, "Buh bye"))

print(transcript)
