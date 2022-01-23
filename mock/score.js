const Mock = require("mockjs");

let baseData = Mock.mock({
  data: [
    {
      imgUrl:
        "http://img0.imgtn.bdimg.com/it/u=2399615258,48145576&fm=26&gp=0.jpg",
      height: 0,
      type: "left",
      isLoad: false
    },
    {
      imgUrl:
        "http://img0.imgtn.bdimg.com/it/u=1430171714,2110459552&fm=26&gp=0.jpg",
      height: 0,
      type: "right",
      isLoad: false
    },
    {
      imgUrl:
        "http://img2.imgtn.bdimg.com/it/u=1234395457,3605114231&fm=26&gp=0.jpg",
      height: 0,
      type: "left",
      isLoad: false
    },
    {
      imgUrl:
        "http://img4.imgtn.bdimg.com/it/u=313290354,165879658&fm=26&gp=0.jpg",
      height: 0,
      type: "right",
      isLoad: false
    },
    {
      imgUrl:
        "http://img3.imgtn.bdimg.com/it/u=2609858485,2492473494&fm=26&gp=0.jpg",
      height: 0,
      type: "left",
      isLoad: false
    },
    {
      imgUrl:
        "http://img5.imgtn.bdimg.com/it/u=1862087078,3310404271&fm=26&gp=0.jpg",
      height: 0,
      type: "right",
      isLoad: false
    },
    {
      imgUrl:
        "http://img1.imgtn.bdimg.com/it/u=1303109226,1478914411&fm=26&gp=0.jpg",
      height: 0,
      type: "left",
      isLoad: false
    },
    {
      imgUrl:
        "http://img5.imgtn.bdimg.com/it/u=506967585,466904210&fm=26&gp=0.jpg",
      height: 0,
      type: "right",
      isLoad: false
    },
    {
      imgUrl:
        "http://img3.imgtn.bdimg.com/it/u=3214568930,261048661&fm=26&gp=0.jpg",
      height: 0,
      type: "left",
      isLoad: false
    }
  ]
});

module.exports = {
  [`GET /mock/data`](req, res) {
    res.status(200).json(baseData);
  },
  [`GET /mock/appendData`](req, res) {
    res.status(200).json(baseData);
  }
};
