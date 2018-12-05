### 解决问题:

大部分小程序为了优化用户体验,都采用了无感式的自动登录”wx.login”

用”wx.login”获得code,使用code请求业务服务器获得用户登录态(token),将token记录在本地.

以上逻辑在下文中简称为 login.

这样一来请求异步回调问题就会使业务开发带来一些小麻烦

### 前言:

登录态页面指的是Page初始化时(onLoad或onReady)调用了需要token的接口.

### 实战:

逻辑1:在”app.onLaunch”生命周期中实现login.

很快就暴露了问题,当程序第一页打开了登录态页面的时候,由于网络不稳定或其他因素造成login还没有完成,此时本地是没有token的,所以请求登录态接口

逻辑2:创建splash强制等待login完成后跳转相应页面.

采用splash页面会造成短暂的停顿,甚至login很快完成的时候页面会一闪而过.影响用户体验.

因为小程序分享功能的存在,会造成第一页的不确定性.如果分享的页面是登录态页面,那么以后的分享路径就得是splash路径并携带跳转的目标页面.只有等splash页登录完成了才能跳转相应的目标页.这种实现跟业务绑的太死.最终还是放弃了.

逻辑3:在”app.onLaunch”生命周期中实现login并把登录过程记录下来.

这个逻辑的意思是,如果进入的第一页是登录态页面的时候.获得之前记录下来的登录过程,判断一下.”登录中显示什么”,”登录失败显示什么”,”登录完成再初始化”.

这样一来就要把有可能成为第一页的登录态页面都复制相同的代码,做相同的处理,会变得非常琐碎,不利于后期维护迭代.

不过好像也只有这样才能真正解决这个问题,如果你有更好的方案还请分享一下咯…

为了优化逻辑3,我采用了组件(component)的形式去实现它.

简单来说,创建login组件在组件的”attached”周期中实现login,将”登录中显示什么”,”登录失败显示什么” 放进组件中.登录成功时triggerEvent(‘login’)通知登录态页面,登录态页面的初始化业务不放在 (onLoad 或 onReady)里,而是自定义的onLogin里.

login只需要做一次,为了避免重复login,在实现过程中将登录结果记录在对应的module中.

在login前判断了是否已经登录成功,如果登录成功,组件将直接触发onLogin事件

### 使用:

所有登录态页面引入login组件并绑定login事件

登录态页面.wxml
    
    <view>
    
        <!-- 界面 -->
    
        <login bindlogin="onLogin"/>
    
    </view>

登录态页面.js
    
    Page({
    
        onLogin:function(){
    
            //初始化业务
    
        }
    
    });

为了更好的用户体验,在app.onLaunch中主动调用一次login组件中的“loginIfNeed”方法.

app.js

    import loginIfNeed from './components/mpLogin/loginIfNeed';
    
    App({
    
        onLaunch:function (){
    
            loginIfNeed();
    
        },
    
    });


### 注意:
loginIfNeed.js中的Http工具类需要自行修改实现
