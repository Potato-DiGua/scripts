import random
import time

import requests
from pyquery import PyQuery as pq
from concurrent.futures import ThreadPoolExecutor


# 下载
def download(url, encoding="utf-8"):
    try:
        response = requests.get(url)
        response.encoding = encoding
        if response:
            return response.text
    except Exception as e:
        print(e)
    return ""


# 获取章节正文
def getContent(url, chapterName):
    # print(url + "," + chapterName)
    try:
        time.sleep(3 + random.randint(0, 5))
        doc = pq(download(url))
        content = doc("#content")
        print(chapterName + "【下载完毕】")
        return chapterName + "\n" + str(content.text()).replace("\n\n", "\n").replace("\n。", "")
    except Exception as e:
        print(url + "," + chapterName + "  【下载失败】")
        print(e)
    return ""


def getNovel(chapters_list_url):
    soup = pq(download(chapters_list_url))
    info = soup("#info")
    novel_name = info.find("h1").text()
    novel = novel_name + "\n" + info.find("p").eq(0).text() + "\n"
    chapters = soup("#list")

    # 开启线程池
    executor = ThreadPoolExecutor(max_workers=MAX_WORKERS)
    items = list(chapters.items("a"))
    content_list = []
    for a in items:
        title = a.text()
        url = HOST + a.attr("href")
        work = executor.submit(getContent, url, title)
        content_list.append(work)

    for work in content_list:
        novel += work.result() + "\n"
    executor.shutdown()
    return novel_name, novel


def saveNovel(content, path):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
        f.flush()
        f.close()


# 笔趣阁小说爬虫
if __name__ == '__main__':
    # 工作线程数
    MAX_WORKERS = 3
    # 域名
    HOST = "https://www.xbiquge.la"
    name, novel = getNovel(HOST + "/74/74095/")
    saveNovel(novel, name + ".txt")
