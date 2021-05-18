package entity

type Rank struct {
	Mode string `json:"mode" gorm:"column:mode"`
	//Next      int    `json:"next" gorm:"column:next"`
	Date      string `json:"date" gorm:"column:date"`
	RankTotal int    `json:"rank_total" gorm:"column:rank_total"`
	Contents  []struct {
		Date                  string   `json:"date" gorm:"column:date"`
		IllustUploadTimestamp int      `json:"illust_upload_timestamp" gorm:"column:illust_upload_timestamp"`
		Bookmarkable          bool     `json:"bookmarkable" gorm:"column:bookmarkable"`
		UserName              string   `json:"user_name" gorm:"column:user_name"`
		IllustBookStyle       string   `json:"illust_book_style" gorm:"column:illust_book_style"`
		Title                 string   `json:"title" gorm:"column:title"`
		IllustType            string   `json:"illust_type" gorm:"column:illust_type"`
		Url                   string   `json:"url" gorm:"column:url"`
		IllustID              int      `json:"illust_id" gorm:"column:illust_id"`
		Tags                  []string `json:"tags" gorm:"column:tags"`
		IllustPageCount       string   `json:"illust_page_count" gorm:"column:illust_page_count"`
		RatingCount           int      `json:"rating_count" gorm:"column:rating_count"`
		ProfileImg            string   `json:"profile_img" gorm:"column:profile_img"`
		IllustContentType     struct {
			Violent    bool `json:"violent" gorm:"column:violent"`
			Thoughts   bool `json:"thoughts" gorm:"column:thoughts"`
			Lo         bool `json:"lo" gorm:"column:lo"`
			Original   bool `json:"original" gorm:"column:original"`
			Bl         bool `json:"bl" gorm:"column:bl"`
			Yuri       bool `json:"yuri" gorm:"column:yuri"`
			Drug       bool `json:"drug" gorm:"column:drug"`
			Religion   bool `json:"religion" gorm:"column:religion"`
			Antisocial bool `json:"antisocial" gorm:"column:antisocial"`
			Homosexual bool `json:"homosexual" gorm:"column:homosexual"`
			Grotesque  bool `json:"grotesque" gorm:"column:grotesque"`
			Sexual     int  `json:"sexual" gorm:"column:sexual"`
			Furry      bool `json:"furry" gorm:"column:furry"`
		} `json:"illust_content_type" gorm:"column:illust_content_type"`
		YesRank      int  `json:"yes_rank" gorm:"column:yes_rank"`
		UserID       int  `json:"user_id" gorm:"column:user_id"`
		IsBookmarked bool `json:"is_bookmarked" gorm:"column:is_bookmarked"`
		Width        int  `json:"width" gorm:"column:width"`
		Rank         int  `json:"rank" gorm:"column:rank"`
		//IllustSeries bool   `json:"illust_series" gorm:"column:illust_series"`
		Attr      string `json:"attr" gorm:"column:attr"`
		ViewCount int    `json:"view_count" gorm:"column:view_count"`
		Height    int    `json:"height" gorm:"column:height"`
	} `json:"contents" gorm:"column:contents"`
	//Prev     int    `json:"prev" gorm:"column:prev"`
	Page     int    `json:"page" gorm:"column:page"`
	PrevDate string `json:"prev_date" gorm:"column:prev_date"`
	Content  string `json:"content" gorm:"column:content"`
	NextDate bool   `json:"next_date" gorm:"column:next_date"`
}
