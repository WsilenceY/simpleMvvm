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
    obj.defineProperty(obj, key, {
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