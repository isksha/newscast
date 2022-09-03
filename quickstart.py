from __future__ import print_function
from datetime import date
from bs4 import BeautifulSoup

import os.path
import base64
import email
from email import parser

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']


def main():
    """Shows basic usage of the Gmail API.
    Lists the user's Gmail labels.
    """
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    try:
        # Call the Gmail API
        service = build('gmail', 'v1', credentials=creds)
        query = '"listid" OR "newsletter" AND after:{}'.format(date.today().strftime("%Y/%m/%d"))
        newsletter_ids = service.users().messages().list(userId='me', q=query).execute().get('messages', [])
        # for newsletter in newsletter_ids:
            # txt = service.users().messages().get(userId='me', id=newsletter['id']).execute()
            # try:
            #     payload = txt['payload']
            #     parts = payload.get('parts')[0]
            #     data = parts['body']['data']
            #     data = data.replace("-","+").replace("_","/")
            #     decoded_data = base64.b64decode(data)
            #     soup = BeautifulSoup(decoded_data, "html.parser")
                # body = soup.body()
                # text = []
                # for para in body.find_all("p"):
                #     text.append(para)
                # print(text)                # print("Subject: ", subject)
                # print("From: ", sender)
                # print("Message: ", body)
                # print('\n')
            # except:
            #     print("here")
            #     pass


        # newsletter_ids = [elt['id'] for elt in newsletter_ids]
        newsletter_raw = []

        for elt in newsletter_ids:
            newsletter = service.users().messages().get(userId='me', id=elt['id'], format='raw').execute()
            newsletter = base64.urlsafe_b64decode(newsletter['raw'].encode('ASCII'))
            newsletter_raw.append(str(newsletter))

        newsletter_str = []
        for elt in newsletter_raw:
            msg = email.message_from_string(elt)
            # body = ""
            # for part in msg.walk():
            #     part = part.get_payload(decode=True)
            #     newsletter_str.append(part)
            newsletter_str.append(msg.get_payload())
        print(newsletter_str[0])


    except HttpError as error:
        # TODO(developer) - Handle errors from gmail API.
        print('An error occurred: {error}')

if __name__ == '__main__':
    main()
