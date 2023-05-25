const { exec } = require('child_process');

const getTranscript = async (userId, date) => new Promise((resolve, reject) => {
  const cmd = 'cd api &&\ python3 generate_transcript.py';
  exec(
    cmd.replace(/\n/g, '\\\n'),
    (error, stdout, stderr) => {
      resolve(stdout);
    },
  );
});

module.exports = {
  getTranscript,
};
