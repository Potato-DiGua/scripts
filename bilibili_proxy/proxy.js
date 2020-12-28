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

  let options = {
    host: "api.bilibili.com",
    method: "GET",
    headers: headers,
    path: path + req.url.substring(req.url.indexOf("?")),
  };

  //   console.log(options);

  http
    .get(options, (response) => {
      let result = "";

      if (response.statusCode !== 200) {
        resp.send(
          JSON.stringify({
            msg: "错误",
            url: response.url,
            status: response.statusCode,
          })
        );
        return;
      }

      response.setEncoding("utf-8");

      response.on("data", (data) => {
        result += data;
      });

      response.on("end", () => {
        resp.setStatusCode(200);
        resp.send(result);
      });
    })
    .on("error", () => {
      resp.setStatusCode(502);
      resp.send(JSON.stringify({ msg: "解析地址失败" }));
    });
};
