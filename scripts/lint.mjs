import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

const require = createRequire(import.meta.url)
const fix = process.argv.includes('--fix')
const failures = []

function run(label, command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) failures.push(label)
}

function getChangedFiles() {
  const tracked = spawnSync('git', ['diff', '--name-only', '--diff-filter=ACMR'], { encoding: 'utf8' })
  const untracked = spawnSync('git', ['ls-files', '--others', '--exclude-standard'], { encoding: 'utf8' })
  if (tracked.status !== 0 || untracked.status !== 0) throw new Error('Could not list changed files for lint --fix')
  return [...new Set(`${tracked.stdout}${untracked.stdout}`.split(/\r?\n/).filter(Boolean))]
}

const formatTargets = fix ? getChangedFiles() : ['.']
const lintTargets = fix ? formatTargets.filter((file) => /\.(?:[cm]?[jt]sx?)$/i.test(file)) : ['.']

if (formatTargets.length) {
  run('Prettier', process.execPath, [
    require.resolve('prettier/bin/prettier.cjs'),
    ...formatTargets,
    fix ? '--write' : '--check',
    '--cache',
    '--cache-strategy',
    'metadata'
  ])
}
run('TypeScript', process.execPath, [require.resolve('typescript/bin/tsc'), '--incremental'])
run('ESLint plugin compilation', process.execPath, [
  'fe-zen-arch/scripts/compile-typescript.js',
  'fe-zen-arch/scripts/eslint-plugins/const-to-function.ts'
])
if (lintTargets.length) {
  run('ESLint', process.execPath, [
    resolve('node_modules/eslint/bin/eslint.js'),
    ...lintTargets,
    ...(fix ? ['--fix'] : []),
    '--cache',
    '--cache-location',
    './node_modules/.tmp/.eslintcache'
  ])
}

if (failures.length) {
  console.error(`Lint checks failed: ${failures.join(', ')}`)
  process.exit(1)
}
