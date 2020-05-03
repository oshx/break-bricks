import rimraf from 'rimraf'
// @ts-ignore
import simpleGit from 'simple-git'

const SSH_GIT_URL = process.env.npm_package_config_ssh as string
const REMOTE = process.env.npm_package_config_remote as string
const BRANCH = process.env.npm_package_config_branch as string

const info = (logName: string) => (...args: any[]) =>
  console.debug('git', logName, args?.[0] === null ? 'succeed.' : args)

rimraf('./dist/.git', (): void => {
  console.debug('[./dist/.git] has been removed.')
  ;(simpleGit('./dist')
    .init(false, info('[init]'))
    .checkoutLocalBranch(BRANCH, info('[checkout]'))
    .addRemote(REMOTE, SSH_GIT_URL, info('[addRemote]'))
    .fetch(REMOTE, BRANCH, info('[fetch]')) as any)
    .raw(['reset', '--mixed', `${REMOTE}/${BRANCH}`], info('[raw]'))
    .add('*', info('[add]'))
    .commit(`[AUTO-BUILD] ${new Date()}`, info('[commit]'))
    .push(REMOTE, BRANCH, info('[push]'))
})
