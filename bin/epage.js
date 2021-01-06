#!/usr/bin/env node
const program = require('commander')
const chalk = require('chalk')
const REPOS = require('./repos')
const ora = require('ora')
const shell = require('shelljs')
const download = require('download-git-repo')
const fs = require('fs')
const path = require('path')
const pkg = require('../package.json')

program
  .command('init [project name]')
  .description('init epage widget project')
  .option('--tpl <tpl>', 'select template', 'iview')
  .action((name, cmdObj) => {
    const { tpl } = cmdObj
    const tplName = (tpl && tpl in REPOS) ? tpl : 'iview'

    const _name = name || REPOS[tplName].name
    const targetPath = path.resolve(process.cwd(), _name)
    const spinner = ora('Downloading template...').start()
    shell.mkdir('-p', targetPath)
    console.log('\ntemplate repos:', REPOS[tplName].git)

    download(REPOS[tplName].git, targetPath, { clone: true }, function (err) {

      if (err) {
        spinner.fail('clone error!\n')
        console.error(err)
        return err
      }

      shell.cd(targetPath)
      shell.rm('-rf', `${targetPath}/.git`)
      shell.rm('-rf', `${targetPath}/CHANGELOG.md`)
      spinner.succeed('The template has been downloaded!')
      const files = [
        path.resolve(targetPath, 'package.json'),
        path.resolve(targetPath, './build/webpack.build.js'),
        path.resolve(targetPath, './build/webpack.style.js'),
      ]
      files.forEach(f => {
        replaceTpl(targetPath, f)
      })

      shell.cd('-')
      console.log(chalk.green(`\n    cd ${_name}`))
      console.log(chalk.green('    npm install'))
      console.log(chalk.green('    npm start\n'))

      // Promise.all(allFiles).then(function(files) {
      //   spinner.start('npm install ...\n')
      //   shell.exec('npm install')
      //   spinner.succeed(chalk.green('created!'))
      //   shell.cd('-')
      // }).catch(function (err) {
      //   throw err
      // })
    })

  })
  

program.version(pkg.version)
  .option('-v --version', 'epage cli version')
  .description('init epage widget project')
  .parse(process.argv)

function replaceTpl (projPath, filePath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, 'utf8', function (err, data = '') {
      if (err) reject(err)
      if (!data) reject(data)

      const name = getName(projPath)
      const result = data
        .replace(/\$\$\{project_name\}/g, name)
        .replace(/\$\$\{project_name_camel\}/g, bigCamel(name))

      fs.writeFile(filePath, result, function (err) {
        if (err) reject(err)
        resolve(filePath)
      })
    })
  })
}

function getName (projPath) {
  const names = projPath.trim().split(/[\\\/]/)
  return names[names.length - 1]
    .replace(/[\-\s\._]+/g, '-')
    .replace(/[A-Z]/g, function(s){
      return '-' + s.toLowerCase();
    })
    .replace(/^\-*|\-*$/g, '')
    .replace(/\-+/g, '-')
}

function bigCamel (name) {
  return name
    .split(/[\s\-\_]+/g)
    .map(w => {
      const first = w[0]
      const other = w.slice(1)
      return first.toUpperCase() + other;
    })
    .join('')
}