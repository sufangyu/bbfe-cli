/**
 * 获取仓库地址
 *
 * @export
 * @param {*} name
 * @param {*} list
 */
function getRepo(name, list) {
  const repository = list.find((item) => {
    return item.name === name;
  });
  return repository.path;
};

module.exports = {
  getRepo,
};