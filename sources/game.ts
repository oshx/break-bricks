import '~/game.scss'
;((scripts) => {
  Array.prototype.slice
    .call(scripts)
    .forEach((script) => document.body.removeChild(script))
})(document.getElementsByName('script'))

const COLOR = '#ccc'
const POINT = '#fc0'
const FONT = '16px arial, sans-serif'
const ALIGN_CENTER = 'center'
const ALIGN_START = 'start'
const MAX_SPEED = 5

const canvas = ((c) => {
  document.body.appendChild(c)
  c.width = 480
  c.height = 320
  return c as HTMLCanvasElement
})(document.createElement('canvas'))
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

let stage = 1
let penalty = 1
let ballRadius = 10
let x = canvas.width / 2
let y = canvas.height - ballRadius * 3
let dx = 2
let dy = -2
let paddleHeight = 10
let paddleWidth = 75
let paddleX = (canvas.width - paddleWidth) / 2
let rightPressed = false
let leftPressed = false
let brickRowCount = 3
let brickColumnCount = 1
let brickWidth!: number
let brickHeight = 20
let brickPadding = 10
let brickOffsetTop = 30
let brickOffsetLeft = 30
let score = 0
let lives = 3
let pause: boolean | string = true
let end: boolean | string = false

interface StageInfo {
  brickRowCount: number
  brickColumnCount: number
}

interface Stages {
  [key: number]: StageInfo
}

const stages: Stages = {
  1: {
    brickRowCount: 3,
    brickColumnCount: 1,
  },
  2: {
    brickRowCount: 3,
    brickColumnCount: 2,
  },
  3: {
    brickRowCount: 4,
    brickColumnCount: 2,
  },
  4: {
    brickRowCount: 4,
    brickColumnCount: 3,
  },
  5: {
    brickRowCount: 5,
    brickColumnCount: 3,
  },
}

canvas.width

const STATUS_ON = 10

let bricks!: { x: number; y: number; status: number }[][]

function setup() {
  brickWidth =
    (canvas.width - 2 * brickOffsetLeft) / brickRowCount - brickPadding
  bricks = new Array(brickColumnCount).fill(null).map((_, c) =>
    new Array(brickRowCount).fill(null).map((_, r) => ({
      x: r * (brickWidth + brickPadding) + brickOffsetLeft,
      y: c * (brickHeight + brickPadding) + brickOffsetTop,
      status: STATUS_ON,
    })),
  )
}

function keyDownHandler(e: KeyboardEvent): void {
  if (e.keyCode === 39) {
    rightPressed = true
  } else if (e.keyCode === 37) {
    leftPressed = true
  }
}
function keyUpHandler(e: KeyboardEvent): void {
  if (e.keyCode === 39) {
    rightPressed = false
  } else if (e.keyCode === 37) {
    leftPressed = false
  } else if (e.keyCode === 13) {
    togglePauseHandler()
  }
}
function mouseMoveHandler(e: MouseEvent): void {
  let relativeX = e.clientX - canvas.offsetLeft
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2
  }
}
function togglePauseHandler(): void {
  if (end) return document.location.reload()
  pause = !pause
  draw()
}

document.addEventListener('keydown', keyDownHandler, false)
document.addEventListener('keyup', keyUpHandler, false)
document.addEventListener('mousemove', mouseMoveHandler, false)
document.addEventListener('click', togglePauseHandler, false)

function calculateState(): void {
  pause = `[${stage}판]을 깼습니다!`

  stage++
  lives++
  score += lives * stage * ballRadius

  if (!stages.hasOwnProperty(stage)) {
    end = `축하합니다! 다 깼습니다! [${score}점 (●${lives})]`
    return draw()
  }

  const current = stages[stage]
  brickRowCount = current.brickRowCount
  brickColumnCount = current.brickColumnCount
  setup()
  birth()
  draw()
}

function collisionDetection(): void {
  return bricks.forEach((r) =>
    r.forEach((b) => {
      if (
        b.status !== STATUS_ON ||
        !(x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight)
      ) {
        return
      }
      dy = -dy
      --b.status
      score += ballRadius * stage
      if (bricks.some((r) => r.some((b) => b.status === STATUS_ON))) {
        return
      }
      calculateState()
    }),
  )
}

function drawBall(): void {
  ctx.beginPath()
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2)
  ctx.fillStyle = COLOR
  ctx.fill()
  ctx.closePath()
}
function drawPaddle(): void {
  ctx.beginPath()
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight)
  ctx.fillStyle = COLOR
  ctx.fill()
  ctx.closePath()
}
function drawBricks(): void {
  return bricks.forEach((r) =>
    r.forEach((b) => {
      if (b.status === 0) return
      ctx.beginPath()
      ctx.rect(b.x, b.y, brickWidth, brickHeight)
      if (b.status === STATUS_ON) {
        ctx.fillStyle = COLOR
        ctx.fill()
      } else {
        ctx.strokeStyle = POINT
        ctx.stroke()
        b.status--
      }
      ctx.closePath()
    }),
  )
}
function drawSystemInfo(): void {
  ctx.font = FONT
  ctx.fillStyle = COLOR
  ctx.textAlign = ALIGN_START
  ctx.fillText(
    `[${stage}판] ${score.toLocaleString('en')} / ●${lives}`,
    ballRadius,
    20,
  )
}

function drawMessage(): void {
  if (end || pause) {
    const message =
      typeof end === 'string'
        ? end
        : typeof pause === 'string'
        ? pause
        : '클릭하거나 엔터키를 누르세요.'
    ctx.font = FONT
    ctx.fillStyle = POINT
    ctx.textAlign = ALIGN_CENTER
    ctx.fillText(message, canvas.width / 2, (canvas.height / 3) * 2)
  }
}

function birth(): void {
  x = canvas.width / 2
  y = canvas.height - 30

  const s = Math.min(stage + penalty, MAX_SPEED)
  dx = s
  dy = -s
  paddleX = (canvas.width - paddleWidth) / 2
  pause = typeof pause === 'string' ? pause : true
}

function calculation(): void {
  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx
  }
  if (y + dy < ballRadius) {
    dy = -dy
  } else if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy
    } else {
      lives--
      if (!lives) {
        pause = '실패!'
        return draw()
      } else {
        birth()
      }
    }
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7
  }

  x += dx
  y += dy
}

function drawEnd(): void {
  pause = false
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawMessage()
}

function draw(): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawBricks()
  drawBall()
  drawPaddle()
  drawSystemInfo()
  drawMessage()
  collisionDetection()
  if (end || !stages.hasOwnProperty(stage)) {
    return drawEnd()
  }
  if (pause) return
  if (!lives) {
    end = '구슬이 없습니다.'
  }
  calculation()
  requestAnimationFrame(draw)
}

setup()
birth()
draw()
