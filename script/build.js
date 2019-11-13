const webpack = require('webpack');
const merge = require('webpack-merge');

const cmd = require('../common/cmd');
const { createShare, checkArgs, getModeInfo } = require('../common/utils.js');
const baseConfigFactory = require('../webpack/base-config-factory');
const buildConfigFactory = require('../webpack/build-config-factory');
const config = require('../config/config')();

const mode = 'production';
process.env.NODE_ENV = mode;

cmd
  .option('--analyzer <toggle>', '是否分析包大小')
  .option('--gzip <toggle>', '是否开启gzip')
  .option('--drop-console <toggle>', '是否在打包时移除console')
  .parse(process.argv);

const [entry, tpl] = checkArgs(cmd.args);

startBuild().then();

async function startBuild() {
  const share = {
    entry,
    template: tpl,
    gzip: cmd.gzip,
    analyzer: cmd.analyzer,
    dropConsole: cmd.dropConsole,
    ...createShare(mode),
  };

  const webpackConfig = merge(baseConfigFactory(mode, share), buildConfigFactory(mode, share));

    webpack(config.configWebpack(webpackConfig, getModeInfo(mode)), (err, stats) => {
      if (err) {
        console.error(err.stack || err);
        if (err.details) {
          console.error(err.details);
        }
        return;
      }

      const info = stats.toJson();

      if (stats.hasErrors()) {
        console.error(info.errors.toLocaleString());
        return;
      }

      // if (stats.hasWarnings()) {
      //   console.warn(3, info.warnings);
      // }

      console.log(stats.toString({
        assets: true,
        chunks: false,
        errorDetails: false,
        modules: false,
        entrypoints: false,
        children: false,
        colors: true,
      }));
    });
}
