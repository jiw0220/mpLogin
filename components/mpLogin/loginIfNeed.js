import Http from "../../utils/http";//需要自行修改

let mpLoginStatus = -1; // 0 登录成功 1 正在登录 2 登录失败
let mpLoginPromise = null;

function handlerLoginFail(resolve, msg) {
    mpLoginStatus = 2;
    resolve({_result: 1, _desc: msg, mpLoginStatus: 2});
}

function handlerLoginSuccess(resolve, res) {
    if (!res.code) {
        handlerLoginFail(resolve, res.errMsg || 'res.code is empty');
        return;
    }
    //与业务服务器换取token并且保存下来,需要自行修改
    Http.get({url: '/api/user/mpLogin', data: {code: res.code}}).then((resp) => {
        if (resp._result === 0) {
            Http.setToken(resp.token);
            mpLoginStatus = 0;
            resolve({_result: 0, _desc: 'success', mpLoginStatus: 0});
        } else {
            handlerLoginFail(resolve, resp._desc);
        }
    });
}

export default function () {
    switch (mpLoginStatus) {
        case 0:
            return {mpLoginStatus};
        case 1:
            return {mpLoginStatus, mpLoginPromise};
        default:
            mpLoginStatus = 1;
            mpLoginPromise = new Promise((resolve) => {
                wx.login({
                    success: (res) => handlerLoginSuccess(resolve, res),
                    fail: (err) => handlerLoginFail(resolve, err.errMsg)
                });
            });
            return {mpLoginStatus, mpLoginPromise};
    }
}