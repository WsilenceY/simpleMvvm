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
            console.log('----get-----')
            return val
        },
        set(newValue) {
            console.log('-----set-----')
            val = newValue
        }
    })
}
class Svue {
    constructor(options) {
        this.$options = options
        this.$data = options.data
        observer(this.$data)
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
            // Element 编译元素
            if (node.nodeType === 1) {
                this.compileElement(node)
            }
        })
    }

    compileElement(node) {
        let nodeAttrs = node.attributes
        Array.from(nodeAttrs).forEach((attr) => {
            let attrName = attr.name
            let exp = attr.value
            if (this.isDirective(attrName)) {
                let dir = attrName.substring(2)
                this[dir] && this[dir](node, exp)
            }
        })
    }

    isDirective(attr) {
        return attr.indexOf('k-') === 0
    }
}

