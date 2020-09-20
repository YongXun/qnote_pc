import React from 'react';
import { HashRouter as Router, Link, Route } from 'react-router-dom';
import { message } from 'antd';
import UserPad from './pages/userpad'
import NotePad from './pages/notepad'
import MottoPad from './pages/mottopad'
import './App.scss';

message.config({
  top:100,
  duration: 1,
  maxCount: 1,
  rtl: false,
  getContainer:() => document.querySelector('.App') || document.head
});

export default class App extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    }
  }

  render(){
    return(
      <div className="App">
        <Router>
          <nav>
            <section>
              <i className="iconfont icon-daohanggerenzhongxin"></i> 
              <Link to="/">QNote</Link>
            </section>
            <section>
              <i className="iconfont icon-bianjibijishishouxie"></i> 
              <Link to="/note">事务列表</Link>
            </section>
            <section>
              <i className="iconfont icon-icon-test"></i> 
              <Link onClick={()=>{message.info('功能维护中')}}>纪念日</Link>
            </section>
            <section>
              <i className="iconfont icon-liuyan"></i> 
              <Link to="./motto" >经典语录</Link>
            </section>
            <section>
              <i className="iconfont icon-shezhi"></i> 
              <Link onClick={()=>{message.info('功能开发中')}}>应用设置</Link>
            </section>
          </nav>
          <main className="container">
            <Route exact path="/" component={UserPad}></Route>
            <Route path="/note" component={NotePad}></Route>
            <Route path="/motto" component={MottoPad}></Route>
          </main>
        </Router>
      </div>
    )
  }
}
