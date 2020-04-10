
//观察者  （发布订阅） 观察者 被观察者
class Dep {
    constructor() {
        this.subs = [];//存放所有的watcher
    }
    //订阅
    addSub(watcher) {//添加watcher
        this.subs.push(watcher);

    }
    //发布
    notify() {
        this.subs.forEach(watcher => watcher.update());
    }
}
class Watcher {
    constructor(vm, expr, cb) {
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;
        //先存放一个老值
        this.oldValue = this.get();
    }
    get() {
        Dep.target = this;//先把自己放在this上
        //取值 把这个观察者 和数据关联起来
        let value = CompileUtils.getValue(this.vm, this.expr);
        Dep.target = null;//不取消 任何值 取值都会添加watcher
        return value;
    }
    update() {//更新操作  数据变化时 会调用观察者的update 方法
        let newValue = CompileUtils.getValue(this.vm, this.expr);
        if (newValue !== this.oldValue) {
            this.cb(newValue)
        }

    }

}
class Observer {//实现数据劫持
    constructor(data) {
        this.observer(data);
    }
    defineReactive(obj, key, value) {
        this.observer(value);
        let dep = new Dep();//给每一个属性 都加上一个发布订阅功能
        Object.defineProperty(obj, key, {
            get() {
                //创建watcher时，会 取到响应的内容，并把watcher放在了全局上
                Dep.target && dep.subs.push(Dep.target);
                return value
            },
            set: (newValue) => {
                if (newValue !== value) {
                    this.observer(newValue);
                    value = newValue;
                    dep.notify();
                }
            }
        })
    }
    observer(data) {
        //如果是对象才观察
        if (data && typeof data == 'object') {
            //如果是对象
            for (let key in data) {
                this.defineReactive(data, key, data[key]);
            }
        }
    }
}
class Compliler {
    constructor(el, vm) {
        //判断el是不是元素，如果不是元素就获取他
        this.el = this.isElementNode(el) ? el : document.querySelector(el);

        this.vm = vm;
        let fragment = this.node2fragment(this.el);
        //把节点内容替换
        //编译模板 用数据编译
        this.compile(fragment);
        //把内容填充进页面
        this.el.appendChild(fragment)
    }
    isDirective(attrName) {
        return attrName.startsWith("v-")
    }
    //编译元素
    compileElement(node) {
        const attributes = node.attributes; //类数组
        [...attributes].forEach(attr => {
            let { name, value: expr } = attr; //v-model="school.name"
            if (this.isDirective(name)) { //v-model v-html v-bind
                let [, directive] = name.split("-");//v-on:click
                let [directiveName, eventName] = directive.split(":");
                // 需要调用不同的指令来处理
                CompileUtils[directiveName](node, expr, this.vm, eventName);
            }
        })
    }
    //编译文本
    compileText(node) { //判断当前文本中是否包含大括号 {{aaa}}
        let content = node.textContent;
        if (/\{\{(.+?)\}\}/.test(content)) {
            CompileUtils['text'](node, content, this.vm);
        }
    }
    compile(node) {//用来编译内存中的dom节点
        let childNodes = node.childNodes;
        [...childNodes].forEach(child => {
            if (this.isElementNode(child)) {
                this.compileElement(child)
                //如果是元素，需要把自己传进去 去遍历子节点
                this.compile(child)
            } else {
                this.compileText(child)
            }
        })
    }
    //把节点移动到内存中
    node2fragment(node) {
        debugger;
        //创建一个文档碎片
        let fragment = document.createDocumentFragment();
        let firstChild;
        while (firstChild = node.firstChild) {
            fragment.appendChild(firstChild);
        }
        return fragment;
    }
    // 如果节点是元素节点，nodeType属性返回1
    //如果节点是属性节点，nodeType属性返回2
    isElementNode(node) {//是不是元素节点
        return node.nodeType === 1;
    }
}

CompileUtils = {
    //根据表达式取到对应的数据
    getValue(vm, expr) { //vm.$data school.name
        return expr.split(".").reduce((data, current) => {
            return data[current]
        }, vm.$data)

    },
    setValue(vm, expr, value) {
        expr.split(".").reduce((data, current, index, arr) => {
            if (arr.length - 1 == index) {
                return data[current] = value
            }
            return data[current]
        }, vm.$data)

    },
    //解析v-model这个指令
    model(node, expr, vm) { //node是节点  expr是表达式 vm是当前实例
        let fn = this.updater['modelUpdater'];
        new Watcher(vm, expr, (newValue) => {//给输入框加一个观察者，如果稍后数据更新了会出发此方法，会拿新值，给输入框赋予值
            fn(node, newValue)
        })
        node.addEventListener('input', (e) => {
            let value = e.target.value;//获取用户输入的内容
            this.setValue(vm, expr, value);
        })
        let value = this.getValue(vm, expr);
        fn(node, value)
    },
    html(node, expr, vm) {//v-html="message"

        let fn = this.updater['htmlUpdater'];
        new Watcher(vm, expr, (newValue) => {//给输入框加一个观察者，如果稍后数据更新了会出发此方法，会拿新值，给输入框赋予值
            fn(node, newValue)
        })
        let value = this.getValue(vm, expr);
        fn(node, value)
    },

    getContentValue(vm, expr) {
        //遍历表达式 将内容替换成一个完整的内容  返还回去
        return expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
            return this.getValue(vm, args[1])
        })
    },
    on(node, expr, vm, eventName) { //v-on:click="change" expr 
        node.addEventListener(eventName, (e) => {
            vm[expr].call(vm, e);//this.change
        })
    },
    text(node, expr, vm) {//expr -> {{a}} {{b}}=>a b
        let fn = this.updater['textUpdater']
        let content = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
            //给表达式每{{}}都加上观察者    
            new Watcher(vm, args[1], () => {
                fn(node, this.getContentValue(vm, expr));//返回一个全的字符串
            })
            return this.getValue(vm, args[1])
        })
        fn(node, content)
    },
    updater: {
        //把数据插入到节点中
        modelUpdater(node, value) {
            node.value = value;
        },
        //处理文本节点
        textUpdater(node, value) {
            node.textContent = value;
        },
        htmlUpdater(node, value) {//xss攻击
            node.innerHTML = value;
        }
    }
}

//基础类
class Vue {
    constructor(options) {
        this.$el = options.el;
        this.$data = options.data;
        let computed = options.computed;
        let methods = options.methods;
        //判断根元素存在，编译模板
        if (this.$el) {
            //把数据全部转化为用Object.defineProperty来定义
            new Observer(this.$data);
            //把数据获取操作 vm上的取值操作 都代理到vm.$data
            for (let key in computed) {//有依赖关系 数据
                Object.defineProperty(this.$data, key, {
                    get: () => {
                        return computed[key].call(this)
                    }
                })
            }
            for (let key in methods) {
                Object.defineProperty(this, key, {
                    get() {
                        return methods[key]
                    }
                })
            }
            this.proxyVm(this.$data);
            new Compliler(this.$el, this)
        }
    }
    proxyVm(data) {
        for (let key in data) {
            Object.defineProperty(this, key, {//实现了可以通过vm取到对应的内容
                get() {
                    return data[key];//进行了转化操作
                },
                set(newValue) {//设置代理方法
                    data[key] = newValue
                }
            })
        }
    }
}