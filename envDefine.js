const pkg = require('./package.json');

const getEnvDefine = (envName) => {
  const envDefine = {
    'process.env.NODE_ENV': envName === 'development' ? 'development' : 'production'
  };
  if (typeof pkg._env_[envName] === 'object') {
    Object.entries(pkg._env_[envName]).forEach(([key, value]) => {
      envDefine[`process.env.${key}`] = value;
    });
  }
  return envDefine;
};

module.exports = getEnvDefine;
