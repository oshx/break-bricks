import rimraf from 'rimraf'

rimraf('./dist', () => {
  console.log('[./dist] has been removed.')
})
