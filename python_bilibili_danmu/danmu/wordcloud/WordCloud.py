import json

import jieba
from typing import Dict

from wordcloud import WordCloud

if __name__ == '__main__':
    d: Dict[str, float] = {}
    path = "../../无职转生～到了异世界就拿出真本事～：第2话_番剧_bilibili_哔哩哔哩.json"

    with open(path, "r", encoding="utf-8") as f:
        dm = json.loads(f.read())
        f.close()

    for item in dm:
        text = item['content']
        for word in jieba.cut(text, use_paddle=True):
            if len(word) <= 1:
                continue
            d[word] = d.get(word, 0) + 1

    print(d)
    wc = WordCloud(font_path="../../华康少女文字W5.TTF", background_color='white', width=1280, height=720)
    wc.generate_from_frequencies(d)
    wc.to_file("词云3.png")
