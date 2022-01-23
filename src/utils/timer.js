import uuid from 'uuid-v4'

const _noop = () => {}
const _render = output => {
  console.log(output)
}
const _fill = num => {
  const n = Number.parseInt(num, 10)
  return n < 10 ? '0' + n : n
}
const _format = ms => {
  const second = ms / 1000
  const minute = second / 60
  const hour = minute / 60
  return {
    d: _fill(hour / 24),
    h: _fill(hour % 24),
    m: _fill(minute % 60),
    s: _fill(second % 60)
  }
}

const _defaultOptions = {
  name: uuid(), // ID
  interval: 1000, // 間隔時間
  onFinish: _noop, // 倒計時完成回調
  task: _noop, // 間隔任務
  format: '{d}:{h}:{m}:{s}',
  render: _render,
  count: 0, // 倒計時時間
  endTime: new Date().valueOf() + 10 * 1000 // 結束時間
}

/**
 * 时间a与时间b比较
 * @param {Date} a 时间a
 * @param {Date} b 时间b
 * @return -1 前 0 相等 1 后
 */
export const compareTime = (a, b) => {
  const pad = new Date(a).valueOf() - new Date(b).valueOf()
  if (pad < 0) {
    return -1
  } else if (pad > 0) {
    return 1
  } else {
    return 0
  }
}

export default class Timer {
  constructor(options = {}) {
    const opts = Object.assign({}, _defaultOptions, options)
    this.name = opts.name
    this.interval = opts.interval
    this.onFinish = opts.onFinish
    this.task = opts.task
    this.format = opts.format
    this.render = opts.render
    if (opts.count) {
      this.endTime = new Date().valueOf() + opts.count
    } else {
      this.endTime = new Date(opts.endTime).valueOf()
    }

    this.timer = null
    this.now = new Date().valueOf()
  }
  intervalFn = (fn, wait) => {
    const now = Date.now
    let start = now()
    let end = start
    const loop = () => {
      // TODO 由于 requestAnimationFrame 会在浏览器 tab 切换会停止运行，因此改成 setTimeout
      this.timer = window.requestAnimationFrame(loop)
      // this.timer = window.setTimeout(loop, wait)
      end = now()
      if (end - start >= wait) {
        start = now()
        fn()
      }
    }
    this.timer = window.requestAnimationFrame(loop)
    // this.timer = window.setTimeout(loop, wait)
  }
  start = () => {
    const begin = () => {
      this.endTime = this.endTime - 1000
      const remain = (this.endTime - this.now) / 1000
      // 每秒进行输出
      this.render(this.getOutput())
      // 时间间隔执行
      if (this.endTime % this.interval === 0) {
        this.task()
      }
      // 结束
      if (remain <= 0) {
        this.onFinish()
        this.stop()
      }
    }
    // begin() 为新增的，为了能够立即执行倒计时
    begin()
    this.intervalFn(begin, 1000)
  }
  getBetween = () => _format(this.endTime - this.now)
  getOutput = () => {
    const between = this.getBetween()
    return this.format.replace(/{(\w*)}/g, (m, key) => {
      return between.hasOwnProperty(key) ? between[key] : ''
    })
  }
  stop = () => {
    if (this.timer) {
      window.cancelAnimationFrame(this.timer)
      // window.clearTimeout(this.timer)
    }
  }
}
