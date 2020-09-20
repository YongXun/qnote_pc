import React from 'react';
import axios from 'axios';

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

    componentWillMount(){
        axios.get(`https://qnote.qfstudio.net/api/motto`).then((res)=>{
            this.setState({
                motto:res.data
            })
            console.log(res.data);
        }).catch((err)=>{console.log(err)})
    }

    render(){
        return(
            <div className="mottopad-wrapper">
                {/* 语录 */}
                <div className="motto-wrapper">
                    <div className="motto">
                        
                    </div>
                </div>
                {/* 工具箱 */}
                <div className="tool">

                </div>
                {/* 收藏页面 */}
                <button className="turn-to-collect"></button>
            </div>
        )
    }
}