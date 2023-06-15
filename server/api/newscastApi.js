const { exec } = require('child_process');
const rake = require('node-rake');
const { Configuration, OpenAIApi } = require('openai');

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
  console.log(rake.generate(text));
  return rake.generate(text);
}

module.exports = {
  generateTranscript,
  convertTextToImage,
  generateTags,
};
