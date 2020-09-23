/*
该脚本提供以下能力
1.根据自动生成原有 router.config.json 的备份文件
2.根据optimize/keepRoutes.js配置的path字段的值，自动留存对应path的内容，并替换原来的router.config.json

需要考虑的情况：
1.多次执行该文件，如果有备份文件则不会再复制
2.备份文件有、无两种情况
3.提供参数，可以根据参数决定是否强制覆盖备份router
4.备份路由永远都是最新的，因此只需要在本地保留一份即可
5.如果出现问题，只需要将router.config.json文件通过vscode撤回更新即可
6.出现意外情况可以手动解决

使用方式
0.第一次需要首先执行一遍 node dev-optimize.js
1.在 optimize/keepRoutes.js 修改想要保留的路由
2.然后执行 node dev-optimize.js
3.最后 node dev-optimize.js -recover (node dev-optimize.js -r) 即可恢复原来的路由
*/
const OPTIMIZE_DIR_NAME = 'optimize'// 和gitignore对应
const cliArg = process.argv[2]
const isConvert = !!((cliArg === '-recover' || cliArg === '-r'))

const fs = require('fs')
const path = require('path')

const keepedRoutesPath = path.join(__dirname, OPTIMIZE_DIR_NAME, 'keepRoutes.js')
const realRouterPath = path.resolve(__dirname, 'src/router.config.json')
const backupRouterPath = path.resolve(__dirname, `${OPTIMIZE_DIR_NAME}/router.config.json`)
const appCMLPath = path.resolve(__dirname, 'src/app/app.cml')
const backupAppCMLPath = path.resolve(__dirname, `${OPTIMIZE_DIR_NAME}/app.cml`)

// 为了减少冲突，先修改成在 optimize/keepRoutes.js 中修改要保留哪些路由
const DEFAULT_ROUTE_PATH = 'module.exports = [\'/pages/index/index\']'

initKeepedRoutes()
const keepedRoutes = require(`./${OPTIMIZE_DIR_NAME}/keepRoutes.js`)
main()

/*
从 optimize 中的 router.config.json 中筛选出要构建的路由
*/
function main (routes) {
  if (isConvert) {
    revertFile(backupRouterPath, realRouterPath)
    revertFile(backupAppCMLPath, appCMLPath)
    return
  }
  copyFile(backupRouterPath, realRouterPath)
  copyFile(backupAppCMLPath, appCMLPath)
  let routerConfig = {}
  const backupRouterContent = getFileContent(backupRouterPath)
  if (backupRouterContent) {
    routerConfig = JSON.parse(backupRouterContent)
  };
  routerConfig.routes = (routerConfig.routes || []).filter((route) => {
    return keepedRoutes.includes(route.path)
  })
  fs.writeFileSync(realRouterPath, JSON.stringify(routerConfig, '', 2))
  deleteSubpageConfig()
}

// 下面声明全局变量-函数
function getFileContent (filePath) {
  if (isFile(filePath)) {
    const content = fs.readFileSync(filePath, { encoding: 'utf-8' })
    return content
  }
  return ''
}
function revertFile (copyedRoutePath, originPath) {
  if (isFile(copyedRoutePath)) {
    const realRouterContent = getFileContent(copyedRoutePath)
    if (isFile(originPath)) {
      fs.writeFileSync(originPath, realRouterContent)
    }
  }
}
function deleteSubpageConfig () {
  const appCMLContent = getFileContent(appCMLPath)
  const scriptJsonContentReg = /(<script[\s]*cml-type=["']json["'][\s]*>)([\s\S]*)(<[\s]*\/script[\s]*>)/
  const matchResult = appCMLContent.match(scriptJsonContentReg)
  let scriptJson = {}
  if (matchResult) {
    scriptJson = JSON.parse(matchResult[2])
  }
  const usedPlatforms = ['wx', 'alipay']
  const deleteKeys = ['preloadRule', 'subPackages']
  usedPlatforms.forEach((key) => {
    if (scriptJson[key]) {
      deleteKeys.forEach((deleteKey) => {
        delete scriptJson[key][deleteKey]
      })
    }
  })

  const newScriptJsonContent = `${matchResult[1]}\n${JSON.stringify(scriptJson, '', 2)}\n${matchResult[3]}`
  const newAppCMLContent = appCMLContent.replace(matchResult[0], newScriptJsonContent)
  fs.writeFileSync(appCMLPath, newAppCMLContent)
  debugger
}
function initKeepedRoutes () {
  const optimizeDir = path.resolve(__dirname, OPTIMIZE_DIR_NAME)
  if (!isDir(optimizeDir)) {
    fs.mkdir(OPTIMIZE_DIR_NAME)
  } else {
    if (!isFile(keepedRoutesPath)) {
      fs.writeFileSync(keepedRoutesPath, DEFAULT_ROUTE_PATH)
    }
  }
}
function copyFile (destPath, originPath) {
  const copedContent = getFileContent(originPath)
  const optimizeDir = path.resolve(__dirname, OPTIMIZE_DIR_NAME)
  if (!isDir(optimizeDir)) {
    fs.mkdir(OPTIMIZE_DIR_NAME)
  }
  if (!isFile(destPath)) {
    fs.writeFileSync(destPath, copedContent)
  }
}

function isDir (filePath) {
  return fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()
}
function isFile (filePath) {
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile()
}
