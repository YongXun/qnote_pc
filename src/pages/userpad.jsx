import React from 'react'
import { Avatar , message , Modal , Statistic, Row , Col , Progress} from 'antd';
import { UserOutlined } from '@ant-design/icons';
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
            avatarURL:'',
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
                giveUpNoteNum:0
            }
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
                    console.log(user === null)
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
                            //隐藏登录框
                            this.hideShowIn();
                        })
                        .catch((err)=>{
                            console.log(err);
                        })
                    }
                    else{
                        this.setState({
                            user:user,
                            noteList:noteList
                        })
                    }
                }
                // 无效token
                else{
                    localStorage.removeItem('token');
                    return;
                }
            })
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
            message.info('登录失败，请检查您的邮箱与密码')
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


    render(){
        return(
            <div  className="userpad-wrapper">
                 <header>
                    <button className="signin-btn" onClick={this.state.online?this.showModal.bind(this):this.showSignIn.bind(this)}>{this.state.online?'退出':'登录'}</button>
                    <button className="signup-btn" onClick={this.showSignUp.bind(this)}>注册</button>
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
                            {/* 头像组件 */}
                            <Avatar 
                            size={128}
                            src={this.state.avatarURL?this.state.avatarURL:''}
                            icon={<UserOutlined/>}
                            />
                            <div className={this.state.online?'.hide':'signin'}>
                                {/* 上传/更换头像 */}
                            </div>
                        </div>
                        <div>
                            用户:{this.state.online?this.state.user.username:"游客"}
                        </div>
                    </div>
                    <div className={this.state.online?'showpad':'hidden'}>
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
                    </div>
                    <div className="signinpad">
                    <div className="signin">
                        <i className="iconfont icon-quxiao1 signin-cancel" onClick={this.hideShowIn.bind(this)}></i>
                        <form>
                            <div className="input-bar">
                                <div className="icon">
                                    <i className="iconfont icon-youxiang"></i>
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
                                        <i className="iconfont icon-youxiang"></i>
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