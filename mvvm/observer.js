//观察者
class Observer{
    constructor(cb){
        if(typeof cb === 'function'){
            this.cb=cb;
        }else {
            throw new Error ('Observer 构造器必须传入函数类型！')
        }
    }
    update(){
        this.cb()
    }
}
//目标对象
class Subject{
    constructor(){
        //维护观察者列表
        this.observerList = []
    }
    /**
     * 添加一个观察者
     * @param {*} observer  observer实例
     */
    addObserver(observer){
        this.observerList.push(observer)
    }
    /**
     * 通知所有的观察者
     */
    notify(){
        this.observerList.forEach(observer=>{
            observer.update()
        })
    }
}
const observerCallback = function() {
    console.log('我被通知了')
}
const observer = new Observer(observerCallback)

const subject = new Subject();
subject.addObserver(observer);
subject.notify();