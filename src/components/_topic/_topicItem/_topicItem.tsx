import React, { Component, MouseEvent } from 'react';
import { showToast } from '@/utils/common';
import './_topicItem.less';
import { connect, DispatchProp } from 'react-redux';
import * as fetchData from '../../../redux/actions/actions_fetchServerData';
import { formatTime } from '../../../utils/time';

interface TopicItemProps {
  data: any;
  loginAlert1: any;
  typeId: string;
  toDetailPage: any;
}

interface TopicItemState {
  ableClick: boolean;
  isCollect: boolean;
  favorateImg: string;
  isImtoken: boolean;
}

type Props = TopicItemProps & DispatchProp;

class Topic extends Component<Props, TopicItemState> {
  constructor(props) {
    super(props);
    this.state = {
      ableClick: true,
      favorateImg: 'unfavorate.png',
      isCollect: this.props.data.subscribed,
      isImtoken: !!window.imToken,
    };

    window.addEventListener('sdkReady', () => {
      this.setState({ isImtoken: !!window.imToken });
    });
  }

  collect = (e: MouseEvent<HTMLDivElement>, marketId) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    if (this.props.loginAlert1()) {
      this.props.dispatch(
        // @ts-ignore
        fetchData.collect(marketId, result => {
          if (result.code == 200) {
            showToast('收藏成功', 2);
            this.setState({
              isCollect: true,
            });
          } else {
            showToast(result.msg, 2);
          }
        }),
      );
    }
  };

  unCollect = (e: MouseEvent<HTMLDivElement>, marketId) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    if (this.props.loginAlert1()) {
      this.props.dispatch(
        // @ts-ignore
        fetchData.unCollect(marketId, result => {
          if (result.code == 200) {
            showToast('取消收藏', 2);
            this.setState({
              isCollect: false,
            });
          } else {
            showToast(result.msg, 2);
          }
        }),
      );
    }
  };

  collectMethod = (e: MouseEvent<HTMLDivElement>) => {
    const marketId = this.props.data.id;
    if (this.state.isCollect) {
      this.unCollect(e, marketId);
    } else {
      this.collect(e, marketId);
    }
  };

  handleClick = () => {
    if (this.props.typeId == 'find') {
      const findPage = document.getElementById('findPageNew');
      sessionStorage.setItem('currentScrollVal', String(findPage ? findPage.scrollTop : 0));
    }
    this.props.toDetailPage(this.props.data.id);
  };

  render() {
    let imgBg;
    let imgBgPartner;
    let thisMarketType;
    let thisMarketDes;
    let thisMarketTypeClassName;
    if (this.props.data.marketType == 1) {
      thisMarketType = '只赢不输';
      thisMarketTypeClassName = 'winAndNotLose';
      if (this.props.data.nextNumInvestor == -1 && this.props.data.nextReward == -1) {
        thisMarketDes = (
          <div className="itemTopMid">
            <img className="img2" src={require('../../../img/find/partB.png')} />
            <div className="rightWord">
              <p className="title1">
                总奖池
                {this.props.data.totalReward}
                DPY,当前奖池
                {this.props.data.currentReward} DPY,赢者平分{' '}
              </p>
              <p className="gray13">
                参与者达到
                {this.props.data.numInvestor}
                人,奖池已达到
                {this.props.data.currentReward} DPY
              </p>
            </div>
          </div>
        );
      } else {
        thisMarketDes = (
          <div className="itemTopMid">
            <img className="img2" src={require('../../../img/find/partA.png')} />
            <div className="rightWord">
              <p className="title1">
                总奖池
                {this.props.data.totalReward}
                DPY,当前奖池
                {this.props.data.currentReward} DPY,赢者平分
              </p>
              <p className="gray13">
                再有
                {this.props.data.nextNumInvestor - this.props.data.numInvestor < 0
                  ? 0
                  : this.props.data.nextNumInvestor - this.props.data.numInvestor}
                位参与者,奖池将提升至
                {this.props.data.nextReward} DPY
              </p>
            </div>
          </div>
        );
      }
    } else if (this.props.data.marketType == 4) {
      thisMarketTypeClassName = 'winnerTakeAll';
      thisMarketType = '赢者全拿';
      thisMarketDes = (
        <div className="itemTopMid">
          <img className="winnertakeallImg" src={require('../../../img/find/winnertakeall.png')} />
          <div className="rightWord rightWord1">
            <p className="title1">
              当前奖池
              {this.props.data.currentReward} DPY
              <i className="allowTop" />
              ,赢者平分
            </p>
            <p className="gray13">每个用户的投入都会成为奖池的一部分</p>
          </div>
        </div>
      );
    }
    if (this.props.data.image != '') {
      if (this.props.data.image.indexOf(',') == -1) {
        imgBg = this.props.data.image;
        imgBgPartner = imgBg; // No choice. Only one image
      } else {
        const images = this.props.data.image.split(',');
        [imgBg, imgBgPartner] = images;
      }
    }
    return (
      <div className="topicBox">
        {this.props.data ? (
          <div className="topicItem" onClick={this.handleClick}>
            <div className="itemTop">
              <div className="itemTopBox">
                <img className="topicBgImg" src={this.state.isImtoken ? imgBg : imgBgPartner} />
                <div className="wraperBox">
                  <div className="favotate" onClick={this.collectMethod}>
                    <div>
                      {this.state.isCollect ? (
                        <i className="iconfont icon-shoucang font-orange-gradient" />
                      ) : (
                        <i className="iconfont icon-shoucang font-ccc" />
                      )}
                    </div>
                  </div>
                  <div className="topicImgMidTitle">
                    <span className={thisMarketTypeClassName}>{thisMarketType}</span>
                    {this.props.data.title}
                  </div>
                  <div className="topicImgBom">
                    <div className="left">
                      <i className="img1 iconfontMarket icon-Group4" />
                      <span>{formatTime(this.props.data.endTime)}</span>
                    </div>
                    <div className="right">
                      <i className="img2 iconfontMarket icon-Adeltails_amoun" />
                      <span> {this.props.data.numInvestor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {thisMarketDes}
            <div className="itemBomBox">
              {this.props.data.options.map((item, j) => {
                const bg = j % 2 == 0 ? 'bomItemBg1' : 'bomItemBg2';
                let select;
                if (j == 0) {
                  select = 'A';
                } else if (j == 1) {
                  select = 'B';
                } else if (j == 2) {
                  select = 'C';
                } else if (j == 3) {
                  select = 'D';
                } else if (j == 4) {
                  select = 'E';
                }
                return (
                  <div key={j} className={`bomItem ${bg}`}>
                    <div className="left">
                      <span className="img4Font">{select}</span>
                      {/* <img className="img4" src={require('../../../../img/find/right1.png')} /> */}
                      <span className="black15"> {item.title}</span>
                    </div>
                    <div className="right">
                      <i className="img5 iconfontMarket icon-Adeltails_amoun" />
                      <span className="gray13"> {item.numInvestor}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          false
        )}
      </div>
    );
  }
}
const mapStateToProps = store => ({
  serverData: store.marketDetailState,
});
export default connect(mapStateToProps)(Topic);
