$(document).ready(function() {
    //兩頁共用
    //取得全部作品列表
    getWorkListAndPagination();

    //關鍵字搜尋註冊事件(點enter、改變值時搜尋)
    $("#searchInput").on("keydown", function(event) {
        if(event.key === "Enter") {
            getWorkListAndPagination();
        }
    }).change(getWorkListAndPagination);

    //篩選按鈕註冊事件(顯示or隱藏篩選條件)
    $(".filterBtn").click(function() {
        showOrCloseFilter(this);
    });

    //篩選條件註冊事件(篩選結果、類型、排序方式)
    $("#filter").find(".filterCondition").click(function() {
        handleFilter(this);
    });
    $("#aiTypeModel").find(".filterCondition").click(function() {
        handleAiTypeModel(this);
    });
    $("#sort").find(".filterCondition").click(function() {
        handleSort(this);
    });

	//螢幕寬度改變時，重新將篩選結果更新到按鈕上(因為不同寬度寫法不同)
	$(window).resize(changeFilterResult);

	let htmlFrom = $.trim($("#htmlFrom").val());
    //index.html
    if(htmlFrom === "index") {
        //處理partner的輪播
        partnerSlick();

        //處理feedback的輪播
        feedbackSlick();
    }

	//price.html
	if(htmlFrom === "price") {
		$(".commonQA").click(function() {
			showOrCloseAnswer(this);
		});
	}
});

/**
 * 處理partner的輪播
 */
function partnerSlick() {
    //由左至右輪播
    let slickSetting = {
        arrows: false,
        dots: false,
        draggable: false,
        autoplay: true,
        autoplaySpeed: 0,
        speed: 2000,
        slidesToShow: 5,
        slidesToScroll: 1,
        cssEase: "linear",
        centerMode: true,
        responsive: [
            {
                breakpoint: 920,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 500,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };
    //由右至左輪播
    let newSlickSetting = {...slickSetting};
    newSlickSetting.rtl = true;

    $(".partnerList").eq(0).slick(slickSetting);
    $(".partnerList").eq(1).slick(newSlickSetting);
}

/**
 * 處理feedback的輪播
 */
function feedbackSlick() {
    $("#feedbackList").slick({
        arrows: false,
        dots: false,
        slidesToShow: 3,
        slidesToScroll: 3,
        responsive: [
            {
                breakpoint: 920,
                settings: {
                    dots: true,
                    speed: 500,
                    slidesToShow: 2,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 500,
                settings: {
                    dots: true,
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });
}

/**
 * 取得作品列表和分頁
 * @param {boolean?} isChangePage 是否換頁
 */
function getWorkListAndPagination(isChangePage) {
    let url = "https://2023-engineer-camp.zeabur.app/api/v1/works";
    //處理參數(關鍵字搜尋、類型、排序方式、第幾頁)
    let search = $.trim($("#searchInput").val());
    let type = $.trim($("#aiTypeModel").find(".aiTypeSelected").data("type"));
    let sort = $.trim($("#sort").find(".sortSelected").data("sort"));
    let page = isChangePage ? $.trim($("#pagination").find(".pageSelected").text()) : "";
    let paramArray = [];
    if(search) {
        paramArray.push("search="+search);
    }
    if(type) {
        paramArray.push("type="+type);
    }
    if(sort) {
        paramArray.push("sort="+sort);
    }
    if(page) {
        paramArray.push("page="+page);
    }
    if(paramArray.length > 0) {
        url += "?"+paramArray.join("&");
        paramArray.length = 0;
    }

    //取得作品列表和分頁資訊並放到畫面
    axios.get(url).then((response) => {
        putWorkList(response.data.ai_works.data);
        putPagination(response.data.ai_works.page);
    });
}

/**
 * 將作品列表放到畫面
 * @param {object} workArray 作品列表
 */
function putWorkList(workArray) {
    let works = "";
    //有作品列表
    if(typeof workArray !== "undefined" && workArray != null && workArray.length > 0) {
        workArray.forEach((work) => {
            works += "<li class='work'>"+
                        "<div class='workImg' onclick='window.open(\""+work.link+"\")'>"+
                            "<img src='"+work.imageUrl+"'alt='aiImage' title='"+work.title+"'>"+
                        "</div>"+
                        "<div class='workInfo'>"+
                            "<h4 class='workTitle subColor'>"+work.title+"</h4>"+
                            "<p class='workDescription subColor'>"+work.description+"</p>"+
                        "</div>"+
                        "<div class='workInfo flex-row x-between'>"+
                            "<h6 class='workSubTitle subColor'>AI 模型</h4>"+
                            "<p class='workModel subColor'>"+work.model+"</p>"+
                        "</div>"+
                        "<div class='workInfo flex-row x-between'>"+
                            "<span class='workType subColor'>#"+work.type+"</span>"+
                            "<a href='"+work.link+"' target='_blank'>"+
                                "<img src='images/share.png' alt='分享' title='分享'>"+
                            "</a>"+
                        "</div>"+
                    "</li>";
        });
    //無作品列表
    }else {
        works = "<li class='noData'>查無資料</li>";
    }
    $("#workList").html(works);
}

/**
 * 將分頁資訊放到畫面
 * @param {object} pagesData 分頁資訊
 */
function putPagination(pagesData) {
    let pages = "";
    if(pagesData.total_pages > 0) {
        //上一頁
        if(pagesData.has_pre) {
            pages +=  "<li class='prevPage' title='上一頁' onclick='changePage(this)'>&lt;</li>";
        }

        //頁數
        for(let i = 1; i <= pagesData.total_pages; i++) {
            pages += "<li class='";
            //目前為第幾頁
            if(i == pagesData.current_page) {
                pages += "pageSelected ";
            }
            pages += "page' title='第 "+i+" 頁' onclick='changePage(this)'>"+i+"</li>"
        };

        //下一頁
        if(pagesData.has_next) {
            pages +=  "<li class='nextPage' title='下一頁' onclick='changePage(this)'>&gt;</li>";
        }
    }
    $("#pagination").html(pages);
}

/**
 * 開啟選單
 */
function showMenuContent() {
    //顯示選單內容、調整footerInfo's margin-top
    $(".menuContent").slideDown(function() {
        let marginTop = $(".navbar").innerHeight()+$(".menuContent").innerHeight();
        $(".footerInfo").css("margin-top", marginTop);
    });

    //只留footer其他隱藏
    $(".container, .aiToolContainer, .footerheader, .backToTopModel").hide();

    //menuIcon換成closeIcon
    $(".menu").hide();
    $(".close").fadeIn();
}

/**
 * 關閉選單
 */
function hideMenuContent() {
    //隱藏選單內容、調回footerInfo's margin-top
    $(".menuContent").slideUp(function() {
        $(".footerInfo").css("margin-top", 0);
    });

    //調回隱藏的物件
    $(".container, .aiToolContainer, .footerheader, .backToTopModel").show();

    //closeIcon換成menuIcon
    $(".close").hide();
    $(".menu").fadeIn();
}

/**
 * 顯示or隱藏篩選條件
 * @param {object?} filterBtnObj 篩選按鈕物件
 * @param {boolean?} isCloseAll 是否隱藏全部篩選條件
 */
function showOrCloseFilter(filterBtnObj, isCloseAll) {
    //先暫存目前有顯示的篩選條件，最後要隱藏
    let $currShowingResult = $(".filterResult.showingResult");
    let speed = 300;
    //隱藏全部篩選條件不用判斷是否顯示篩選條件
    if(!isCloseAll) {
        let $filterResult = $(filterBtnObj).parent().find(".filterResult");
        if(!$filterResult.hasClass("showingResult")) {
            $filterResult.slideDown(speed).addClass("showingResult");
        }
    }
    $currShowingResult.slideUp(speed).removeClass("showingResult");
}

/**
 * 處理篩選結果
 * @param {object} newFilter 新的篩選結果物件
 */
function handleFilter(newFilter) {
    let isQuery = false;

    let $newFilter = $(newFilter);
    let $currFilter = $newFilter.siblings(".filterSelected");
    let newFilterValue = $newFilter.text();
    //點選不同篩選結果才查詢
    if(newFilterValue !== $currFilter.text()) {
        isQuery = true;

        //把class、check轉移到新的篩選結果物件上
        $currFilter.removeClass("filterSelected").find(".check").remove();
        $newFilter.addClass("filterSelected");
        if(!$newFilter.hasClass("filterAll")) {//所有模型、所有類型的不用勾選
            $newFilter.append("<img class='check' src='images/check.png' alt='check'>");
        }

        //將篩選結果更新到按鈕上
        changeFilterResult();

        //若是改變類型，還要改變按鈕式類型中的類型
        if($newFilter.hasClass("filterType")) {
            let newAiTypeValue = $newFilter.data("type");
            $("#aiTypeModel").children().removeClass("aiTypeSelected");
            $("#aiTypeModel").find(".aiType[data-type='"+newAiTypeValue+"']").addClass("aiTypeSelected");
        }
    }

    if(isQuery) {
        getWorkListAndPagination();
    }
    //隱藏全部篩選條件
    showOrCloseFilter(null, true);
}

/**
 * 將篩選結果更新到按鈕上
 */
function changeFilterResult() {
    if(window.innerWidth >= 500) {
		$("#filter").find(".numberHint").text("").hide();
        $("#filter").find(".slidersHorizontalIcon").show();

        let filterResultArray = [];
        //所有模型、所有類型不用寫
        $("#filter").find(".filterSelected").not(".filterAll").each(function() {
            filterResultArray.push($(this).text());
        })
        //有篩選條件
        if(filterResultArray.length > 0) {
            $("#filter").find(".filterBtnText").text(filterResultArray.join("、"));
            filterResultArray.length = 0;
        //無篩選條件
        }else {
            $("#filter").find(".filterBtnText").text("篩選");
        }
    }else {
		$("#filter").find(".filterBtnText").text("篩選");

        //所有模型、所有類型不用計算
        let selectedQuantity = $("#filter").find(".filterSelected").not(".filterAll").length;
        //有篩選條件
        if(selectedQuantity > 0) {
            $("#filter").find(".numberHint").text(selectedQuantity).fadeIn();
            $("#filter").find(".slidersHorizontalIcon").hide();
        //無篩選條件
        }else {
            $("#filter").find(".numberHint").text("").hide();
            $("#filter").find(".slidersHorizontalIcon").fadeIn();
        }
    }
}

/**
 * 處理按鈕式類型
 * @param {object} newAiType 新的按鈕式類型物件
 */
function handleAiTypeModel(newAiType) {
    let isQuery = false;

    let $newAiType = $(newAiType);
    let $currAiType = $newAiType.siblings(".aiTypeSelected");
    let newAiTypeValue = $newAiType.data("type");
    //點選不同類型才查詢
    if(newAiTypeValue !== $currAiType.data("type")) {
        isQuery = true;

        //把class轉移到新的按鈕式物件上
        $currAiType.removeClass("aiTypeSelected");
        $newAiType.addClass("aiTypeSelected");

        //改變篩選結果中的類型
        $("#filter").find(".filterType").removeClass("filterSelected").find(".check").remove();
        if(newAiTypeValue) {//所有類型的不用勾選
            $("#filter").find(".filterType[data-type='"+newAiTypeValue+"']").addClass("filterSelected").append(
                "<img class='check' src='images/check.png' alt='check'>"
            );
        }else {
            $("#filter").find(".filterAll").addClass("filterSelected");
        }

        //將篩選結果更新到按鈕上
        changeFilterResult();
    }

    if(isQuery) {
        getWorkListAndPagination();
    }
    //隱藏全部篩選條件
    showOrCloseFilter(null, true);
}

/**
 * 處理排序方式
 * @param {object} newSort 新的排序方式物件
 */
function handleSort(newSort) {
    let isQuery = false;

    let $newSort = $(newSort);
    let $currSort = $newSort.siblings(".sortSelected");
    //點選不同排序方式才查詢
    if($newSort.data("sort") !== $currSort.data("sort")) {
        isQuery = true;

        //把class轉移到新的排序方式物件上
        $currSort.removeClass("sortSelected");
        $newSort.addClass("sortSelected");

        //將排序方式更新到按鈕上
        $("#sort").find(".filterBtnText").text($newSort.text());
    }

    if(isQuery) {
        getWorkListAndPagination();
    }
    //隱藏全部篩選條件
    showOrCloseFilter(null, true);
}

/**
 * 換頁
 * @param {object} pageObj 要換的頁數物件
 */
function changePage(pageObj) {
    //目前的頁數物件
    let $pageSelected = $("#pagination").find(".pageSelected");
    //要換的頁數物件
    let $pageObj = $(pageObj);
    if($pageObj.hasClass("prevPage")) {
        $pageObj = $pageSelected.prev();
    }else if($pageObj.hasClass("nextPage")) {
        $pageObj = $pageSelected.next();
    }

    //點選不同頁數才換頁
    if($pageSelected.text() !== $pageObj.text()) {
        //把class轉移到要換的頁數物件上
        $pageSelected.removeClass("pageSelected");
        $pageObj.addClass("pageSelected");
        getWorkListAndPagination(true);
    }

}

/**
 * 返回最上面
 */
function backToTop() {
    $("html, body").scrollTop(0, 2000);
}

/**
 * 顯示or隱藏常見問題的答案
 * @param {object} commonQAObj 要顯示or隱藏的常見問題物件
 */
function showOrCloseAnswer(commonQAObj) {
	let $commonQAObj = $(commonQAObj);
	let $currcommonQA = $("#commonQAList").find(".commonQASelected");
	let speed = window.innerWidth >= 500 ? 300 : 400;

	//若點選的還沒點選，點選的向下、加號換成減號、調整邊框顏色
	if(!$commonQAObj.hasClass("commonQASelected")) {
		$commonQAObj.find(".answer").slideDown(speed);
		$commonQAObj.find(".add").hide();
		$commonQAObj.find(".remove").fadeIn();
		$commonQAObj.addClass("commonQASelected");
	}

	//目前點選的向上、減號換回加號、調回邊框顏色
	$currcommonQA.find(".answer").slideUp(speed);
	$currcommonQA.find(".add").fadeIn();
	$currcommonQA.find(".remove").hide();
	$currcommonQA.removeClass("commonQASelected");
}