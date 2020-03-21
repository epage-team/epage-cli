#!/usr/bin/env node
const program = require('commander')
const chalk = require('chalk')
const repos = require('./repos')
const ora = require('ora')
const shell = require('shelljs')
const download = require('download-git-repo')

program
  .command('init [project name]')
  .description('init epage widget project')
  .action((name) => {

    const _name = name || repos.iview.name
    const targetPath = process.cwd() + '/' + _name
    const spinner = ora('Downloading template...').start()

    download(repos.iview.git, targetPath, function (err) {

      // clone template
      // shell.exec(`git clone ${repos.iview.git} ${targetPath}`)
      shell.cd(targetPath)
      shell.rm('-rf', `${targetPath}/.git`)
      shell.rm('-rf', `${targetPath}/CHANGELOG.md`)
      spinner.succeed('Template Has Been Downloaded!')
  
      // npm intall
      spinner.start('npm install ...')
      // shell.exec('npm install')
      spinner.succeed(chalk.green('created!'))
      shell.cd('-')
    })

  })
  
program.parse(process.argv)
