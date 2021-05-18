import got from "got";
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

export default exports.handler = (req: any, resp: any) => {

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

  got.get("https://api.bilibili.com" + path, {
    headers: headers,
    searchParams: req.queries
  }).then(response => {
    resp.setStatusCode(200);
    resp.send(response.body);
  }).catch(error => {
    resp.setStatusCode(502);
    resp.send(JSON.stringify(error));
  })
};
