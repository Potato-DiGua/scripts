import json
import logging
import os
import random
import time
from concurrent.futures.thread import ThreadPoolExecutor
from enum import Enum
from typing import List
from urllib.parse import urlencode

import requests

from src.utils import *


class Mode(Enum):
    MODE_MONTH = "monthly"
    MODE_WEEK = "weekly"
    MODE_DAY = "daily"
    MODE_ROOKIE = "rookie"
    MODE_ORIGINAL = "original"
    MODE_MALE = "male"
    MODE_FEMALE = "female"
    MODE_R18 = "_r18"


ONLY_ILLUST = True
ONLY_COVER = True
TIMEOUT = 60
MODE: Mode = Mode.MODE_WEEK
SAVE_PATH = "../images/"
DELAY_SECONDS = 3
r18 = False

HEADER = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/90.0.4430.212 Safari/537.36 "

}
PROXY = {"http": "socks5://127.0.0.1:19527", "https": "socks5://127.0.0.1:19527"}


def create_rank_url(index: int) -> str:
    qurey = {
        "mode": MODE.value,
        "p": index,
        "format": "json"
    }
    if r18:
        qurey["mode"] += MODE.MODE_R18.value
    if ONLY_ILLUST:
        qurey["content"] = "illust"
    return f"https://www.pixiv.net/ranking.php?{urlencode(qurey)}"


def task_generator():
    item_count = 0
    index = 1
    while True:
        url = create_rank_url(index)
        resp = session.get(url)
        data = json.loads(resp.text)
        contents: List = data["contents"]
        for content in contents:
            yield int(content["illust_id"])

        item_count += len(contents)
        if item_count >= data["rank_total"]:
            break
        index += 1


def task_pages(illust_id: int):
    pages_url = f"https://www.pixiv.net/ajax/illust/{illust_id}/pages?lang=zh"
    data = json.loads(session.get(pages_url).text)
    for item in data["body"]:
        yield item["urls"]["original"]


def task_img_download(img_url: str, name: str, delay: float = 0) -> bool:
    path = get_img_save_path(name)
    try:
        if len(name) == 0:
            return False

        if delay >= 0:
            logging.info(f"休眠{delay}秒")
            time.sleep(delay)

        resp = session.get(url=img_url, stream=True, timeout=TIMEOUT, headers={"referer": "https://www.pixiv.net"})
        total_size = int(resp.headers["content-length"])
        logging.info(f"{img_url}({format_file_size(total_size)})开始下载")
        size = 0

        with open(path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=4 * 1024):
                f.write(chunk)
                size += len(chunk)
                # logging.info(f'{img_url}已下载:{percentage(size / total_size)}')
            f.close()
        logging.info(f"{img_url}：下载成功")
        return True
    except Exception as e:
        logging.error(img_url + "：下载失败")
        logging.exception(e)
        if os.path.exists(path):
            os.remove(path)
        return False


def get_img_save_path(name):
    return SAVE_PATH + "/" + name


def main():
    tasks = []
    if not os.path.exists(SAVE_PATH):
        os.makedirs(SAVE_PATH)
    thread_pool = ThreadPoolExecutor(max_workers=5)
    img_count = 0
    exist_count = 0
    for illust_id in task_generator():
        for img_url in task_pages(illust_id):
            img_count += 1
            name = get_name_from_url(img_url)
            path = get_img_save_path(name)
            if os.path.exists(path):
                exist_count += 1
                logging.info(f"{img_url}：已存在")
                if ONLY_COVER:
                    break
                else:
                    continue

            delay = DELAY_SECONDS + random.randint(0, 5)
            tasks.append(thread_pool.submit(task_img_download, img_url, name, delay))

            if ONLY_COVER:
                break
        # if img_count >= 10:
        #     break

    success = 0
    for task in tasks:
        if task.result():
            success += 1

    logging.info(f"图片数：{img_count},成功下载数：{success},已下载数：{exist_count},失败下载数：{img_count - success - exist_count}")


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)

    session = requests.session()
    session.proxies = PROXY
    session.headers = HEADER
    main()
