const vCosole = require('vconsole-webpack-plugin')

const argv = require('yargs')
  .describe('debug', 'debug环境') // use 'webpack --debug'
  .argv

export default (config, { webpack }) => {
  config.plugins.push(new vCosole({ enable: !!argv.debug}))
  return config
}
