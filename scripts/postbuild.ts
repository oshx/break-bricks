import SimpleGIT from 'simple-git'
import rimraf from 'rimraf'

const SSH_GIT_URL = process.env.npm_package_config_ssh
const REMOTE = process.env.npm_package_config_remote
const BRANCH = process.env.npm_package_config_branch

const info = (logName: string) => (...args: any[]) =>
  console.debug('git', logName, args?.[0] === null ? 'succeed.' : args)

rimraf('./dist/.git', (): void => {
  console.debug('[./dist/.git] has been removed.')
  SimpleGIT('./dist')
    .init(false, info('[init]'))
    .checkoutLocalBranch(BRANCH, info('[checkout]'))
    .addRemote(REMOTE, SSH_GIT_URL, info('[addRemote]'))
    .fetch(REMOTE, BRANCH, info('[fetch]'))
    .raw(['reset', '--mixed', `${REMOTE}/${BRANCH}`], info('[raw]'))
    .add('*', info('[add]'))
    .commit(`[AUTO-BUILD] ${new Date()}`, info('[commit]'))
    .push(REMOTE, BRANCH, info('[push]'))
})
