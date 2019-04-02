#!/usr/bin/env node
const fs = require('fs');
const program = require('commander');
const handlebars = require('handlebars');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');
const download = require('../lib/download');
const templates = require('../templates');
const { getRepo } = require('../utils');


/**
 * Usage.
 */
program
  .usage('create [project-name]')
  .version('1.0.0', '-v, --version')
  .command('create <name>')
  .action(async (name) => {
    if (!templates || templates.length === 0){
      console.log(chalk.yellow('当前无可用模板'));
      return;
    }

    if (!fs.existsSync(name)) {
      console.log(chalk.green('--------------------------------------------------------'));
      console.log(chalk.green('可选择的模板:'));
      for (let key in templates) {
        let temp = templates[key]
        console.log(`  ${chalk.green('★')}  ${chalk.green(temp.name)} - ${temp.desc}`);
      };
      console.log(chalk.green('--------------------------------------------------------'));
      
      // 选择模板
      const choices = templates.map((item) => {
        return item.name;
      });
      const template = await inquirer.prompt([
        {
          type: 'list',
          name: 'name',
          message: '请选择项目的模板',
          choices,
        },
      ]);
      const repo = getRepo(template.name, templates);
      if (!repo) {
        console.log(symbols.error, chalk.red('不存在有效仓库地址'));
        return;
      }

      const promptConfig = [
        {
          name: 'name',
          message: '项目名称',
          default: name,
        },
        {
          name: 'description',
          message: '项目描述',
        },
        {
          name: 'version',
          message: '项目版本',
          default: '1.0.0',
        },
        {
          type: 'confirm',
          name: 'hasFastclick',
          message: '是否使用 Fastclick',
          default: true,
        }
      ];
      const answers = await inquirer.prompt(promptConfig);
      const spinner = ora(`正在下载模板, 源地址：${repo}`);
      spinner.start();

      download(repo, name)
        .then(() => {
          spinner.succeed();
          const files = [
            `${name}/package.json`,
            `${name}/public/index.html`,
          ];
          const { version, description, author, hasFastclick} = answers;
          const meta = {
            name,
            version,
            description,
            author,
            hasFastclick,
          };
          files.forEach((file) => {
            if (fs.existsSync(file)) {
              const content = fs.readFileSync(file).toString();
              const result = handlebars.compile(content)(meta);
              fs.writeFileSync(file, result);
            }
          });
          console.log(symbols.success, chalk.green('项目初始化完成'));
          console.log(chalk.green(`    1. cd ${name} & npm install`));
          console.log(chalk.green(`    2. npm run serve`));
        })
        .catch((err) => {
          console.log('err =>>', err)
          spinner.fail();
          console.log(symbols.error, chalk.red('项目创建失败, 请检查地址是否正确 =>>', err));
        });
    } else {
      console.log(symbols.error, chalk.red('项目已存在'));
    }
  });



/**
 * Help.
 */
program.on('--help', () => {
  console.log();
  console.log('  Examples:');
  console.log();
  console.log(chalk.green('    # create a new project'));
  console.log('    $ bbfe create my-project');
  console.log();
});

function help () {
  if (process.argv.length < 4) {
    return program.help();
  }
}
help();

program.parse(process.argv);
