class Compiler {
    constructor(el, vm) {
        this.el = this.isElementNode(el)?el:document.querySelector(el);
        let fragment = this.node2Fragment(this.el);
        this.compile(fragment);
        this.vm =vm;
    }
    compileElement(node){
        // console.log(node)
    }
    compileText(node){
        let content = node.textContent;
        if(/\{\{(.+?)\}\}/.test(content)){
            CompileUtils['text'](node,content,this.vm)
        }
    }
    compile(node){
        let childs = node.childNodes;
        [...childs].forEach(child=>{
                if(this.isElementNode(child)){
                    this.compileElement(child)
                }else{
                    this.compileText(child)
                }
        })
    }
    node2Fragment(node){
            let fragment = document.createDocumentFragment();
            let firstChild;
            while(firstChild=node.firstChild){
                fragment.appendChild(firstChild)
            }
            return fragment;
    }
    isElementNode(node) {
        return node.nodeType === 1;
    }
}
 CompileUtils ={
     getValue(vm,expr){
         expr.replace(/\{\{(.+?)\}\}/g,(...args)=>{

         })
     },
    text(node,expr,vm){  //
            
    }
}
//基类
class Vue {
    constructor(options) {
        this.$data = options.data;
        this.$el = options.el;
        if (this.$el && typeof this.$data == 'object' && Object.getOwnPropertyNames(this.$data).length > 0) {
            new Compiler(this.$el,this);
        }
    }

}