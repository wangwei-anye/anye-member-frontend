import React from 'react';
import LazyLoad from 'react-lazy-load';
import ReachTracker from '@/components/ReachTracker';
import './index.less';

const LAZY_LOAD_DISTANCE = 100;
const defaultBgImg = require('@/assets/img/placeholder.png');
const formatData = timestamp => {
  if (!timestamp) {
    return timestamp;
  }
  if (typeof timestamp !== 'number') {
    return timestamp;
  }
  return new Date(timestamp * 1000)
    .toLocaleDateString()
    .split('/')
    .map(item => (+item < 10 ? '0' + item : item))
    .join('-');
};
export default class ArticleCell extends React.Component {
  handleImgError = e => {
    const target = e.target;
    target.src = defaultBgImg;
  };
  handleClick = () => {
    if (this.props.onClick && typeof this.props.onClick === 'function') {
      this.props.onClick();
    }
  };
  lazyLoadPlaceholder() {
    return <img src={defaultBgImg} alt="" className="img" />;
  }
  onReach = () => {
    const { onReach, articleInfo } = this.props;
    if (onReach && typeof onReach === 'function') {
      onReach(articleInfo);
    }
  };
  render() {
    const { articleInfo } = this.props;
    const infoObj = articleInfo.data;
    const { displayMode } = infoObj;
    return (
      <React.Fragment>
        {displayMode === 'small_image' ? (
          <div
            className="m-article-cell-wrap m-small-cell-wrap"
            onClick={this.handleClick}
          >
            <div className="cover-list">
              <LazyLoad offset={LAZY_LOAD_DISTANCE}>
                <img
                  src={
                    infoObj.mainImage ? infoObj.mainImage.cdnUrl : defaultBgImg
                  }
                  alt=""
                  onError={this.handleImgError}
                  className="img"
                />
              </LazyLoad>
            </div>
            <div className="m-desc-wrap">
              <p className="cell-title">{infoObj.title}</p>
              <p className="note">
                <span className="note-cell">
                  {infoObj.authors[0].publishName}
                </span>
                <span className="note-cell">
                  {formatData(infoObj.publishTime)}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="m-article-cell-wrap" onClick={this.handleClick}>
            <p className="cell-title">{infoObj.title}</p>
            <div className="m-cover-wrap">
              {displayMode === 'three_images' ? (
                <React.Fragment>
                  {infoObj.thumbnails.map(item => {
                    return (
                      <div
                        className="cover-list cover-multi-list"
                        key={item.mediaId}
                      >
                        <LazyLoad offset={LAZY_LOAD_DISTANCE}>
                          <img
                            src={item.cdnUrl}
                            alt=""
                            className="img"
                            onError={this.handleImgError}
                          />
                        </LazyLoad>
                      </div>
                    );
                  })}
                </React.Fragment>
              ) : (
                <div className="cover-list">
                  <LazyLoad offset={LAZY_LOAD_DISTANCE}>
                    <img
                      src={infoObj.mainImage.cdnUrl}
                      alt=""
                      className="img"
                      onError={this.handleImgError}
                    />
                  </LazyLoad>
                </div>
              )}
            </div>
            <p className="note">
              <span className="note-cell">
                {infoObj.authors[0].publishName}
              </span>
              <span className="note-cell">
                {formatData(infoObj.publishTime)}
              </span>
            </p>
          </div>
        )}
        <ReachTracker onReach={this.onReach} />
      </React.Fragment>
    );
  }
}
