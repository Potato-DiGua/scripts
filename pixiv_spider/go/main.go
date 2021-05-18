package main

import (
	"encoding/json"
	"fmt"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"
)
import "github.com/gocolly/colly"
import "awesomeProject/entity"

const (
	MODE_MONTH    = "monthly"
	MODE_WEEK     = "weekly"
	MODE_DAY      = "daily"
	MODE_ROOKIE   = "rookie"
	MODE_ORIGINAL = "original"
	MODE_MALE     = "male"
	MODE_FEMALE   = "female"
	MODE_R18      = "_r18"
)

var mode = MODE_WEEK

const r18 bool = false

const proxy string = "socks5://127.0.0.1:19527"
const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36"
const cookie = ""

// 仅下载插画
const onlyIllust = true
const onlyCover = true

var imgSaveDirPath = "E:/Pictures/p站"

var totalCount = 0
var downloadCount = 0
var existCount = 0

func main() {
	if r18 {
		imgSaveDirPath += "/r18"
		mode += "_r18"
	}

	imgCollector := imgCollector(3)
	rankCollector := rankCollector(imgCollector)
	rankCollector.Wait()
	imgCollector.Wait()
	fmt.Printf("需要下载：%d,已存在：%d,下载成功：%d,下载失败：%d\n", totalCount, existCount, downloadCount, totalCount-downloadCount-existCount)
}

func rankCollector(imgCollector *colly.Collector) *colly.Collector {
	rankCollector := colly.NewCollector(colly.Async(false))

	setProxy(rankCollector)

	regexpComp := regexp.MustCompile("/[0-9]{4}/[0-9]{2}/[0-9]{2}/[0-9]{2}/[0-9]{2}/[0-9]{2}/[0-9]+_p")
	requestIndex := 1
	imgCount := 0

	rankCollector.OnResponse(func(response *colly.Response) {
		fmt.Println(response.Request.Headers)
		rank := entity.Rank{}
		if err := json.Unmarshal(response.Body, &rank); err != nil {
			fmt.Println(string(response.Body))
			fmt.Println(err)
			return
		}
		imgCount += len(rank.Contents)
		if imgCount < rank.RankTotal {
			if err := rankCollector.Visit(createRankURL(requestIndex)); err != nil {
				fmt.Println(err)
			}
		}

		for _, content := range rank.Contents {
			//https://i.pximg.net/img-original/img/2021/01/15/12/40/25/87061329_p0.jpg
			count, err := strconv.Atoi(content.IllustPageCount)
			if err != nil {
				return
			}
			middle := regexpComp.FindString(content.Url)
			if onlyCover {
				count = 1
			}
			for i := 0; i < count; i++ {
				url := "https://i.pximg.net/img-original/img" +
					middle + strconv.Itoa(i) + content.Url[strings.LastIndex(content.Url, "."):]
				//fmt.Println(url)
				_ = imgCollector.Visit(url)
				totalCount++
			}
		}
		//fmt.Println(rank.Contents)
	})

	rankCollector.OnRequest(func(r *colly.Request) {
		r.Headers.Set("user-agent", userAgent)
		r.Headers.Set("Cookie", cookie)
		fmt.Println("Visiting", r.URL)
		requestIndex++
	})
	rankCollector.OnError(func(response *colly.Response, err error) {
		fmt.Printf("%s下载失败，状态码：%d,error:%s\n", response.Request.URL.String(), response.StatusCode, err.Error())
		fmt.Println(string(response.Body))
	})

	if err := rankCollector.Visit(createRankURL(requestIndex)); err != nil {
		fmt.Println(err)
	}
	return rankCollector
}

func createRankURL(i int) string {
	if onlyIllust {
		return "https://www.pixiv.net/ranking.php?content=illust&mode=" + mode + "&p=" + strconv.Itoa(i) + "&format=json" + ""
	} else {
		return "https://www.pixiv.net/ranking.php?mode=" + mode + "&p=" + strconv.Itoa(i) + "&format=json"
	}
}

func setProxy(rankCollector *colly.Collector) {
	if len(proxy) != 0 {
		_ = rankCollector.SetProxy(proxy)
	}

}

func imgCollector(parallelism int) *colly.Collector {
	img := colly.NewCollector(colly.Async(true))
	img.SetRequestTimeout(2 * 60 * time.Second)
	setProxy(img)

	_ = img.Limit(&colly.LimitRule{Parallelism: parallelism, RandomDelay: 5 * time.Second, Delay: 3 * time.Second})

	img.OnRequest(func(request *colly.Request) {
		name := request.URL.Path[strings.LastIndex(request.URL.Path, "/")+1:]
		path := imgSaveDirPath + "/" + name
		if fileExist(path) {
			fmt.Printf("【%s】已存在\n", name)
			existCount++
			request.Abort()
			return
		}

		request.Headers.Set("Referer", "https://www.pixiv.net")
		fmt.Printf("【%s】准备下载\n", request.URL.String())
	})
	img.OnResponse(func(response *colly.Response) {
		// 获取文件名 87061329_p0.jpg
		name := response.Request.URL.Path[strings.LastIndex(response.Request.URL.Path, "/")+1:]

		fmt.Printf("【%s】【大小：%s】开始下载\n", response.Request.URL, formatFileSize(response.Headers.Get("Content-Length")))
		if !fileExist(imgSaveDirPath) {
			if err := os.MkdirAll(imgSaveDirPath, os.ModePerm); err != nil {
				fmt.Println(err)
				return
			}
		}

		path := imgSaveDirPath + "/" + name
		if err := response.Save(path); err == nil {
			fmt.Printf("【%s】下载完成\n", name)
			downloadCount++
		} else {
			fmt.Println(err)
		}

	})
	img.OnError(func(response *colly.Response, err error) {
		url := response.Request.URL.String()
		index := strings.LastIndex(url, ".")
		if index >= 0 && response.StatusCode == 404 && url[index+1:] == "jpg" {
			img.Visit(url[:index] + ".png")
		} else {
			fmt.Printf("%s下载失败，状态码：%d,error:%s\n", response.Request.URL.String(), response.StatusCode, err.Error())
		}

	})
	return img

}

/**
 * 判断文件是否存在
 */
func fileExist(path string) bool {
	if _, err := os.Stat(path); err != nil {
		if os.IsNotExist(err) {
			return false
		}
	}
	return true
}

func formatFileSize(sizeStr string) string {
	size, err := strconv.ParseInt(sizeStr, 10, 64)
	if err != nil {
		return ""
	}
	if size < 1024 {
		return strconv.FormatInt(size, 10) + "B"
	} else if size < 1024*1024 {
		return fmt.Sprintf("%.2fKB", float64(size)/float64(1024))
	} else {
		return fmt.Sprintf("%.2fMB", float64(size)/float64(1024*1024))
	}
}
