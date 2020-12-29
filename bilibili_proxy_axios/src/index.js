const axios = require("axios");
/*
To enable the initializer feature (https://help.aliyun.com/document_detail/156876.html)
please implement the initializer function as below：
exports.initializer = (context, callback) => {
  console.log('initializing');
  callback(null, '');
};
*/

/**
 * @description 解除b站区域限制用函数计算node脚本
 *
 */

exports.handler = (req, resp) => {
  // 设置返回类型为json,编码格式为utf-8
  resp.setHeader("Content-Type", "application/json;charset=utf-8");
  //   console.log(req.url);

  let headers = { ...req.headers };
  delete headers["host"];

  let path;

  if (req.queries.device === "android") {
    //android解析
    path = "/pgc/player/api/playurl";
    headers["user-agent"] = "Bilibili Freedoooooom/MarkII";
  } else {
    // web解析
    path = "/pgc/player/web/playurl";
  }

  axios
    .get("https://api.bilibili.com" + path, {
      headers: headers,
      params: req.queries,
    })
    .then((response) => {
      if (response.status != 200) {
        console.log(response.data);
        return Promise.reject("解析失败");
      }
      resp.setStatusCode(200);
      resp.send(JSON.stringify(response.data));
    })
    .catch((error) => {
      resp.setStatusCode(502);
      resp.send(JSON.stringify({ msg: error || "错误" }));
    });
};
