from __future__ import print_function
from datetime import date
from bs4 import BeautifulSoup

import os.path
import base64
import unicodedata

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

        print(len(newsletter_ids))
        for elt in newsletter_ids:
            newsletter_full = service.users().messages().get(userId='me', id=elt['id'], format='full').execute()
            data = newsletter_full['payload']['parts'][1]['body']['data']
            decoded_data = base64.urlsafe_b64decode(data)
            html_body = (bytes(decoded_data)).decode('utf-8', errors='ignore')
            normalized_html_body = unicodedata.normalize('NFKD', html_body)
            soup = BeautifulSoup(normalized_html_body, "html.parser")
            print(soup.get_text())

    except HttpError as error:
        # TODO(developer) - Handle errors from gmail API.
        print('An error occurred: {error}')

if __name__ == '__main__':
    main()
