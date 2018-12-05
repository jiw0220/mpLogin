import loginIfNeed from './loginIfNeed';

Component({
    data: {
        mpLoginStatus: -1,
        mpLoginFailMsg: ''
    },
    options: {
        addGlobalClass: true,//这个特性从小程序基础库版本 2.2.3 开始支持。
    },
    lifetimes: {
        attached: function () {// 在组件实例进入页面节点树时执行
            this.login();
        },
        detached: function () {  // 在组件实例被从页面节点树移除时执行

        },
    },
    methods: {
        login: function () {
            const {mpLoginStatus, mpLoginPromise} = loginIfNeed();
            this.setData({mpLoginStatus});
            if (mpLoginStatus === 0) {
                this.triggerEvent('login');
            } else if (mpLoginStatus === 1) {
                mpLoginPromise.then((resp) => {
                    if (resp._result === 0) {
                        this.triggerEvent('login');
                        this.setData({mpLoginStatus: 0, mpLoginFailMsg: ''});
                    } else {
                        this.setData({mpLoginStatus: 2, mpLoginFailMsg: resp._desc});
                    }
                });
            }
        },
    }
});