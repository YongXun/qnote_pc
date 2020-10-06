import axios from 'axios';
import React from 'react';
import { DatePicker, message , Button} from 'antd';
import '../css/datepad.scss'

class DatePad extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            online:false,
            memorial : [
                {title:'中国人民共和国成立',date:'1949-10-01'}
            ],
            input:{
                title:'',
                date:''
            }
        }
    }

    count = (begindate) => {
        begindate = new Date(Date.parse(begindate.replace(/-/g, "/"))); //将开始时间由字符串格式转换为日期格式       

        let current = new Date(); //此处将服务器当前日期作为结束日期，也可为其他任意时间 )

        let myDate = new Date(Date.parse((`${current.getFullYear()}-${current.getMonth() + 1}-${current.getDate()}`).replace(/-/g, "/")))

        let startDate = begindate.getTime()

        let endDate = myDate.getTime(); //将结束日期转换成毫秒  

        let day = parseInt((startDate-endDate)/1000/3600/24); //结束日期减去开始日期后转换成天数    
        
        return day;
    }

    countString = (past) => {
        var start = new Date(past);//初始化输入时间
        var startYear = start.getFullYear();//获取输入年份
        var startMonth = start.getMonth() + 1;//获取输入月份
        var startDay = start.getDate();//获取输入日期
     
        var current = new Date();//当前时间
        current = new Date(Date.parse((`${current.getFullYear()}-${current.getMonth() + 1}-${current.getDate()}`).replace(/-/g, "/")));
        var currentYear = current.getFullYear();//获取当前年份
        var currentMonth = current.getMonth() + 1;//获取当前月份
        var currentDay = current.getDate();//获取当前日期
        var years = 0;//声明一个年数变量
        var months = currentMonth - startMonth + (Math.abs(currentYear - startYear)) * 12;//总月
        if (currentMonth * 100 + currentDay < startMonth * 100 + startDay) {
            months--;//如果结束日期小月输入日期，月数要-1
        }
        years = Math.floor(months / 12);//取整计算年数
        months = months % 12;//取余计算月数
        var middleDate = new Date(start);//中间时间
        middleDate.setFullYear(startYear + years);//设置中间时间年份
        middleDate.setMonth(start.getMonth() + months);//设置中间时间月份
        var days =  Math.floor( ( current.getTime()- middleDate.getTime()) / 24 / 60/ 60 / 1000);//计算天数
        let string = '';
        if(years){
            string += `${years}年`;
        }
        if(months){
            string += `${months}月`
        }
        if(days){
            string += `${days}天`
        }
        console.log(string)
        return string;
    }

    titleChange = (e) => {
        let len = e.target.value.length;
        if(len < 10){
            this.setState({
                input:{
                    title:e.target.value,
                    date:this.state.input.date
                }
            });
        }
        else{
            message.info('注意言简意赅哦！');
        }   
    }

    dateChange = (date, dateString) => {
        this.setState({
            input:{
                title:this.state.input.title,
                date:dateString
            }
        })
    }

    check(){
        if(!this.state.input.title){
            message.info('请输入标题！');
            return false;
        }
        if(!this.state.input.date){
            message.info('请选择日期！');
            return false;
        }
        return true;
    }

    submit = () => {
        if(!this.check()){
            message.info('请确保信息填写正确！');
            return;
        }
        console.log(this.state.online)
        switch(this.state.online){
            case true:
                const token = localStorage.getItem('token');
                console.log('添加纪念日-在线模式');
                axios.post(`https://qnote.qfstudio.net/api/memorial/add`,{token,...this.state.input}).then(res=>{
                    message.success('添加成功！');
                }).catch(err=>{
                    message.info('添加失败，请检查您的网络！');
                })
                let memorialOnLine = JSON.parse(sessionStorage.getItem('memorial') || '[]');
                memorialOnLine.push(this.state.input);
                sessionStorage.setItem('memorial',JSON.stringify(memorialOnLine));
                this.setState({
                    memorial:memorialOnLine,
                    input:{
                        title:'',
                        date:this.state.input.date
                    }
                })
                break;
            default:
                console.log('添加纪念日-离线模式')
                let memorial = JSON.parse(localStorage.getItem('memorial') || '[]');
                memorial.push(this.state.input);
                localStorage.setItem('memorial',JSON.stringify(memorial));
                this.setState({
                    memorial:memorial,
                    input:{
                        title:'',
                        date:this.state.input.date
                    }
                })
                break;
        }
    }

    async componentWillMount(){
        let token = localStorage.getItem('token');
        if(!token){
            console.log('纪念日列表-离线状态');
            let memorial = JSON.parse(localStorage.getItem('memorial') || JSON.stringify([{title:'中国人民共和国成立71周年',date:'2020-10-01'}]));
            this.setState({
                online:false,
                memorial:memorial
            });
        }
        else{
            console.log('纪念日列表-登录状态');
            let memorial = JSON.parse(sessionStorage.getItem('memorial'));
            if(!memorial){
                axios.post(`https://qnote.qfstudio.net/api/memorial`,{
                    token:token
                }).then(res=>{
                    this.setState({
                        online:true,
                        memorial:res.data.memorial
                    })
                })
                return;
            }
            this.setState({
                online:true,
                memorial:memorial
            })
        }
    }

    render(){
        return(
            <div className="datepad-wrapper">
                <div className="tool">
                    <input type="text" value={this.state.input.title} onChange={this.titleChange.bind(this)} placeholder="请输入纪念日主题" className="title-input"/>
                    <DatePicker showToday={true} onChange={this.dateChange.bind(this)}></DatePicker>                
                    <Button type="primary" onClick={this.submit.bind(this)}>添加纪念日</Button>
                </div>
                <div className="date-list">
                    {
                        this.state.memorial.map((date,index)=>{
                            return(
                            <section className="date" key={index} style={{backgroundColor:`rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},.5)`,color:`rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},.5)`}}>
                                <span className="title">{date.title}</span>
                                <span className="date">{date.date}</span>
                                <span className={this.count(date.date)===0?'count':'hidden'}>今天</span>  
                                <span className={this.count(date.date)===0?'hidden':'count'}>{`${Math.abs(this.count(date.date))}${this.count(date.date)<0?'天前':'天后'}`}</span>
                            </section>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}

export default  DatePad;