// ==UserScript==
// @name         b站历史记录-仅显示番剧
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  b站历史记录添加番剧筛选功能
// @author       Potato-DiGua
// @supportURL   https://github.com/Potato-DiGua/scripts/blob/main/bilibili_bangumi_history/README.md
// @match        https://www.bilibili.com/account/history
// @icon         http://static.hdslb.com/images/favicon.ico
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    var $ = $ || window.$;

    function isBangumiHistory(liNode) {
        if (liNode == null) {
            return false;
        }
        const p = liNode.find("div.r-info.clearfix > div.cover-contain > p").first();
        return p != null && p.text() == "番剧";
    }
    function setDisplay(display) {

        $("#history_list > li").filter(function (_, element) {
            return !isBangumiHistory($(element))
        }).css("display", display ? "none" : "block");
    }
    function init() {
        const input = $("<input/>", { type: "checkbox", style: "display:inline-block; vertical-align:middle; " })
        console.log(input);
        input.change(function () {
            setDisplay(this.checked);
        });
        $("#app > div > div.newlist_info > div > div.b-head-c").after($("<div/>", {
            style: "display:inline-block; margin-left:16px;padding:6px 0; vertical-align:middle; font-size: 12px;"
        }).append($("<p/>").append(input, "仅显示番剧")));
        const inputEle = input[0]
        const resizeOb = new ResizeObserver(entries => {
            console.log("大小发生变化");

            setDisplay(inputEle.checked);
        });
        resizeOb.observe($("#history_list")[0])
    }
    // hide();
    init();
})();

