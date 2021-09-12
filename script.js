//HTML=DOMの読み込みが終わったらfunction()の中の処理(=なにかしらの処理)を実行する
$(document).ready(function () {
  //??
  var $pagination = $("#pagination"),
    totalRecords = 0,
    records = [],
    recPerPage = 0,
    nextPageToken = "",
    totalPages = 0;
  var API_KEY = "";
  var search = "";
  var duration = "any";
  var order = "relevance";
  var beforedate = new Date().toISOString();
  var afterdate = new Date().toISOString();
  var maxResults = 10;
  var excel_ar = new Array(4);
  for (var x = 0; x < maxResults; x++) {
    excel_ar[x] = new Array(4);
  }
  $("#beforedate").val(beforedate);
  $("#afterdate").val(afterdate);
  //YYYY-MM-DDTHH:mm:ss.sssZ toISOSring https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
  $("#beforedate").change(function () {
    beforedate = new Date(this.val()).toISOString();
    $("#beforedate").val(beforedate);
    afterdate = new Date(this.val()).toISOString();
    $("#afterdate").val(afterdate);
  });

  $("#afterdate").change(function () {
    afterdate = new Date(this.val()).toISOString();
    $("#afterdate").val(afterdate);
    beforedate = new Date(this.val()).toISOString();
    $("#beforedate").val(beforedate);
  });
  //
  $("#duration").change(function () {
    //jQuery値が変更されたときの処理https://www.flatflag.nir87.com/change-1761
    //選択したvalue値を変数に格納
    duration = $(this).children("option:selected").val();
  });
  $("#order").change(function () {
    //値が変更されたときの処理
    //選択したvalue値を変数に格納
    order = $(this).children("option:selected").val();
  });
  //jQuery側でFormの送信（submit）処理をプログラムすることができるメソッド
  $("#myForm").submit(function (e) {
    //submitイベントの本来の動作を止める→結果的にページがリロードされてしまうことをキャンセル
    //https://qiita.com/yokoto/items/27c56ebc4b818167ef9e
    e.preventDefault();
    search = $("#search").val();

    //beforedate = new Date($("#beforedate").val()).toISOString();
    //afterdate = new Date($("#beforedate").val()).toISOString();

    console.log(beforedate);

    API_KEY = "AIzaSyB_eQ10YO1bAjx0AKlazrTStuphTJxWeZs";

    var url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}
          &part=snippet&q=${search}&maxResults=${maxResults}&publishedAfter=${afterdate}&publishedBefore=${beforedate}&order=${order}&videoDuration=${duration}&type=video`;

    $.ajax({
      method: "GET",
      //url:どのサーバーに？
      url: url,
      ///Ajax通信を送信する前に任意の処理を実行
      beforeSend: function () {
        //HTML要素の属性を取得したり設定することができるメソッド
        $("#btn").attr("disabled", true);
        $("#results").empty();
      },
      //通信状態に問題がないかどうか
      success: function (data) {
        console.log(data);
        //jQuery
        $("#btn").attr("disabled", false);
        //結果抽出
        displayVideos(data);
      },
    });
  });

  function apply_pagination() {
    $pagination.twbsPagination({
      totalPages: totalPages,
      visiblePages: 6,
      onPageClick: function (event, page) {
        console.log(event);
        displayRecordsIndex = Math.max(page - 1, 0) * recPerPage;
        endRec = displayRecordsIndex + recPerPage;
        console.log(displayRecordsIndex + "ssssssssss" + endRec);
        displayRecords = records.slice(displayRecordsIndex, endRec);
        generateRecords(recPerPage, nextPageToken);
      },
    });
  }

  $("#search").change(function () {
    search = $("#search").val();
  });

  function generateRecords(recPerPage, nextPageToken) {
    var url2 = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}
      &part=snippet&q=${search}&maxResults=${maxResults}&pageToken=${nextPageToken}&publishedBefore=${beforedate}&publishedAfter=${afterdate}&order=${order}&videoDuration=${duration}&type=video`;

    $.ajax({
      method: "GET",
      url: url2,
      beforeSend: function () {
        $("#btn").attr("disabled", true);
        $("#results").empty();
      },
      success: function (data) {
        console.log(data);
        $("#btn").attr("disabled", false);
        displayVideos(data);
      },
    });
  }

  function displayVideos(data) {
    /*
      kind／ APIの種類
etag／ タグ情報
nextPageToken／ 次のページに関する情報
regionCode／ エリアコード
pageInfo／ APIリクエスト結果の概要
items／ 検索結果の詳細リスト
      */
    recPerPage = data.pageInfo.resultsPerPage;
    nextPageToken = data.nextPageToken;
    console.log(records);
    totalRecords = data.pageInfo.totalResults;
    totalPages = Math.ceil(totalRecords / recPerPage);
    apply_pagination();
    $("#search").val("");

    var videoData = "";

    $("#table").show();

    var i = 0;
    data.items.forEach((item) => {
      excel_ar[1][i] = `${item.snippet.title}`;
      excel_ar[2][i] = `${item.snippet.thumbnails.high.url}`;
      excel_ar[3][i] = `${item.snippet.channelTitle}`;
      excel_ar[4][i] = `${item.snippet.publishTime}`;
      i++;
      videoData = `
                      
                      <tr>
                      <td>
                      <a target="_blank" href="https://www.youtube.com/watch?v=${item.id.videoId}">
                      ${item.snippet.title}</td>
                      <td>
                      <img width="200" height="200" src="${item.snippet.thumbnails.high.url}"/>
                      </td>
                      <td>
                      <a target="_blank" href="https://www.youtube.com/channel/${item.snippet.channelId}">${item.snippet.channelTitle}</a>
                      </td>
                      <td>
                      <a target="_blank" ">${item.snippet.publishTime}</a>
                      </td>
                      </tr>
                      `;
      $("#results").append(videoData);
    });
    func1(excel_ar);
  }
});

// SheetをWorkbookに追加する
// 参照：https://github.com/SheetJS/js-xlsx/issues/163
function sheet_to_workbook(sheet /*:Worksheet*/, opts) /*:Workbook*/ {
  var n = opts && opts.sheet ? opts.sheet : "Sheet1";
  var sheets = {};
  sheets[n] = sheet;
  return { SheetNames: [n], Sheets: sheets };
}

// ArrayをWorkbookに変換する
// 参照：https://github.com/SheetJS/js-xlsx/issues/163
function aoa_to_workbook(data /*:Array<Array<any> >*/, opts) /*:Workbook*/ {
  return sheet_to_workbook(XLSX.utils.aoa_to_sheet(data, opts), opts);
}

// stringをArrayBufferに変換する
// 参照：https://stackoverflow.com/questions/34993292/how-to-save-xlsx-data-to-file-as-a-blob
function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}

function func1(Date) {
  // 書き込み時のオプションは以下を参照
  // https://github.com/SheetJS/js-xlsx/blob/master/README.md#writing-options
  var write_opts = {
    type: "binary",
  };

  // ArrayをWorkbookに変換する
  var wb = aoa_to_workbook(Date);
  var wb_out = XLSX.write(wb, write_opts);

  // WorkbookからBlobオブジェクトを生成
  // 参照：https://developer.mozilla.org/ja/docs/Web/API/Blob
  var blob = new Blob([s2ab(wb_out)], { type: "application/octet-stream" });

  // FileSaverのsaveAs関数で、xlsxファイルとしてダウンロード
  // 参照：https://github.com/eligrey/FileSaver.js/
  saveAs(blob, "myExcelFile.xlsx");
}
