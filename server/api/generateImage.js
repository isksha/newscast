const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');

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

module.exports = {
  convertTextToImage,
};
