import React from 'react';
import axios from 'axios';
import { message } from 'antd';
import '../css/notepad.scss'

message.config({
    top:100,
    duration: 1,
    maxCount: 1,
    rtl: false,
    getContainer:() => document.querySelector('.App') || document.head
  });

export default class NotePad extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            online:false,
            noteList:[],
            info:'',
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

    componentWillMount(){
        let token = localStorage.getItem('token');
        if(!token){
            console.log('事务列表-离线状态');
            let noteList = JSON.parse(localStorage.getItem('noteList') || '[]');
            this.setState({
                online:false,
                noteList:noteList
            });
        }
        else{
            console.log('事务列表-登录状态');
            let noteList = JSON.parse(sessionStorage.getItem('noteList') || '[]');
            let user = JSON.parse(sessionStorage.getItem('user') || '[]');
            this.setState({
                online:true,
                noteList:noteList,
                user:user
            });
        }
    }

    handleChange = (e) => {
        let len = e.target.value.length;
        if(len < 20){
            this.setState({
                info:e.target.value
            });
        }
        else{
            message.info('注意言简意赅哦！');
        }   
    }

    handleClick = async (e) => {
        let info = this.state.info;
        if(!info){
            message.info('请输入便签内容！');
        }
        else{
            if(this.state.online){
                console.log('在线用户完成任务');
                let token = localStorage.getItem('token');
                //修改数据库数据，获取noteID
                let noteID = await axios.post(`https://qnote.qfstudio.net/api/note/addTask`,{
                    token:token,
                    noteContent:info,
                    noteRemark:''
                }).then(res=>{
                    return res.data.noteID
                })
                console.log(noteID);
                //修改本地数据
                let noteList = JSON.parse(sessionStorage.getItem('noteList') || '[]');
                noteList.push({
                    noteID:noteID,
                    noteContent:info,
                    noteRemark:'',
                    done:false
                });
                this.setState({
                    noteList:noteList,
                    info:''
                })
                sessionStorage.setItem('noteList',JSON.stringify(noteList));
            }
            else{
                console.log('本地用户添加任务')
                let noteList = JSON.parse(localStorage.getItem('noteList') || '[]');
                noteList.push({
                    noteID:noteList.length,
                    noteContent:this.state.info,
                    noteRemark:'',
                    done:false
                });
                // 修改用户数据
                let user = JSON.parse(localStorage.getItem('user'));
                user.currentNoteNum++;
                user.noteNum++;
                localStorage.setItem('user',JSON.stringify(user))
                this.setState({
                    noteList:noteList,
                    info:'',
                    user:user
                })
                localStorage.setItem('noteList',JSON.stringify(noteList));
            }
        }
    }

    gNote = (ID) => {
        switch(this.state.online){
            case true:
                console.log('在线用户放弃事务')
                let token = localStorage.getItem('token');
                // 修改本地缓存
                let noteList = this.state.noteList;
                noteList.forEach((note,index)=>{
                    if(note.noteID === ID){
                        noteList.splice(index,1);
                    }
                })
                this.setState({
                    noteList
                })
                sessionStorage.setItem('noteList',JSON.stringify(noteList));
                //发送网络请求
                axios.post(`https://qnote.qfstudio.net/api/note/giveUpTask`,{
                    noteID:ID,
                    token:token,
                    username:this.state.user.username
                })
                break;
            default:
                console.log('本地用户放弃事务')
                let noteList2 = this.state.noteList;
                noteList2.forEach((note,index)=>{
                    if(note.noteID === ID){
                        noteList2.splice(index,1);
                    }
                })
                // 修改用户数据
                let user = JSON.parse(localStorage.getItem('user'));
                user.giveUpNoteNum++;
                user.currentNoteNum--;
                localStorage.setItem('user',JSON.stringify(user))
                this.setState({
                    noteList2
                })
                localStorage.setItem('noteList',JSON.stringify(noteList2));
                break;
        }
    }

    dNote = (ID) => {
        switch(this.state.online){
            case true:
                console.log('在线用户删除已完成任务')
                let token = localStorage.getItem('token');
                // 修改本地缓存
                let noteList = this.state.noteList;
                noteList.forEach((note,index)=>{
                    if(note.noteID === ID){
                        noteList.splice(index,1);
                    }
                })
                this.setState({
                    noteList
                })
                sessionStorage.setItem('noteList',JSON.stringify(noteList));
                //发送网络请求
                axios.post(`https://qnote.qfstudio.net/api/note/deleteNote`,{
                    noteID:ID,
                    token:token,
                    username:this.state.user.username
                })
                break;
            default:
                console.log('本地用户删除已完成任务')
                let noteList2 = this.state.noteList;
                noteList2.forEach((note,index)=>{
                    if(note.noteID === ID){
                        noteList2.splice(index,1);
                    }
                })
                this.setState({
                    noteList2
                })
                localStorage.setItem('noteList',JSON.stringify(noteList2));
                break;
        }
    }

    cNote = (ID) => {
        switch(this.state.online){
            case true:
                console.log('在线用户完成任务')
                let token = localStorage.getItem('token');
                // 修改本地缓存
                let noteList = this.state.noteList;
                noteList.forEach((note,index)=>{
                    if(note.noteID === ID){
                        note.done = true;
                     }
                })
                this.setState({
                    noteList
                })
                sessionStorage.setItem('noteList',JSON.stringify(noteList));
                //发送网络请求
                axios.post(`https://qnote.qfstudio.net/api/note/completeTask`,{
                    noteID:ID,
                    token:token,
                    username:this.state.user.username
                })
                break;
            default:
                console.log('本地用户完成任务')
                let noteList2 = this.state.noteList;
                noteList2.forEach((note,index)=>{
                    if(note.noteID === ID){
                       note.done = true;
                    }
                })
                this.setState({
                    noteList2
                })
                // 修改用户数据
                let user = JSON.parse(localStorage.getItem('user'));
                user.completeNoteNum++;
                user.currentNoteNum--;
                localStorage.setItem('user',JSON.stringify(user))
                localStorage.setItem('noteList',JSON.stringify(noteList2));
                break;
        }
    }

    render(){
        return(
            <div className="notepad-wrapper">
                {/* 输入栏 */}
                <header>
                    <input className="note-input-bar"type="text" placeholder="输入标签内容后点击按钮添加" value={this.state.info} onChange={this.handleChange.bind(this)}/>
                    <button onClick={this.handleClick.bind(this)}><i className="iconfont icon-bianjibijishishouxie"></i></button>
                </header>
                <main>
                    {/* 未完成 */}
                    <div className="note-not">
                        <span>未完成</span>
                        {
                            this.state.noteList.map((note,index)=>{
                                if(note.done === false){
                                    return <section className="note-n" key={index}>
                                            <span>{note.noteContent}</span>
                                            <div className="tool">
                                                <i className="iconfont icon-lujing" onClick={this.cNote.bind(this,note.noteID)}></i>
                                                <i className="iconfont icon-lajitong" onClick={this.gNote.bind(this,note.noteID)}></i>
                                            </div>
                                        </section>
                                }
                            })
                        }
                    </div>
                    {/* 已经完成 */}
                    <div className="note-done">
                        <span>已完成</span>
                        {
                            this.state.noteList.map((note,index)=>{
                                if(note.done !== false){
                                    return <section className="note-c" key={index}>
                                        <span>{note.noteContent}</span>
                                            <div className="tool">
                                                <i className="iconfont icon-lajitong" onClick={this.dNote.bind(this,note.noteID)}></i>
                                            </div>
                                        </section>
                                }
                            })
                        }
                    </div>
                </main>
            </div>
        )
    }
}