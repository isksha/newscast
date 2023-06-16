const { exec } = require('child_process');
const { WordTokenizer, TfIdf } = require('natural');
const { Configuration, OpenAIApi } = require('openai');
const constants = require('../constants/newscastConstants');

const generateTranscript = async () => new Promise((resolve, reject) => {
  const cmd = 'cd api &&\ python3 generate_transcript.py';
  exec(
    cmd.replace(/\n/g, '\\\n'),
    (error, stdout, stderr) => {
      resolve(stdout);
    },
  );
});

async function convertTextToImage(text) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const prompt = `Create a cover art for the following summary of newsletters: ${text}`;

  const image_url = await openai.createImage({
    prompt,
    n: 1,
    size: '1024x1024',
  });

  return image_url.data.data[0].url;
}

async function generateTags(text) {
  const tokenizer = new WordTokenizer();
  const words = tokenizer.tokenize(text);

  const tfidf = new TfIdf();
  tfidf.addDocument(words.join(' '));

  const numKeywords = 30;
  const keywords = tfidf.listTerms(0)
    .slice(0, numKeywords)
    .map((term) => term.term);

  return keywords.filter((item) => constants.TAGS_SET.has(item));
}

module.exports = {
  generateTranscript,
  convertTextToImage,
  generateTags,
};
