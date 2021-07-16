function observe(data) {
  if (typeof data !== 'object') return
  for (let key of Object.keys(data)) {
    defineReactive(data, key)
  }
  return data
}


function defineReactive(data, key) {
  let val = data[key]
  const dep = new Dep()
  Object.defineProperty(data, key, {
    configurable: false,
    enumerable: true,
    get() {
      dep.depend()
      return val
    },
    set(newVal) {
      if (val === newVal) return
      val = newVal
      observe(val)
      dep.notify()
    }
  })
  observe(val)
}


class Dep {
  constructor() {
    this.watchers = new Set()
  }
  addSub(watcher) {
    this.watchers.add(watcher)
  }
  depend() {
    if (Dep.Target) {
      Dep.Target.addDep(this)
    }
  }
  notify() {
    let watchers = this.watchers
    for (let watcher of watchers) {
      watcher.update()
    }
  }
}

Dep.Target = null
const watcherStack = []

// 入栈
function pushTarget(watcher) {
  Dep.Target = watcher
  watcherStack.push(watcher)
}

// 出栈
function popTarget() {
  watcherStack.pop()
  Dep.Target = watcherStack[watcherStack.length - 1]
}


class Watcher {
  constructor(
    getter,
    options,
    cb
  ) {
    this.getter = getter
    this.cb = cb
    this.deps = new Set()

    this.value = undefined

    this.lazy = undefined
    this.dirty = undefined
    this.user = undefined

    if (options) {
      this.lazy = !!options.lazy
      this.user = !!options.user
    }

    this.dirty = this.lazy
    this.value = this.lazy
      ? undefined
      : this.get()
  }
  get() {
    pushTarget(this)
    let value = this.getter()
    popTarget()
    return value
  }
  addDep(dep) {
    dep.addSub(this)
    this.deps.add(dep)
  }
  depend() {
    let deps = this.deps
    for (let dep of deps) {
      dep.depend()
    }
    
  }
  evalute() {
    this.value = this.get()
    this.dirty = false
  }
  update() {
    if (this.lazy) {
      this.dirty = true
    } else {
      Promise.resolve().then(() => {
        this.run()
      })
    }
  }
  run() {
    let newValue = this.get()
    if (this.user && newValue !== this.value) {
      this.cb(newValue, this.value)
      this.value = newValue
    }
  }
}

function computed(computedGetter) {
  const options = { lazy: true }
  const computedWathcer = new Watcher(computedGetter, options)
  const result = {}
  Object.defineProperty(result, 'value', {
    get() {
      if (computedWathcer.dirty) {
        computedWathcer.evalute()
      }
      if (Dep.Target) {
        computedWathcer.depend()
      }
      return computedWathcer.value
    }
  })
  return result
}

function watch(watcheGetter, callback) {
  const options = { user: true }
  new Watcher(watcheGetter, options, callback)
}