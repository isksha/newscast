const { exec } = require('child_process');

const extractTodaysTranscript = async (userId, date) => new Promise((resolve, reject) => {
  const cmd = 'cd api &&\ python3 test_script.py';
  exec(
    cmd.replace(/\n/g, '\\\n'),
    (error, stdout, stderr) => {
      resolve(stdout);
    },
  );
});

module.exports = {
  extractTodaysTranscript,
};
