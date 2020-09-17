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
            info:''
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
            this.setState({
                online:true,
                noteList:noteList
            });
        }
    }

    handleChange = (e) => {
        let len = e.target.value.length;
        if(len < 15){
            this.setState({
                info:e.target.value
            });
        }
        else{
            message.info('注意言简意赅哦！');
        }   
    }

    handleClick = (e) => {
        let info = this.state.info;
        if(!info){
            message.info('请输入便签内容！');
        }
        else{
            if(this.online){

            }
            else{
                let noteList = JSON.parse(localStorage.getItem('noteList') || '[]');
                noteList.push({
                    noteID:noteList.length,
                    noteContent:this.state.info,
                    noteRemark:'',
                    done:false
                });
                this.setState({
                    noteList:noteList,
                    info:''
                })
                localStorage.setItem('noteList',JSON.stringify(noteList));
            }
        }
    }

    gNote = (ID) => {
        switch(this.state.online){
            case true:
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
                    token:token
                })
                break;
            default:
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

    dNote = (ID) => {
        switch(this.state.online){
            case true:
                let token = localStorage.getItem('token');
                break;
            default:
                let noteList = this.state.noteList;
                noteList.forEach((note,index)=>{
                    if(note.noteID === ID){
                        noteList.splice(index,1);
                    }
                })
                this.setState({
                    noteList
                })
                localStorage.setItem('noteList',JSON.stringify(noteList));
                break;
        }
    }

    cNote = (ID) => {
        switch(this.state.online){
            case true:
                let token = localStorage.getItem('token');
                break;
            default:
                let noteList = this.state.noteList;
                noteList.forEach((note,index)=>{
                    if(note.noteID === ID){
                       note.done = true;
                    }
                })
                this.setState({
                    noteList
                })
                localStorage.setItem('noteList',JSON.stringify(noteList));
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