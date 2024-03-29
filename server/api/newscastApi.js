const { exec } = require('child_process');
const { WordTokenizer, TfIdf } = require('natural');
const { Configuration, OpenAIApi } = require('openai');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const constants = require('../constants/newscastConstants');

const generateTranscript = async () => new Promise((resolve, reject) => {
  const cmd = 'cd api &&\ python3 generate_transcript.py';
  exec(
    cmd.replace(/\n/g, '\\\n'),
    (error, stdout, stderr) => {
      console.log('1/7 Generated transcript successfully');
      resolve(stdout);
    },
  );
});

async function generateTags(text) {
  const tokenizer = new WordTokenizer();
  const words = tokenizer.tokenize(text);

  const tfidf = new TfIdf();
  tfidf.addDocument(words.join(' '));

  const numKeywords = 30;
  const keywords = tfidf.listTerms(0)
    .slice(0, numKeywords)
    .map((term) => term.term);

  const filteredKeywords = keywords.filter((item) => constants.TAGS_SET.has(item));
  console.log('2/7 Generated tags successfully');
  return (filteredKeywords.length == 0) ? ['uncategorized'] : filteredKeywords;
}

async function convertTagsToImage(tags) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const prompt = `Create an abstract art for the following list of tags: "${tags}". Under no circumstances should the image contain any text. WHATEVER YOU DO DO NOT INCLUDE ANY TEXT IN THE IMAGE.`;

  const image_url = await openai.createImage({
    prompt,
    n: 1,
    size: '1024x1024',
  });

  console.log('3/7 Converted tags to image successfully');
  return image_url.data.data[0].url;
}

async function generateTtsMp3(text) {
  const tts = new TextToSpeechClient();
  const ttsRequest = {
    input: { text },
    voice: { languageCode: 'en-US', ssmlGender: 'FEMALE' },
    audioConfig: { audioEncoding: 'MP3' },
  };

  const [ttsResponse] = await tts.synthesizeSpeech(ttsRequest);
  console.log('4/7 Generated mp3 successfully');
  return ttsResponse.audioContent;
}

module.exports = {
  generateTranscript,
  convertTagsToImage,
  generateTags,
  generateTtsMp3,
};
