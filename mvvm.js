
// function Vue(opt={}){
//     console.log(opt)
// }
class Compliler{
    constructor(el,vm){
        //判断el是不是元素，如果不是元素就获取他
        this.el = this.isElementNode(el)?el:document.querySelector(el);
        console.log(this.el)
        let fragment = this.node2fragment(this.el);
    }
    node2fragment(node){
        //创建一个文档碎片
        let fragment = document.createDocumentFragment();
        let firstChild;
        while(firstChild = node.firstChild){
            console.log(firstChild)
            fragment.appendChild(firstChild);
        }
        return fragment;
    }
    isElementNode(node){//是不是元素节点
       return  node.nodeType === 1 ;
    }
}

//基础类
class Vue{
    constructor(options){
        this.$el = options.el;
        this.$data = options.data;
        //判断根元素存在，编译模板
        if(this.$el){
            new Compliler(this.$el,this)
        }
    }
}