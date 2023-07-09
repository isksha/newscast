from __future__ import print_function
from dotenv import dotenv_values
import openai
from datetime import datetime
from datetime import date
from bs4 import BeautifulSoup
import os.path
import base64
import os
import sys

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


def fetch_emails():
    """Shows basic usage of the Gmail API.
    Lists the user's Gmail labels.
    # """

    # suppress output from gmail API
    org_stdout = sys.stdout
    f = open(os.devnull, 'w')
    sys.stdout = f

    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('../utils/token.json'):
        creds = Credentials.from_authorized_user_file(
            '../utils/token.json', SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                '../utils/credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('../utils/token.json', 'w') as token:
            token.write(creds.to_json())

    try:
        # Call the Gmail API
        start_date = datetime.strptime(
            sys.argv[1], '%m-%d-%Y').strftime("%Y/%m/%d")
        end_date = datetime.strptime(
            sys.argv[2], '%m-%d-%Y').strftime("%Y/%m/%d") if len(sys.argv) > 2 else date.today().strftime("%Y/%m/%d")
        service = build('gmail', 'v1', credentials=creds)
        query = f'"listid" OR "newsletter" AND before:{end_date} AND after:{start_date}'
        newsletter_ids = service.users().messages().list(
            userId='me', q=query).execute().get('messages', [])

        # Create list of tuples for each newsletter.
        newsletters = []

        # Add the 3-tuple to the list. [0] is sender, [1] is subject, [2] is full text.
        for my_id in newsletter_ids:
            newsletter_full = service.users().messages().get(
                userId='me', id=my_id['id'], format='full').execute()
            payload = newsletter_full['payload']

            # Retrieve sender and subject
            sender = ''
            subject = ''
            for header in payload['headers']:
                if header['name'] == 'From':
                    sender = header['value'].rsplit(' ', 1)[0]
                elif header['name'] == 'Subject':
                    subject = header['value']

            # Retrieve body text of newsletter
            data = payload['parts'][1]['body']['data']
            html_body = base64.urlsafe_b64decode(data).decode('utf-8')
            html_body = html_body.replace('\u200c', '')
            html_body = html_body.replace('\xa0', ' ')
            normalized_html_body = ' '.join(html_body.split())
            soup = BeautifulSoup(normalized_html_body, 'html.parser')
            full_text = soup.get_text()
            full_text = full_text.replace(f"{chr(32)}{chr(32)}", '')

            # Add the 3-tuple to the list. [0] is sender, [1] is subject, [2] is full text.
            newsletter = (sender, subject, full_text)
            newsletters.append(newsletter)
        sys.stdout = org_stdout
        return newsletters

    except HttpError as error:
        return None


# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

config = dotenv_values("../.env")
openai.api_key = config['OPENAI_API_KEY']

newsletters = fetch_emails()[:5]

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


if not len(newsletters):
    fulltext = "There are no newsletters in your inbox today. Come back tomorrow for a more exciting Newscast!"
else:
    for i in range(len(newsletters)):
        up_next(i)
        summarizing_segment(i)
    fulltext += "That's everything for today; thanks for tuning into Newscast!"

print(fulltext)
