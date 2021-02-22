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
    if (!name) {
      console.log(chalk.red(`\n[project name] is required!!!`))
      return
    }
    let { tpl } = cmdObj
    const tplPath = getTPLPath(tpl)
    if (!tplPath) return

    const targetPath = path.resolve(process.cwd(), name)
    const spinner = ora('Downloading template...').start()
    shell.mkdir('-p', targetPath)
    console.log('\ntemplate repos:', tplPath.path)

    const downloadURL = tplPath.fullpath ? `direct:${tplPath.path}` : tplPath.path
    download(downloadURL, targetPath, { clone: true }, function (err) {

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
      console.log(chalk.green(`\n    cd ${name}`))
      console.log(chalk.green('    npm install'))
      console.log(chalk.green('    npm start\n'))

    })
  })
  

program.version(pkg.version)
  .option('-v --version', 'epage cli version')
  .description('init epage widget project')
  .parse(process.argv)

function getTPLPath (tpl) {
  let result = null
  if (!tpl) {
    result = {
      fullpath: false,
      path: REPOS.iview.git // default tpl
    }
  } else if (tpl in REPOS) {
    result = {
      fullpath: false,
      path: REPOS[tpl].git
    }
  } else if (/^git@.{3,}/.test(tpl)) {
    result = {
      fullpath: true,
      path: tpl
    }
  } else {
    console.log(chalk.red(`\ntpl is not available!!!`))
    return 
  }
  return result
}

function replaceTpl (projPath, filePath) {
  return new Promise(function (resolve, reject) {
    if (!fs.existsSync(filePath)) return
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