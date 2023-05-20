// ==UserScript==
// @name         kisssub 便捷下载
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://www.kisssub.org
// @match        http://www.kisssub.org/search.php*
// @include        /^http(s)?:\/\/www\.kisssub\.org\/show-.*\.html.*$/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kisssub.org
// @grant        none
// @run-at document-end
// ==/UserScript==

import React from 'dom-chef';
import styles from './css/pure.module.css';

(function () {
    'use strict';

    /**
     * @param {String} text 需要复制的内容
     * @return {Boolean} 复制成功:true或者复制失败:false  执行完函数后，按ctrl + v试试
     */
    function copyText(text: string): boolean {
        const textareaC = document.createElement('textarea');
        textareaC.setAttribute('readonly', 'readonly'); //设置只读属性防止手机上弹出软键盘
        textareaC.value = text;
        document.body.appendChild(textareaC); //将textarea添加为body子元素
        textareaC.select();
        const res = document.execCommand('copy');
        document.body.removeChild(textareaC); //移除DOM元素
        console.log('复制成功');
        return res;
    }

    function download(href: string) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function isNeedAutoDownload() {
        const uri = new URLSearchParams(location.search);
        return uri.get('autodownload') === 'true';
    }

    async function getMagnetUrlFromNet(url: string) {
        try {
            const html = await (await fetch(url)).text()!;
            const hashId = html
                .match(/Config\['hash_id'\] = "(.*)"/)?.[1]
                .trim();
            const announce = html
                .match(/Config\['announce'\] = "(.*)"/)?.[1]
                .trim();
            return `magnet:?xt=urn:btih:${hashId}&tr=${announce}`;
        } catch (error) {
            console.error(error);
        }
        return '';
    }

    function addExtraBtn() {
        const head = document.querySelector('#listTable > thead > tr')!;
        const th = (
            <th axis="string" className="l8 tableHeaderOver">
                动作
            </th>
        );
        head.appendChild(th);
        const trs = document.querySelectorAll('#data_list > tr');
        trs.forEach((tr) => {
            const href = tr.querySelector('td:nth-child(3) > a').href;

            const td = (
                <td>
                    <button
                        style={{marginRight: '5px'}}
                        className={`${styles['pure-button']} ${styles['pure-button-primary']}`}
                        onClick={async () => {
                            download(await getMagnetUrlFromNet(href));
                        }}
                    >
                        下载
                    </button>
                    <button
                        className={`${styles['pure-button']} ${styles['pure-button-primary']}`}
                        onClick={async () => {
                            const magnetUrl = await getMagnetUrlFromNet(href);
                            copyText(magnetUrl);
                        }}
                    >
                        复制磁力链接
                    </button>
                </td>
            );
            tr.appendChild(td);
        });
    }

    function autoDownload() {
        if (
            isNeedAutoDownload() &&
            Config &&
            Config['hash_id'] &&
            Config['announce']
        ) {
            const magnetUrl = `magnet:?xt=urn:btih:${Config['hash_id']}&tr=${Config['announce']}`;
            console.log(magnetUrl);
            download(magnetUrl);
            setTimeout(() => {
                window.close();
            }, 300);
        }
    }

    addExtraBtn();
    // autoDownload();
})();
