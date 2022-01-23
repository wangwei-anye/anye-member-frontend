//  商城
import React from 'react';
import { connect } from 'dva';
import ArticleCell from '@/components/ArticleCell/index';
import { get01ActivityListRequest } from '@/services/index';
import {
  getScrollTop,
  getClientHeight,
  getScrollHeight,
  dataTrackerAction
} from '@/utils/tools';
import LoadingCom from '@/components/Loading/index';
import Skeleton from '@/components/Skeleton/index';
import './index.less';

class Activity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activityList: [],
      isLoading: false,
      isLoadingEnd: false,
      offset: 0
    };
    this.distanceToRefresh = 100;
  }
  componentDidMount() {
    this.fetchList();
    window.addEventListener('scroll', this.handleScroll, false);
    dataTrackerAction({}, { action: 'view_tab' }, { current_tab: '01活動' });
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll, false);
  }
  async fetchList(query = { offset: 0 }) {
    if (this.props.system.pathname !== '/activity') {
      return;
    }
    this.setState({
      isLoading: true
    });
    const postData = Object.assign({}, query, { offset: this.state.offset });
    const { data } = await get01ActivityListRequest(postData);
    const { items } = data;
    if (items && Array.isArray(items) && items.length) {
      const { activityList } = this.state;
      this.setState({
        activityList: activityList.concat(items),
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
  handleClick = (item, index) => {
    const { system } = this.props;
    dataTrackerAction(
      {},
      { action: 'click_activity_item' },
      { item_position: index + 1, item_id: item.id }
    );
    if (system.platform !== 'web') {
      window.sdk.app.goTo(item.data.publishUrl);
    } else {
      window.location.href = item.data.publishUrl;
    }
  };
  onReach = (index, item) => {
    dataTrackerAction(
      { GA: false },
      { action: 'reach_activity_item' },
      { item_position: index + 1, item_id: item.id }
    );
  };
  render() {
    const { activityList, isLoading, isLoadingEnd } = this.state;
    return (
      <div className="activity">
        {isLoading && !activityList.length ? (
          <div>
            {[1, 2, 3, 4].map((item, index) => (
              <Skeleton key={index} />
            ))}
          </div>
        ) : null}
        {activityList.map((item, index) => {
          return (
            <React.Fragment key={index}>
              <ArticleCell
                articleInfo={item}
                onClick={this.handleClick.bind(this, item, index)}
                onReach={this.onReach.bind(this, index)}
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
})(Activity);
