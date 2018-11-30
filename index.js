const fs = require('fs')
const path = require('path')
const findSkeletonRoot = require('organic-stem-skeleton-find-root')
const {forEachSeries} = require('p-iteration')

module.exports = function (angel) {
  require('angelabilities-exec')(angel)
  angel.on('vps :vpsName setup', async function (angel) {
    const monorepo_root = await findSkeletonRoot()
    const loadRootDNA = require(path.join(monorepo_root, '/cells/node_modules/lib/load-root-dna'))
    let rootDNA = await loadRootDNA()
    let vpsName = angel.cmdData.vpsName
    if (!rootDNA.vps[vpsName]) throw new Error(vpsName + ' not found in `dna.vps` branch')
    let vpsIP = rootDNA.vps[vpsName].ip
    console.log('setup ' + vpsIP)
    let setupFilePath = `./dna/vps/${vpsName}/setup.sh`
    await angel.exec(`scp ${setupFilePath} root@${vpsIP}:/home/root/setup.sh`)
    let setupCmds = `ssh root@${vpsIP} '${[
      '/bin/bash /home/root/setup.sh',
      `echo "${await pubsshkey_contents()}" >> /home/node/.ssh/authorized_keys`
    ].join(' && ')}'`
    console.info(setupCmds)
    await angel.exec(setupCmds)
    await doPromise(angel, `vps ${vpsName} setup root cells`)
    console.info(`${vpsName} vps setup done.`)
  })
  angel.on('vps :vpsName setup root cells', async (angel) => {
    await doPromise(angel, `vps ${angel.cmdData.vpsName} setup root cell any`)
    console.info('all root cells setups complete.')
  })
  angel.on('vps :vpsName setup root cell :rootServiceName', async (angel) => {
    const monorepo_root = await findSkeletonRoot()
    const loadRootDNA = require(path.join(monorepo_root, '/cells/node_modules/lib/load-root-dna'))
    let rootDNA = await loadRootDNA()
    let vps = rootDNA.vps[angel.cmdData.vpsName]
    await forEachSeries(vps.rootCells, async (rootCell) => {
      if (rootCell.serviceName !== angel.cmdData.rootServiceName && angel.cmdData.rootServiceName !== 'any') return
      if (rootCell.templatePath) {
        console.info(`root cell mitosis ${rootCell.source} ${rootCell.templatePath}...`)
        await angel.exec(`npx ${rootCell.source} ${vps.ip} ${rootCell.templatePath}`)
      } else {
        console.info(`root cell mitosis ${rootCell.source}...`)
        await angel.exec(`npx ${rootCell.source} ${vps.ip}`)
      }
      console.info('setup complete.')
    })
  })
  angel.on(/vps (.*) -- (.*)/, async (angel) => {
    const monorepo_root = await findSkeletonRoot()
    const loadRootDNA = require(path.join(monorepo_root, '/cells/node_modules/lib/load-root-dna'))
    let rootDNA = await loadRootDNA()
    let vpsIP = rootDNA.vps[angel.cmdData[1]].ip
    let statusCmd = `ssh root@${vpsIP} '${angel.cmdData[2]}'`
    console.info(statusCmd)
    await angel.exec(statusCmd)
  })
}

const pubsshkey_contents = function () {
  return new Promise((resolve, reject) => {
    fs.readFile(`/home/${process.env.USER}/.ssh/id_rsa.pub`, (err, contents) => {
      if (err) return reject(err)
      resolve(contents.toString())
    })
  })
}
const doPromise = function (angel, cmdInput) {
  return new Promise((resolve, reject) => {
    angel.do(cmdInput, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}
