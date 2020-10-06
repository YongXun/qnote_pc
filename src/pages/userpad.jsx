import React from 'react'
import { Avatar , message , Modal , Statistic, Row , Col , Progress , Button , Input ,Spin , Upload} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import anime from 'animejs';
import axios from 'axios';
import '../css/userpad.scss';
import 'antd/dist/antd.css';

message.config({
    top:100,
    duration: 1,
    maxCount: 1,
    rtl: false,
    getContainer:() => document.querySelector('.App') || document.head
});

class UserPad extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            online:false,
            avatarUrl:'',
            signin_email:'',
            signin_password:'',
            signup_email:'',
            signup_username:'',
            signup_pwd:'',
            signup_cpwd:'',
            signup_valid:'',
            visible:false,
            wait:false,
            user:{
                id:'string',
                username:'string',
                email:'string',
                noteNum:0,
                completeNoteNum:0,
                currentNoteNum:0,
                giveUpNoteNum:0,
                avatarUrl:''
            },
            loading:false,
            upLoading:false,
            imageUrl:'',
        }
    }

    componentWillMount = async () => {
        let token = localStorage.getItem('token');
        if(token !== null){
            await axios.post(`https://qnote.qfstudio.net/api/authToken`,{
            token
            }).then(res=>{
                //有效token
                if(res.data.ok){
                    this.setState({
                        online:true
                    })
                    let user = JSON.parse(sessionStorage.getItem('user') || '[]');
                    let noteList = JSON.parse(sessionStorage.getItem('noteList') || '[]');
                    if(user.length === 0){
                        axios.get(`https://qnote.qfstudio.net/api/user/getMessage`,{
                            params:{
                                token:localStorage.getItem('token')
                            }
                        })
                        .then(res=>{
                            this.setState({
                                user:res.data.user
                            })
                            sessionStorage.setItem('user',JSON.stringify(res.data.user));
                            sessionStorage.setItem('noteList',JSON.stringify(res.data.note));
                            this.setState({
                                user:res.data.user,
                                noteList:res.data.noteList
                            })
                            // 查看是否有头像
                            if(res.data.user.avatarUrl){
                                this.setState({
                                    avatarUrl:`https://qnote.qfstudio.net${res.data.user.avatarUrl}`
                                })
                            }
                            console.log()
                            //隐藏登录框
                            this.hideShowIn();
                        })
                        .catch((err)=>{
                            console.log(err);
                        })
                    }
                    else{
                        console.log(user)
                        console.log(user.avatarUrl)
                        if(user.avatarUrl){
                            this.setState({
                                avatarUrl:`https://qnote.qfstudio.net${user.avatarUrl}`
                            })
                        }
                        this.setState({
                            user:user,
                            noteList:noteList
                        })
                    }
                }
                // 无效token,本地用户
                else{
                    localStorage.removeItem('token');
                    let user = JSON.parse(localStorage.getItem('user'));
                    if(user === null){
                        user = {
                            noteNum:0,
                            completeNoteNum:0,
                            currentNoteNum:0,
                            giveUpNoteNum:0
                        };
                        localStorage.setItem('user',JSON.stringify(user));
                    }
                    this.setState({
                        user:user
                    });
                }
            })
        }
        else{
            let user = JSON.parse(localStorage.getItem('user'));
            if(user === null){
                user = {
                    noteNum:0,
                    completeNoteNum:0,
                    currentNoteNum:0,
                    giveUpNoteNum:0
                };
                localStorage.setItem('user',JSON.stringify(user));
            }
            this.setState({
                user:user
            });
        }
    }

    // 显示登录框
    showSignIn = () => {
        anime({
            targets:'.signinpad',
            left:'0'
        })
    }

    //显示注册框
    showSignUp = () => {
        anime({
            targets:'.signuppad',
            right:'0'
        })
    }
    
    //隐藏登录框
    hideShowIn = () =>{
        anime({
            targets:'.signinpad',
            left:'-100%'
        })
    }

    //隐藏注册框
    hideShowUp = () =>{
        anime({
            targets:'.signuppad',
            right:'-100%'
        })
    }

    //是否退出
    showModal = () => {
        this.setState({
            visible:true
        })
    };

    //确定退出
    handleOk = (e) => {
        console.log(typeof e)
        this.signout();
        this.setState({
            visible:false
        })
        // setVisible(false);
    };

    //取消退出
    handleCancel = (e) => {
        this.setState({
            visible:false
        })
    };

    signinCheck(){
        let reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
        let email = this.state.signin_email;
        let pwd = this.state.signin_password;
        if(!reg.test(email)){
            message.info('请输入正确格式的邮箱！')
            return false
        }
        if(pwd.length<6 || pwd.length>10){
            message.info('密码长度不合法');
            return false
        }
        return true;
    }

    signin = async () => {
        if(!this.signinCheck()){return};
        let email= this.state.signin_email;
        let password= this.state.signin_password;
        await axios.post(`https://qnote.qfstudio.net/api/signin`,{
            email,
            password,
        })
        .then(res=>{
            localStorage.setItem('token',res.data.token);
            this.setState({
                online:true
            })
            message.success('登录成功');
        })
        .catch((err)=>{
            message.info('登录失败，请检查您的邮箱与密码');
            return
        })
        this.setState({
            signin_email:'',
            signin_password:''
        })
        axios.get(`https://qnote.qfstudio.net/api/user/getMessage`,{
            params:{
                token:localStorage.getItem('token')
            }
        })
        .then(res=>{
            this.setState({
                user:res.data.user
            })
            sessionStorage.setItem('user',JSON.stringify(res.data.user));
            sessionStorage.setItem('noteList',JSON.stringify(res.data.note));
            if(res.data.user.avatarUrl){
                this.setState({
                    avatarUrl:`https://qnote.qfstudio.net${res.data.user.avatarUrl}`
                })
            }
            //隐藏登录框
            this.hideShowIn();
        })
        .catch((err)=>{
            console.log(err);
        })
    }

    signupCheck(){
        let reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
        let pwd = this.state.signup_pwd;
        let cpwd = this.state.signup_cpwd;
        let valid = this.state.signup_valid;
        if(!reg.test(this.state.signup_email)){
            message.info('请输入正确格式的邮箱')
            return false
        }
        if(pwd.length < 6 || pwd.length > 10){
            message.info('密码长度需在6与10之间')
            return false
        }
        if(cpwd !== pwd){
            message.info('两次密码不一致')
            return false
        }
        if(!valid){
            message.info('请输入您的邮箱验证码')
            return false
        }
        return true;
    }

    // 注册
    signup = async () => {
        if(!this.signupCheck()){return;}
        await axios.post(`https://qnote.qfstudio.net/api/register`,{
            email:this.state.signup_email,
            username:this.state.signup_username,
            password:this.state.signup_pwd,
            verification:this.state.signup_valid
        })
        .then((res)=>{
            message.success('注册成功')
        })
        .catch(err=>{
            console.log(this.state.signup_email)
            console.log(this.state.signup_username)
            console.log(this.state.signup_pwd)
            console.log(this.state.signup_valid)
            message.info('注册失败，请检查您的信息是否正确');
        })
    }

    setWait = (wait) => {
        console.log('转换')
        this.setState({
            wait
        })
    }

    //发送邮件
    sendEmail = async () => {
        if(this.state.wait){
            message.info('请等待')
        }
        else{
            let reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
            if(reg.test(this.state.signup_email)){              
                axios.post('https://qnote.qfstudio.net/api/sendEmail',{
                    email:this.state.signup_email
                })
                .then(res=>{
                    if(res.data.valid){
                        message.success('发送成功！');
                        this.setWait(true);
                        anime({
                            targets:'.count',
                            innerHTML:[60,0],
                            easing:'linear',
                            round:1,
                            duration:60000
                        })
                        setTimeout(this.setWait.bind(this,false), 60000);
                    }
                    else{
                        message.info('发送失败！')
                    }
                })
            }
            else{
                message.info('请输入正确格式的邮箱！');
            }
        }
    }

    //退出登录
    signout = () => {
        localStorage.removeItem('token');
        this.setState({
            online:false
        })
    }

    //刷新数据
    async refresh(){
        this.setState({
            loading:true
        })
        anime({
            targets:'.refresh',
            rotate:[
                {value:'360deg',duration:10000,easing: 'linear'},
                {value:'0deg',},
            ]
        })
        switch(this.state.online){
            case true:
                axios.get(`https://qnote.qfstudio.net/api/user/getMessage`,{
                    params:{
                        token:localStorage.getItem('token')
                    }
                })
                .then(res=>{
                    this.setState({
                        user:res.data.user
                    })
                    sessionStorage.setItem('user',JSON.stringify(res.data.user));
                    sessionStorage.setItem('noteList',JSON.stringify(res.data.note));
                    message.success('刷新成功！');
                    this.setState({
                        loading:false
                    })
                    //隐藏登录框
                })
                .catch((err)=>{
                    console.log(err);
                })
                break;
            default:
                let user = JSON.parse(localStorage.getItem('user'));
                if(user === null){
                    user = {
                        noteNum:0,
                        completeNoteNum:0,
                        currentNoteNum:0,
                        giveUpNoteNum:0
                    };
                    localStorage.setItem('user',JSON.stringify(user));
                }
                message.success('刷新成功！');
                this.setState({
                    user:user,
                    loading:false
                })
                break;
        }
    }
    
    //显示上传头像按钮
    showUpLoad = () => {
        anime({
            targets:'.ant-avatar',
            zIndex:'-999'
        })
    }

    //隐藏上传头像按钮
    hideUpLoad = () => {
        anime({
            targets:'.ant-avatar',
            zIndex:'2'
        })
    }

    // 
    avatarChange = async (info)=> {
        if(!this.state.online){message.info('暂不支持离线用户上传头像！');return;}
        const token = localStorage.getItem('token');
        const fileReader = new FileReader();
        const avatar = document.querySelector('#avatar-loader').files[0];
        // console.log(avatar)
        if(avatar.type !== 'image/jpeg' && avatar.type !== 'image/png' && avatar.type !== 'image/jpg'){
            console.log(avatar.type)
            message.info('仅支持JPEG和PNG格式的图片！');
            return;
        }
        const isLt2M = avatar.size / 1024 / 1024 < 2;
        if (!isLt2M) {
          message.info('图片大小不可大于2MB！');
          return;
        }
        fileReader.readAsDataURL(avatar);
        // 头像修改
        fileReader.onload = function () {
            document.querySelector('#avatar').setAttribute('src',fileReader.result)
        };
        //头像上传
        const formData = new FormData();
        const xhr = new XMLHttpRequest();
        formData.append('avatar', avatar);
        xhr.open("POST",`https://qnote.qfstudio.net/api/user/avatar`);
        xhr.setRequestHeader('Token',token);
        xhr.onload = function () {
    　　　　if (xhr.status === 200) {
    　　　　　　message.success('上传成功')
    　　　　} else {
    　　　　　　message.info('上传失败，请检查您的网络')
    　　　　}
    　　};
    　　xhr.send(formData);
    }

    beforeUpload(file) {
        if(!this.state.online){message.info('暂不支持本地用户上传头像！');return;}
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
          message.error('You can only upload JPG/PNG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
          message.error('Image must smaller than 2MB!');
        }
        return isJpgOrPng && isLt2M;
    }


    render(){
        const uploadButton = (
            <div>
              {this.state.upLoading ? <LoadingOutlined /> : <PlusOutlined />}
              <div>修改头像</div>
            </div>
          );

        return(
            <div  className="userpad-wrapper">
                 <header>
                    <Button type="primary" className="signin-btn" onClick={this.state.online?this.showModal.bind(this):this.showSignIn.bind(this)}>{this.state.online?'退出':'登录'}</Button>
                    <Button type="primary" className="signup-btn" onClick={this.showSignUp.bind(this)}>注册</Button>
                </header>
                <main>
                    <Modal
                        title="QNote"
                        visible={this.state.visible}
                        onOk={this.handleOk.bind(this)}
                        onCancel={this.handleCancel.bind(this)}
                        width={300}
                        centered={true}
                        okText="退出"
                        cancelText="取消"
                    >
                        <p>是否退出登录?</p>
                    </Modal>
                    <div className="message-box">
                        <div className="avatar-area">
                            {/* 头像显示 */}
                            <img
                            src={this.state.online?(this.state.avatarUrl?this.state.avatarUrl:"https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"):"https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"} 
                            alt="" 
                            id="avatar" 
                            width="200" 
                            height="200"/>
                            {/* 上传头像按钮 */}
                            <div className="uploader">
                                <div>
                                    <Button type="primary"><label htmlFor="avatar-loader" className="upload-btn">上传头像</label></Button>
                                    <input name="avatar" type="file" id="avatar-loader" onChange={this.avatarChange.bind(this)}/>
                                </div>
                            </div>
                        </div>
                        <div className="username">
                            用户:{this.state.online?this.state.user.username:"游客"}
                        </div>
                    </div>
                    <div className="message">
                        <div className="refresh">
                            <i className="iconfont icon-shuaxin" title="刷新数据" onClick={this.refresh.bind(this)}></i>
                        </div>
                        <Spin spinning={this.state.loading}>
                            <Row gutter={48}>
                                <Col span={6}>
                                    <Statistic title="当前事务数" value={this.state.user.currentNoteNum} />
                                </Col>
                                <Col span={6}>
                                    <Statistic title="历史完成数" value={this.state.user.completeNoteNum} />
                                </Col>
                                <Col span={6}>
                                    <Statistic title="历史放弃数" value={this.state.user.giveUpNoteNum} />
                                </Col>
                                <Col span={6}>
                                    <Statistic title="历史事务数" value={this.state.user.noteNum} />
                                </Col>
                            </Row>
                        </Spin>      
                    </div>
                    <div className="signinpad">
                    <div className="signin">
                        <i className="iconfont icon-quxiao1 signin-cancel" onClick={this.hideShowIn.bind(this)}></i>
                        <form>
                            <div className="input-bar">
                                <div className="icon">
                                    <i className="iconfont icon-youxiang1"></i>
                                </div>
                                <input value={this.state.signin_email} type="text" placeholder="请输入您的邮箱" onChange={(e)=>{this.setState({signin_email:e.target.value})}}/>
                            </div>
                            <div className="input-bar">
                                <div className="icon">
                                    <i className="iconfont icon-mima"></i>
                                </div>
                                <input value={this.state.signin_password} type="password" placeholder="请输入您的密码"  onChange={(e)=>{this.setState({signin_password:e.target.value})}}/>
                            </div>
                        </form>
                        <div className="signin-submit">
                            <i className="iconfont icon-denglu" onClick={this.signin.bind(this)}></i>
                        </div>
                    </div>
                    
                </div>
                    <div className="signuppad">
                    <div className="signup">
                        <i className="iconfont icon-quxiao1 signup-cancel" onClick={this.hideShowUp.bind(this)}></i>
                        <form>
                            <div>
                                <div className="input-bar">
                                    <div className="icon">
                                        <i className="iconfont icon-youxiang1"></i>
                                    </div>
                                    <input type="text" placeholder="请输入您的邮箱" value={this.state.signup_email} onChange={(e)=>{this.setState({signup_email:e.target.value})}}/>
                                </div>
                                <button className="valid-btn"onClick={this.sendEmail.bind(this)}>
                                    {
                                        this.state.wait?<span>等候<span className="count"></span>s</span>:<span>获取验证码</span>
                                    }
                                </button>
                            </div>
                            <div className="input-bar">
                                <div className="icon">
                                    <i className="iconfont icon-yonghu"></i>
                                </div>
                                <input type="text" placeholder="请输入您的用户名" value={this.state.signup_username} onChange={(e)=>{this.setState({signup_username:e.target.value})}}/>
                            </div>
                            <div className="input-bar">
                                <div className="icon">
                                    <i className="iconfont icon-mima"></i>
                                </div>
                                <input type="password" placeholder="请输入您的密码"  value={this.state.signup_pwd} onChange={(e)=>{this.setState({signup_pwd:e.target.value})}}/>
                            </div>
                            <div className="input-bar">
                                <div className="icon">
                                    <i className="iconfont icon-mima"></i>
                                </div>
                                <input type="password" placeholder="请再次输入您的密码"  value={this.state.signup_cpwd} onChange={(e)=>{this.setState({signup_cpwd:e.target.value})}}/>
                            </div>
                            <div className="input-bar">
                                <div className="icon">
                                    <i className="iconfont icon-yanzhengma"></i>
                                </div>
                                <input type="text" placeholder="请输入您的验证码"  value={this.state.signup_valid} onChange={(e)=>{this.setState({signup_valid:e.target.value})}}/>
                            </div>
                        </form>
                        <div className="signup-submit">
                            <i className="iconfont icon-denglu" onClick={this.signup.bind(this)}></i>
                        </div>
                        </div>
                    </div>  
                </main>
                <footer></footer>
            </div>
        )
    }
}

export default  UserPad;