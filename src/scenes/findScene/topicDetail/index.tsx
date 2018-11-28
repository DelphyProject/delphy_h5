import React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { Helmet } from 'react-helmet';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import * as fetchData from '../../../redux/actions/actions_fetchServerData';
import * as fetchTypes from '../../../redux/actions/fetchTypes';
import DetailTop from './detailTop/detailTop';
import OptionItem from './optionItem/optionItem';
import CommentItem from './commentItem/commentItem';
import './index.less';
import DetailedInput from '../detailScene/components/detailedComments/detailedInput';
import NotForecast from '../../../components/notForecast';
import NotNetwork from '../../../components/notNetwork';
import Loading from '../../../components/loading';
import LoginAlert from '../../../components/loginAlert/loginAlert';
import { blockedAllAddsImtoken, blockedAdsImtoken } from '../../../config';
import { shareMethod, redirect, reLoad } from '../../../utils/share';
import { getNowTimestamp } from '@/utils/time';

let loginState;
let effectiveTime;
let nowTime: any;
let topNum3;
let topNum3Bool;
let marketDetailPage;
interface TopicDetailProps {
  marketId: number;
  serverData: any;
}
interface TopicDetailState {
  isImtoken: boolean;
  isShowInput: boolean;
  isHideMessage: boolean;
  isShow: boolean;
  isPhoneGap: boolean;
  isShow1: boolean;
  banBuy: boolean;
  loadingOracle: boolean;
}
type Props = TopicDetailProps & DispatchProp & RouteComponentProps;
class TopicDetail extends React.Component<Props, TopicDetailState> {
  // tslint:disable-next-line:variable-name
  _comText: HTMLDivElement | null;
  constructor(props) {
    super(props);
    this.state = {
      isShowInput: false,
      isHideMessage: false,
      banBuy: false,
      isShow: false,
      isShow1: false,
      isImtoken: !!window.imToken,
      isPhoneGap: !!parent.isPhoneGap,
      loadingOracle: false,
    };
    redirect();
    window.addEventListener('sdkReady', () => {
      this.setState({ isImtoken: !!window.imToken });
    });

    shareMethod({
      shareUrl: `http://wx.cokeway.cn/find/topicDetail/${this.props.marketId}`,
      type: 3,
      id: this.props.marketId,
    });
  }

  componentWillUnmount() {
    reLoad();
  }

  componentDidMount() {
    marketDetailPage = document.getElementById('marketDetailPage');
  }

  componentWillMount() {
    const index = window.location.href.indexOf('?');
    if (index > -1) {
      window.location.href = window.location.href.slice(0, index);
    }
    loginState = localStorage.getItem('loginState');
    effectiveTime = localStorage.getItem('effectiveTime');
    this.props.dispatch({ type: fetchTypes.INIT_MARKETSDETAIL });
    this.fetcSpecialMarket();
  }

  loginAlert1 = () => {
    if (!loginState || !effectiveTime) {
      this.setState({ isShow: true });
      return false;
    }
    return this.loginAlert2();
  };

  loginAlert2 = () => {
    nowTime = getNowTimestamp();
    if (effectiveTime - nowTime <= 3) {
      this.setState({ isShow1: true });
      return false;
    }
    return true;
  };

  hideAlert = () => {
    this.setState({
      isShow: false,
      isShow1: false,
    });
  };

  scrollToMethod3 = () => {
    const { marketDetailData } = this.props.serverData;
    topNum3 = sessionStorage.getItem('topNum3');
    if (marketDetailPage) {
      if (marketDetailData.options != undefined) {
        marketDetailPage.scrollTop = topNum3;
      }
    }
  };

  fetcSpecialMarket = () => {
    const newParams = {
      page: 1,
      per_page: 20,
    };
    this.props.dispatch(
      //@ts-ignore
      fetchData.fetchOracleInfo(this.props.marketId, () => {
        this.setState({ loadingOracle: false });
      }),
    );
    this.props.dispatch(
      //@ts-ignore
      fetchData.fetchMarketDetail(this.props.marketId, ret => {
        if (ret.code == 200) {
          if (ret.data) {
            sessionStorage.setItem('invested', ret.data.invested);
            sessionStorage.setItem('endTime', ret.data.endTime);
            sessionStorage.setItem('holdOptionId', ret.data.holdOptionId);
            sessionStorage.setItem('commentOptions', JSON.stringify(ret.data.options));
            sessionStorage.setItem('status', ret.data.status);
            const nowTime = getNowTimestamp();
            const endTime = ret.data.endTime;
            let time = endTime - nowTime;
            if (time > 0) {
              setInterval(() => {
                time--;
                if (time < 1) {
                  this.setState({ banBuy: true });
                }
              }, 1000);
            } else {
              this.setState({ banBuy: true });
            }

            sessionStorage.setItem('invested', ret.data.invested ? '1' : '0');
            sessionStorage.setItem('marketStatus', ret.data.status);
          }
        }
      }),
    );
    this.props.dispatch(
      //@ts-ignore
      fetchData.fetchNewCommentList(this.props.marketId, newParams),
    );
  };

  launchComment = () => {
    this.setState({ isShowInput: true });
  };

  hideBox = () => {
    this.setState({ isShowInput: false });
  };

  buyMethod = id => {
    this.props.history.push(`/buy/${id}`);
  };

  renderAd = () => {
    const { marketDetailData } = this.props.serverData;
    if (marketDetailData.partnerLink == null) return null;
    if (this.state.isImtoken) {
      if (blockedAllAddsImtoken) return null;
      for (let i = 0; i < blockedAdsImtoken.length; i++) {
        if (marketDetailData.partnerLink.indexOf(blockedAdsImtoken[i]) != -1) return null;
      }
    }

    if (this.state.isPhoneGap) {
      return (
        <div
          className="guide"
          // tslint:disable-next-line:jsx-no-lambda
          onClick={() => {
            parent.openLinkInbBrowser(marketDetailData.partnerLink);
          }}>
          <img src={marketDetailData.partnerImg} alt="" />
        </div>
      );
    }

    return (
      <a className="guide" href={marketDetailData.partnerLink}>
        <img src={marketDetailData.partnerImg} alt="" />
      </a>
    );
  };

  goHome = () => {
    sessionStorage.setItem('topNum1Bool', '0');
    sessionStorage.setItem('topNum2Bool', '0');
    sessionStorage.setItem('topNum3Bool', '0');
    sessionStorage.setItem('topNum4Bool', '0');
    sessionStorage.setItem('topNum5Bool', '0');
    this.props.history.push('/');
  };

  topicDetailScroll = () => {
    if (marketDetailPage) {
      const { scrollTop } = marketDetailPage;
      sessionStorage.setItem('topNum3', scrollTop);
    }
  };

  render() {
    const toComentList = () => {
      sessionStorage.setItem('topNum3Bool', '1');
      this.props.history.push(`/comment/${marketDetailData.id}`);
    };

    const {
      marketDetailData,
      newestList,
      oracleInfo,
      isLoading,
      serverError,
    } = this.props.serverData;

    if (marketDetailData.options != undefined) {
      topNum3Bool = sessionStorage.getItem('topNum3Bool');
      if (topNum3Bool == 1) {
        this.scrollToMethod3();
      }
    }

    // tslint:disable-next-line:variable-name
    const _view = () => {
      let rate: any = 0;
      let totalRate = 0;
      if (!marketDetailData.options) return false;
      return marketDetailData.options.map((val, index) => {
        if (marketDetailData.numInvestor == 0) {
          rate = 0;
        } else if (index == marketDetailData.options.length - 1) {
          rate = 100 - (totalRate - 0);
        } else {
          rate =
            val.numInvestor && val.numInvestor != 0
              ? (((val.numInvestor - 0) / (marketDetailData.numInvestor - 0)) * 100).toFixed(0)
              : 0;
          totalRate = totalRate - 0 + (rate - 0);
        }
        return (
          <OptionItem
            appeal={marketDetailData.appeal}
            marketType={marketDetailData.marketType}
            apiData={marketDetailData}
            totalPerson={marketDetailData.numInvestor}
            holdOptionId={marketDetailData.holdOptionId}
            key={index}
            data={val}
            rate={rate}
            buyMethod={this.buyMethod}
            banBuy={this.state.banBuy}
            loginAlert1={this.loginAlert1}
          />
        );
      });
    };

    return serverError ? (
      <NotNetwork />
    ) : (
      <div>
        {isLoading ? (
          <div className="loadingBox">
            <Loading />
          </div>
        ) : (
          <div>
            <DetailedInput
              holdOptionId={marketDetailData.holdOptionId}
              id={this.props.marketId}
              invested={marketDetailData.invested}
              options={marketDetailData.options}
              status={1}
              loginAlert1={this.loginAlert1}
              goHome={this.goHome}
            />
            <div className="topicDetail" id="marketDetailPage" onScroll={this.topicDetailScroll}>
              <Helmet>
                <title>详情</title>
              </Helmet>
              {this.state.isShow ? (
                <LoginAlert info="你尚未登录，请登录" text="去登录" hideAlert={this.hideAlert} />
              ) : (
                false
              )}
              {this.state.isShow1 ? (
                <LoginAlert
                  info="账号信息过期，请重新登录"
                  text="去登录"
                  hideAlert={this.hideAlert}
                />
              ) : (
                false
              )}
              {
                <div className="topicDetailBox">
                  <DetailTop
                    marketId={this.props.marketId}
                    data={marketDetailData}
                    oracleInfo={oracleInfo}
                    isCollect={marketDetailData.subscribed}
                    loginAlert1={this.loginAlert1}
                  />
                  <div className="selectBox">{_view()}</div>
                  {this.renderAd()}

                  <div
                    className="commentBox"
                    id="commentBox"
                    ref={e => {
                      this._comText = e;
                    }}>
                    <p className="title" id="comText">
                      评论
                    </p>
                    {!this.state.isHideMessage && marketDetailData.options != undefined ? (
                      <div
                        className="commentBtn"
                        // tslint:disable-next-line:jsx-no-lambda
                        onClick={() => {
                          this.launchComment();
                        }}
                      />
                    ) : (
                      false
                    )}
                    <div>
                      {newestList != '' ? (
                        <div>
                          {newestList.map((val, index) => {
                            if (index > 3) {
                              return null;
                            }
                            return (
                              <CommentItem
                                status={marketDetailData.status}
                                apiData={marketDetailData}
                                typeId={1}
                                holdOptionId={marketDetailData.holdOptionId}
                                banBuy={this.state.banBuy}
                                key={index}
                                data={val}
                                loginAlert1={this.loginAlert1}
                              />
                            );
                          })}
                          <div
                            className="toLoadMore"
                            // tslint:disable-next-line:jsx-no-lambda
                            onClick={() => {
                              toComentList();
                            }}>
                            <span className="text">查看更多评论</span>
                            <span className="iconMore icon-public_icon_back_normal " />
                          </div>
                        </div>
                      ) : (
                        <div className="noCommentBox">
                          {' '}
                          <NotForecast title="暂无评论！" titleTwo="" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = store => ({ serverData: store.marketDetailState });

export default connect(mapStateToProps)(withRouter(TopicDetail));
