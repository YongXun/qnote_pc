import React from 'react';
import axios from 'axios';
import '../css/mottopad.scss'
import { message } from 'antd';

export default class MottoPad extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            online : false,
            motto:{
                hitokoto:"会有那么一天",
                from_who:'',
                from:'原创'
            }
        }
    }

    getMotto = () => {
        axios.get(`https://qnote.qfstudio.net/api/motto`).then((res)=>{
            this.setState({
                motto:res.data
            })
            console.log(res.data);
        }).catch((err)=>{console.log(err)})
    }

    copy = () => {
        var tag = document.createElement('input');
        tag.setAttribute('id', 'cp_hgz_input');
        tag.value = this.state.motto.hitokoto;
        document.getElementById('copy').appendChild(tag);
        document.getElementById('cp_hgz_input').select();
        document.execCommand('copy');
        document.getElementById('cp_hgz_input').remove();
        message.success('已经复制到粘贴板上！')
    }

    componentWillMount(){
        this.getMotto();
    }

    render(){
        return(
            <div className="mottopad-wrapper">
                {/* 语录 */}
                <div className="motto-wrapper">
                    <div className="motto">
                        <span className="hitokoto">{this.state.motto.hitokoto}</span>
                        <span className="from">{`——${this.state.motto.rom_who?this.state.motto.rom_who:''}《${this.state.motto.from}》`}</span>
                    </div>
                </div>
                {/* 工具箱 */}
                <div className="tool">
                    {/* 换一条 */}
                    <button onClick={this.getMotto.bind(this)}><i className="iconfont icon-shuaxin"></i>换一条</button>
                    {/* 点赞 */}
                    <button onClick={this.copy.bind(this)}><i className="iconfont icon-bianjibijishishouxie"></i>复制</button>
                </div>
                {/* 粘贴板 */}
                <div id="copy"></div>
            </div>
        )
    }
}