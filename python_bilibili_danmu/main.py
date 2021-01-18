import json
import os
import re
import traceback

import requests

from danmu_pb2 import DmSegMobileReply
from dmSettings_pb2 import DmWebViewReply
from google.protobuf.json_format import MessageToDict, MessageToJson
from bs4 import BeautifulSoup


# 因为弹幕会分页下发，所以需要获取弹幕的页数
def get_page_num(url) -> int:
    resp = requests.get(url)

    dm_web = DmWebViewReply()
    dm_web.ParseFromString(resp.content)
    # print(MessageToJson(dm_web))

    return dm_web.dmSge.total


# 获取弹幕
def get_dm_dict(url) -> dict:
    resp = requests.get(url)

    dm = DmSegMobileReply()
    dm.ParseFromString(resp.content)

    return MessageToDict(dm)


def save_to_local(path, json_str):
    with open(path, "w", encoding="utf-8") as f:
        f.write(json_str)
        f.close()


# 从视频页获取api所需参数
def get_params(url) -> dict:
    soup = BeautifulSoup(requests.get(url).content, features="lxml")
    info = {"webTitle": soup.title.text}

    scripts = soup.select("script")
    for item in scripts:
        item = str(item)
        if re.match("<script>[ \n]*window.__INITIAL_STATE__", str(item)):
            text = item[item.find('{'):item.find(';')]
            play_info = json.loads(text)
            ep_info = play_info['epInfo']
            info.update(ep_info)

    # print("--------页面信息--------")
    # print(json.dumps(info, indent=4, ensure_ascii=False))
    # print("--------页面信息--------")
    return info


if __name__ == '__main__':

    # video_url = "https://www.bilibili.com/bangumi/play/ep373964"
    video_url = input("输入番剧地址：")

    params = get_params(video_url)
    if "aid" not in params or "cid" not in params:
        print(json.dumps(params, indent=4, ensure_ascii=False))
        raise Exception("无法获取到参数哦~")
    # exit(0)

    dm_setting_url = "https://api.bilibili.com/x/v2/dm/web/view?type=1&oid=" + str(params['cid']) + \
                     "&pid=" + str(params['aid'])

    page_num = get_page_num(dm_setting_url)
    print("弹幕页数：%d" % page_num)

    url_path = dm_setting_url[dm_setting_url.find('?') + 1:]

    dm_list = []
    for i in range(1, page_num + 1):
        dm_url = "https://api.bilibili.com/x/v2/dm/web/seg.so?" + url_path + "&segment_index=" + str(i)

        try:
            dm_list += get_dm_dict(dm_url)['elems']
            print("第%d页下载完成" % i)
        except Exception:
            print("第%d页下载失败,停止继续下载" % i)
            traceback.print_exc()
            break

    print("弹幕总数:%d" % len(dm_list))
    save_path = params['webTitle'] + ".json"
    save_to_local(save_path, json.dumps(dm_list, indent=4, ensure_ascii=False))
    print("弹幕保存在\"%s\"" % os.path.abspath(save_path))
