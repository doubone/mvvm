class EventEmitter {
    constructor() {
        //维护事件及监听者
        this.listener = {};
    }
    /**
     * 注册时间监听者
     * @param {*} type 时间类型 
     * @param {*} cb 回调函数
     */
    on(type, cb) {
        if (!this.listener[type]) this.listener[type] = [];
        this.listener[type].push(cb)
    }
    /**
     * 发布事件
     * @param {*} type 事件类型
     * @param  {...any} args 参数列表，把emit传递的参数赋给回调函数 
     */
    emit(type,...args){
        if(this.listener[type])
        this.listener[type].forEach(cb=> cb(...args))
    }
    /**
     *  移除一个事件的监听者
     * @param {*} type 事件类型 
     * @param {*} cb 回调函数
     */
    off(type,cb){
        if(this.listener[type]){
            let targetIndex = this.listener[type].findIndex(item=>item===cb)
            if(targetIndex>-1){
                this.listener[type].splice(targetIndex,1)
            }
            if(this.listener[type].length === 0){
                delete this.listener[type]
            }
        }
    }
    /**
     * 移除某个事件的所有监听者
     * @param {*} type  事件类型 
     */
    offAll(type){
        if(this.listener[type])
        delete this.listener[type]
    }
}
let e = new EventEmitter();
e.on('test',(first,second)=>{console.log("我在测试"+first+second)});
e.emit('test',1,2)

