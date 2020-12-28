var http = require("http");
/*
To enable the initializer feature (https://help.aliyun.com/document_detail/156876.html)
please implement the initializer function as below：
exports.initializer = (context, callback) => {
  console.log('initializing');
  callback(null, '');
};
*/

exports.handler = (req, resp, context) => {
  // 设置返回类型为json,编码格式为utf-8
  resp.setHeader("Content-Type", "application/json;charset=utf-8");
  console.log(req.url);

  let headers = { ...req.headers };
  delete headers["host"];

  let path;
  let device;
  const ANDROID = 0;
  const WEB = 1;

  if (req.queries.device === "android") {
    path = "/pgc/player/api/playurl";
    headers["user-agent"] = "Bilibili Freedoooooom/MarkII";
    console.log("android设备");
    device = ANDROID;
  } else {
    path = "/pgc/player/web/playurl";
    device = WEB;
  }

  let options = {
    host: "api.bilibili.com",
    method: "GET",
    headers: headers,
    path: path + req.url.substring(req.url.indexOf("?")),
  };

  console.log(options);

  http
    .get(options, (res) => {
      let result = "";
      if (res.statusCode !== 200) {
        resp.send(
          JSON.stringify({ msg: "错误", url: res.url, status: res.statusCode })
        );
        return;
      }
      res.setEncoding("utf-8");
      res.on("data", (data) => {
        result += data;
      });
      res.on("end", () => {
        if (device === ANDROID) {
          // for (let key in res.headers) {
          //     resp.setHeader(key, res.headers[key]);
          // }
          resp.headers = { ...res.headers };
        }
        console.log(resp.headers);
        resp.setStatusCode(200);
        resp.send(result);
      });
    })
    .on("error", () => {
      resp.setStatusCode(502);
      resp.send(JSON.stringify({ msg: "解析地址失败" }));
    });
};
