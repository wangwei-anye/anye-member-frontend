//  商城
import React from 'react';
import { connect } from 'dva';
import ArticleCell from '@/components/ArticleCell/index';
import { getMallListRequest } from '@/services/index';
import { getScrollTop, getClientHeight, getScrollHeight } from '@/utils/tools';
import LoadingCom from '@/components/Loading/index';
import Skeleton from '@/components/Skeleton/index';
import './index.less';

class Mall extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mallList: [],
      isLoading: false,
      isLoadingEnd: false,
      offset: 0
    };
    this.distanceToRefresh = 100;
  }
  componentDidMount() {
    // TODO 由于 无限商城跳转到 01无限 商城页面，故不处理
    // this.fetchList();
    // window.addEventListener('scroll', this.handleScroll, false);
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll, false);
  }
  async fetchList(query = { offset: 0 }) {
    if (this.props.system.pathname !== '/mall') {
      return;
    }
    this.setState({
      isLoading: true
    });
    const postData = Object.assign({}, query, { offset: this.state.offset });
    const { data } = await getMallListRequest(postData);
    const { items } = data;
    if (items.length) {
      const { mallList } = this.state;
      this.setState({
        mallList: mallList.concat(items),
        offset: data.nextOffset,
        isLoadingEnd: !data.nextOffset
      });
    }
    this.setState({
      isLoading: false
    });
  }
  handleScroll = () => {
    const { isLoading, isLoadingEnd } = this.state;
    const that = this;
    if (
      getScrollTop() + getClientHeight() + that.distanceToRefresh >
      getScrollHeight()
    ) {
      if (!isLoading && !isLoadingEnd) {
        that.fetchList();
      }
    }
  };
  handleClick = item => {
    if (this.props.system.platform !== 'web') {
      window.sdk.app.goTo(item.data.publishUrl);
    } else {
      window.location.href = item.data.publishUrl;
    }
  };
  render() {
    const { mallList, isLoading, isLoadingEnd } = this.state;
    return (
      <div className="mall">
        {isLoading && !mallList.length ? (
          <div>
            {[1, 2, 3, 4].map((item, index) => (
              <Skeleton key={index} />
            ))}
          </div>
        ) : null}
        {mallList.map((item, index) => {
          return (
            <React.Fragment key={index}>
              <ArticleCell
                articleInfo={item}
                onClick={this.handleClick.bind(this, item)}
              />
            </React.Fragment>
          );
        })}
        <div>
          <LoadingCom isLoading={isLoading} isDone={isLoadingEnd} />
        </div>
      </div>
    );
  }
}
export default connect(({ system }) => {
  return {
    system: system.toJS()
  };
})(Mall);
