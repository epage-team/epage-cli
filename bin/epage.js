#!/usr/bin/env node
const program = require('commander')
const chalk = require('chalk')
const repos = require('./repos')
const ora = require('ora')
const shell = require('shelljs')
const download = require('download-git-repo')
const fs = require('fs')
const path = require('path')

program
  .command('init [project name]')
  .description('init epage widget project')
  .action((name) => {

    const _name = name || repos.iview.name
    const targetPath = path.resolve(process.cwd(), _name)
    const spinner = ora('Downloading template...').start()

    download(repos.iview.git, targetPath, function (err) {

      // clone template
      // shell.exec(`git clone ${repos.iview.git} ${targetPath}`)
      shell.cd(targetPath)
      shell.rm('-rf', `${targetPath}/.git`)
      shell.rm('-rf', `${targetPath}/CHANGELOG.md`)
      spinner.succeed('Template Has Been Downloaded!')
      const files = [
        path.resolve(targetPath, 'package.json'),
        path.resolve(targetPath, './build/webpack.build.js'),
      ]
      files.forEach(f => {
        replaceTpl(f)
      })
  
      // npm intall
      spinner.start('npm install ...')
      // shell.exec('npm install')
      spinner.succeed(chalk.green('created!'))
      shell.cd('-')
    })

  })
  
program.parse(process.argv)


function replaceTpl (filePath, callback) {
  fs.readFile(filePath, 'utf8', function (err, data) {
    if (err) throw err

    const name = getName(filePath)
    const result = data
      .replace(/\$\{\{project_name\}\}/g, name)
      .replace(/\$\{\{project_name_camel\}\}/g, bigCamel(name))

    fs.writeFile(filePath, result, function (err) {
      if (err) throw err
      if (typeof callback === 'function') {
        callback()
      }
    })
  })
}

function getName (projPath) {
  const names = projPath.split('/')
  return names[names.length - 1]
}

function bigCamel (name) {
  name
  .split(/[\s\-\_]+/g)
  .map(w => {
    const first = w[0]
    const other = w.slice(1)
    return first.toUpperCase() + other;
  })
  .join('')
}