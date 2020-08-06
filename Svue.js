// 构造函数
// 1. 响应式   observer  watcher---> 每个元素对应一个
// 2. 模板引擎  compile
// 3. 渲染
function observer(obj) {
    if (typeof obj !== 'object' && obj !== null) {
        return
    }
    Object.keys(obj).forEach((key) => {
        defineReactive(obj, key, obj[key])
    })
}


function defineReactive(obj, key, val) {
    // 递归处理
    observer(val)
    Object.defineProperty(obj, key, {
        get() {
            return val
        },
        set(newValue) {
            val = newValue

            // 通知更新
            watchers.forEach((w)=>{
                w.update()
            })
        }
    })
}
// 将$data中的key代理到KVue实例上
function proxy(vm) {
  Object.keys(vm.$data).forEach(key => {
    Object.defineProperty(vm, key, {
      get() {
        return vm.$data[key]
      },
      set(v) {
        vm.$data[key] = v
      }
    })
  })
}
class Svue {
    constructor(options) {
        this.$options = options
        this.$data = options.data
        proxy(this)
        observer(this.$data)
        new Compiler('#app', this)
    }
}

// Compiler: 解析模板，找到依赖，并和前面拦截的属性关联起来
// new Compiler('#app', vm)
class Compiler {
    constructor(el, vm) {
        this.$vm = vm
        this.$el = document.querySelector(el)
        this.compile(this.$el)
    }

    // 解析模板
    compile(el) {
        el.childNodes.forEach(node => {
            // Element 编译元素'
            if (node.nodeType === 1) {
                this.compileElement(node)
            }else if(this.isInter(node)){
                // 解析文本
                this.compileText(node)
            }
        })
    }

    compileElement(node) {
        // 遍历节点的属性
        let nodeAttrs = node.attributes
        Array.from(nodeAttrs).forEach((attr) => {
            let attrName = attr.name
            let exp = attr.value
            // 判断这个属性的类型
            if (this.isDirective(attrName)) {
                // 如果是指令 v-xxx 截取指令名称
                let dir = attrName.substring(2)
                // 如果指令存在 执行它
                this[dir] && this[dir](node, exp)
            }
        })
    }
    // 文本指令
    text(node, exp){
        node.textContent = this.$vm[exp]
    }
    // 是否为插值表达式{{}}
    isInter(node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
      }

    compileText(node){
        this.update(node, RegExp.$1, 'text')
    }

  isDirective(attr) {
     return attr.indexOf('v-') === 0
  }

  /* 
    所有动态绑定都需要创建更新函数以及对应watcher实例
    node： 节点
    exp： 节点对应动态表达式的值
    dir： 对应的指令
  */
  update(node, exp, dir) {
    // 初始化
    const fn = this[dir+ 'Updater']
    fn && fn(node, this.$vm[exp])
    //更新
    new Watcher(this.$vm, exp, 
        function(val){
            fn && fn(node, val)
        })
  }
  // Updater
  textUpdater(node, value){
    console.log('------textUpdater-----', value)
    node.textContent = value // this.$vm[RegExp.$1]
  }
}

// watcher 小秘书 每一个绑定对应一个
const watchers = []
class Watcher{
    constructor(vm, key, updateFn){
        this.vm = vm;
        this.key = key;
        this.updateFn = updateFn;
        watchers.push(this)
    }

    // update 方法
    update(){
        console.log('---ddd-dd---', this.key)
        // 传入最新值给更新函数
        this.updateFn.call(this.vm,this.vm[this.key])
    }
}


