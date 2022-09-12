#!/usr/bin/env python
import re

import youtube_dl
from rich import print
from rich.console import Console
from bs4 import BeautifulSoup
import requests
import urllib.request
from urllib.error import HTTPError
import os
from PIL import Image
from pyquery import PyQuery as pq

r = Console()
directory = r'I:\video'  # <== edit this to your preference


def video(url):
    go = True
    i = 1
    while go:
        download_video(url, '/videos/%(title)s.%(ext)s')
        if i > 1:
            go = input('continue? (y/N): ')
            if go == 'y':
                go = True
            else:
                go = False
        i = i + 1


def playlist(url):
    vids = []
    page = requests.get(url)
    soup = BeautifulSoup(page.content, 'html.parser')
    name = soup.find('h1', {'class': 'playlistTitle'}).contents[0]
    print(f'🔭 Playlist [magenta]{name}[/magenta] is downloading...')
    videos = soup.find_all('a', {'href': True})
    for video in videos:
        vid = video['href']
        code = url.split("/")[-1]
        if 'view_video.php?' in vid and vid.endswith(code):
            vidUrl = f'https://www.pornhub.com{vid}'
            vids.append(vidUrl)
    for v in vids:
        if vids.count(v) > 1:
            vids.remove(v)
        download_video(v, f'/playlists/{name}/%(title)s.%(ext)s')


def model(url):
    name = re.search("model/(.*)/", url).group(1)
    vids = []
    page = requests.get(url).text
    selector = pq(page)
    videos = selector('#profileContent div.videoSection').eq(-1)('div.phimage > a').items()
    for video in videos:
        vid = video.attr('href')
        if 'view_video.php?' in vid:
            vidUrl = f'https://www.pornhub.com{vid}'
            vids.append(vidUrl)
    page_num = selector('#videosTab ul li:nth-last-child(2) > a').text()
    if page_num:
        page_num = int(page_num)
        for i in range(2, page_num + 1):
            page_url = url + f'?page={i}'
            videos = pq(requests.get(page_url).text)('#profileContent div.videoSection').eq(-1)(
                'div.phimage > a').items()
            for video in videos:
                vid = video.attr('href')
                if 'view_video.php?' in vid:
                    vidUrl = f'https://www.pornhub.com{vid}'
                    vids.append(vidUrl)

    uniq_vids = list(set(vids))
    uniq_vids.sort(key=vids.index)
    print(f"🕯️ start download model {name} {len(uniq_vids)} videos")
    download_videos(uniq_vids, f'/model/{name}/%(title)s.%(ext)s')


def pornstar(url):
    page = requests.get(url)
    soup = BeautifulSoup(page.content, 'html.parser')
    finder = soup.find(class_='nameSubscribe')
    name = finder.find(itemprop='name').text.replace('\n', '').strip()
    r.print(f"🔭 [magenta]{name}[/magenta]'s profile is being scraped. Kinda long process. Have a coffe mate")
    urls = []
    for i in range(1, 10):
        Url = f'{url}/videos/upload?page={i}'
        urls.append(Url)
    valid_urls = []
    for u in urls:
        try:
            urllib.request.urlopen(u).getcode()
            valid_urls.append(u)
        except HTTPError:
            urls.remove(u)
    ## begin webscraping
    for vu in valid_urls:
        vids = []
        page = requests.get(vu)
        soup = BeautifulSoup(page.content, 'html.parser')
        videos = soup.find_all('a', {'href': True})
        for video in videos:
            vid = video['href']
            if 'view_video.php?' in vid:
                vidUrl = f'https://www.pornhub.com{vid}'
                vids.append(vidUrl)
        for vi in vids:
            if vids.count(vi) > 1:
                vids.remove(vi)
            new_list = vids[next((i + 2 for i, vi in enumerate(vids) if '&pkey=' in vi), len(vids)):]
        for v in new_list:
            download_video(v, f'/pornstars/{name}/%(title)s.%(ext)s')


def photos(url):
    for n in range(1, 2):
        urls = f'{url}?page={n}'
    for url in urls:
        page = requests.get(url)
        soup = BeautifulSoup(page.content, 'html.parser')
        finder = soup.find(class_='nameSubscribe')
        name = finder.find(itemprop='name').text.replace('\n', '').strip()
        print(f'🔭 Scraping [magenta]{name}[/magenta] albums...')
        albums = soup.find_all('a', {'href': True})
        # get the valid albums links
        album_links = []
        for album in albums:
            album_link_suffix = album['href']
            if 'album' in album_link_suffix:
                album_url = f'https://www.pornhub.com{album_link_suffix}'
                album_links.append(album_url)
            new_list = album_links[
                       next((i + 1 for i, album in enumerate(album_links) if 'albums?search=boobs' in album),
                            len(album_links)):]
        # get the valid images links
        img_links = []
        for al in new_list:
            page = requests.get(al)
            soup = BeautifulSoup(page.content, 'html.parser')
            title = soup.find(class_='photoAlbumTitleV2').contents[0].strip()
            if title == None:
                pass
            print(f"    ➡️ Scanning {name} [magenta]{title}[/magenta] album...")
            images = soup.find_all('a', {'href': True})
            for img in images:
                img_link_suffix = img['href']
                if 'photo/' in img_link_suffix:
                    img_url = f'https://www.pornhub.com{img_link_suffix}'
                    img_links.append(img_url)
        # downlaod images
        for image_link in img_links:
            checker = image_link.rsplit('/', 1)[1]
            page = requests.get(image_link)
            soup = BeautifulSoup(page.content, 'html.parser')
            model_photos = soup.find_all('img', {'src': True})
            for i in model_photos:
                if i.has_attr('alt'):
                    if 'photo' not in i['alt']:
                        if i.has_attr('src'):
                            image = i['src']
                            if checker in image:
                                title = image.rsplit('_', 1)[1]
                                img_data = requests.get(image).content
                                folder_dir = f'{directory}/photos/{name}'
                                if os.path.exists(folder_dir):
                                    pass
                                else:
                                    os.makedirs(folder_dir)
                                try:
                                    with open(f'{folder_dir}/{title}.jpg', 'wb') as handler:
                                        handler.write(img_data)
                                except IsADirectoryError:
                                    pass
    # create pdf with the images                             
    file_names = os.listdir(folder_dir)
    images = [Image.open(f'{folder_dir}/{f}') for f in file_names]
    pdf_path = f"{folder_dir}/{name}.pdf"
    images[0].save(pdf_path, "PDF", resolution=100.0, save_all=True, append_images=images[1:])

    print(f'🧲[green] Scraping {name} albums done. Images and PDF downloaded[/green]')


def textfile(url):
    batchfile = url
    with open(batchfile, 'r') as handler:
        lines = handler.readlines()
        for url_line in lines:
            print(url_line)
            download_video(url_line, '/videos/%(title)s.%(ext)s')


def get_video_title(vide_url: str):
    page = requests.get(vide_url)
    soup = BeautifulSoup(page.content, 'html.parser')
    try:
        vid_title = soup.find('span', {'class': 'inlineFree'}).contents[0]
    except AttributeError:
        vid_title = 'Porhub Video'
    return vid_title


def download_video(vide_url: str, path: str, dir=directory):
    vid_title = get_video_title(vide_url)
    print(f'Video Found:[yellow] {vid_title} [/yellow]')
    ydl_opts = {
        'format': 'best',
        'outtmpl': dir + path,
        'nooverwrites': True,
        'no_warnings': False,
        'ignoreerrors': True,
        'retries': 3
    }

    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        ydl.download([vide_url])

    print(f'🧲[green] {vid_title} has been downloaded[/green]')


def download_videos(vide_urls: [str], path: str, dir=directory):
    ydl_opts = {
        'format': 'best',
        'outtmpl': dir + path,
        'nooverwrites': True,
        'no_warnings': False,
        'ignoreerrors': True,
        'retries': 3,
        'abort-on-unavailable-fragment': True,
        'fragment_retries': 10,
        'skip_unavailable_fragments': False,
        'sleep_interval': 5,
        'max_sleep_interval': 30,
        'external_downloader': 'aria2c',
        'external_downloader_args': '-c -j 3 -x 3 -s 3',
        'hls_prefer_native': True
    }
    size = len(vide_urls)
    for i, url in enumerate(vide_urls):
        print(f'start download {i + 1}/{size} ({url})')
        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])


def start(url):
    if 'playlist' in url:
        playlist(url)
    elif 'photos' in url:
        photos(url)
    elif 'model' in url:
        model(url)
    elif 'pornstar' in url:
        pornstar(url)
    elif '.txt' in url:
        textfile(url)
    else:
        video(url)


if __name__ == '__main__':

    _url = r.input("🔴 Porn-[yellow]Hub[/yellow] Url:\n ")

    print(f"📂 Folder Directory: {directory}")

    # proxy = 'socks5://127.0.0.1:19527'
    # os.environ["http_proxy"] = proxy
    # os.environ["https_proxy"] = proxy

    urls = [ _url ];
    for url in urls:
        print(f"start downloading: {url}")
        start(url)
