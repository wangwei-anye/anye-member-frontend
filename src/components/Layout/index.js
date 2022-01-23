import React from 'react';
import { connect } from 'dva';
import Header from '@/components/Header';
import NavBar from '@/components/NavBar';
import MemberInfo from '@/components/MemberInfo';
import TabList from '@/components/TabList';
import './index.less';

const showRoot = () => {
  window.document.body.className = '';
}

class CommomLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowTablist: true
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: "auth/getLoginStatus",
      payload: {},
    }).then(() => {
      showRoot();
    });
  }

  render() {
    const { isShowTablist } = this.state;
    return (
      <div className="layout">
        <Header title="01會員專區" isRecommend={true}/>
        <MemberInfo />
        <NavBar />
        {isShowTablist ? <TabList /> : null}
        <div
          className={[
            'g-common-page-wrap',
            isShowTablist ? '' : 'no-tablist'
          ].join(' ')}
        >
          {this.props.children}
        </div>
      </div>
    );
  }
}
export default connect(({ system, auth }) => {
  return {
    system: system.toJS(),
    auth: auth.toJS()
  };
})(CommomLayout);
