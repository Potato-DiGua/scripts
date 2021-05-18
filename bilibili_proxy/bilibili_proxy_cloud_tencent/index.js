"use strict";
const https = require("https");
const querystring = require("querystring");
const zlib = require("zlib");

exports.main_handler = async (event, context) => {
    // return {msg:"test"};
    console.log(event);
    let headers = { ...event.headers };
    delete headers["host"];

    let queries = { ...event.queryString };
    let path;
    if (queries.device === "android") {
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
        path: path + "?" + querystring.stringify(queries),
    };

    console.log(options);
    // console.log(`url=https://${options.host}${options.path}`);

    try {
        let result = await new Promise((resolve, reject) => {
            https
                .request(options, (response) => {
                    if (response.statusCode !== 200) {
                        reject({
                            msg: "错误",
                            url: response.url,
                            status: response.statusCode,
                        });
                        return;
                    }

                    let buffer = "";

                    // gzip解压缩
                    if (response.headers["content-encoding"] && response.headers["content-encoding"].toLowerCase().indexOf("gzip") >= 0) {
                        response = response.pipe(zlib.createGunzip());
                    } else {
                        response.setEncoding("utf-8");
                    }

                    response.on("data", (chunk) => {
                        console.log("data=" + chunk);
                        buffer += chunk.toString();
                    });

                    response.on("end", () => {
                        console.log("end=" + buffer);
                        try {
                            resolve(JSON.parse(buffer));
                        } catch (error) {
                            reject({
                                msg: "不能转化为json",
                                data: json,
                                respHeaders: response.headers,
                            });
                        }
                    });
                })
                .on("error", () => {
                    reject({ msg: "解析地址失败" });
                })
                .end();
        });
        return result;
    } catch (error) {
        return error;
    }
};
