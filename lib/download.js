/**
 * git download
 */
const download = require('download-git-repo');

module.exports = function (repo, target) {
  return new Promise((resolve, reject) => {
    download(`direct:${repo}`, target, { clone: true }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(target);
      }
    });
  });
};
