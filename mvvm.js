
class Observer {//实现数据劫持
    constructor(data) {
        this.observer(data);
    }
    defineReactive(obj, key, value) {
        this.observer(value);
        Object.defineProperty(obj, key, {
            get() {
                return value
            },
            set:(newValue)=>{
                if (newValue !== value) {
                    this.observer(newValue);
                    value = newValue;
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
            if (this.isDirective(name)) {
                console.log(node, "element")
                let [, directive] = name.split("-");
                // 需要调用不同的指令来处理
                CompileUtils[directive](node, expr, this.vm)
            }
        })
    }
    //编译文本
    compileText(node) { //判断当前文本中是否包含大括号 {{aaa}}
        let content = node.textContent;
        if (/\{\{(.+?)\}\}/.test(content)) {
            console.log(content, "text")
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
        //创建一个文档碎片
        let fragment = document.createDocumentFragment();
        let firstChild;
        while (firstChild = node.firstChild) {
            fragment.appendChild(firstChild);
        }
        return fragment;
    }
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
    model(node, expr, vm) { //node是节点  expr是表达式 vm是当前实例
        let fn = this.updater['modelUpdater'];
        let value = this.getValue(vm, expr);
        fn(node, value)
    },
    html() {

    },
    text(node, expr, vm) {//expr -> {{a}} {{b}}
        let fn = this.updater['textUpdater']
        let content = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
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
        }
    }
}

//基础类
class Vue {
    constructor(options) {
        this.$el = options.el;
        this.$data = options.data;
        //判断根元素存在，编译模板
        if (this.$el) {
            //把数据全部转化为用Object.defineProperty来定义
            new Observer(this.$data);
            new Compliler(this.$el, this)
        }
    }
}