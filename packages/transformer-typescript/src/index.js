/* @flow */

import { createTransformer, shouldProcess, MessageIssue } from 'pundle-api'
import type { File } from 'pundle-api/types'

// TODO: Implement watching and everything
export default createTransformer(async function(config: Object, file: File) {
  if (!shouldProcess(this.config.rootDirectory, file.filePath, config)) {
    return null
  }

  let typescriptPath
  try {
    typescriptPath = await this.resolve('typescript')
  } catch (_) {
    throw new MessageIssue('Unable to find babel-core in project root', 'error')
  }

  // NOTE: Docs at
  // https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
  // $FlowIgnore: Flow doesn't like dynamic requires
  const typescript = require(typescriptPath) // eslint-disable-line global-require
  const processed = typescript.transpileModule(
    file.contents,
    Object.assign({}, config.config)
  )
  const contents = processed.outputText
  const sourceMap = JSON.parse(processed.sourceMapText)

  return { contents, sourceMap }
}, {
  config: {},
  include: [],
  exclude: [/(node_modules|bower_components)/],
})