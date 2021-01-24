"use strict";
// モジュール呼び出し
const crypto = require("crypto");
const line = require("@line/bot-sdk");

// インスタンス生成
const client = new line.Client({ channelAccessToken: process.env.ACCESSTOKEN });

exports.handler = (event) => {
  const signature = crypto
    .createHmac("sha256", process.env.CHANNELSECRET)
    .update(event.body)
    .digest("base64");
  const checkHeader = (event.headers || {})["X-Line-Signature"];
  const body = JSON.parse(event.body);
  const events = body.events;
  console.log(events);

  // 署名検証が成功した場合
  if (signature === checkHeader) {
    events.forEach(async (event) => {
      let message;
      switch (event.type) {
        case "message":
          message = await messageFunc(event);
          break;
        case "follow":
          message = {
            type: "text",
            text:
              "秒数をトークに投げるとその期間たったあとに応答するよ。リプライトークンの期限がいつまでなのか調べるよ。1-100に対応しているよ。",
          };
          break;
      }
      // メッセージを返信
      if (message != undefined) {
        await sendFunc(body.events[0].replyToken, message);
        // .then(console.log)
        // .catch(console.log);
        return;
      }
    });
  }
  // 署名検証に失敗した場合
  else {
    console.log("署名認証エラー");
  }
};

async function sendFunc(replyToken, mes) {
  const result = new Promise(function (resolve, reject) {
    client.replyMessage(replyToken, mes).then((response) => {
      resolve("送信完了");
    });
  });
  return result;
}

async function messageFunc(event) {
  const user_message = event.message.text;
  const target_number = Number(user_message);
  let message = "";
  //数値に変換できた場合
  if (target_number !== NaN) {
    if (target_number > 100) {
      //100秒よりも大きい数字だった場合

      message = { type: "text" };
    } else {
      //その時間待って応答する
    }
  } else {
    //数値じゃなかった場合
    message = {
      type: "text",
      text: "数値じゃないみたいだね。1-100までの数値を送信してくれるといいよ。",
    };
  }

  message = { type: "text", text: `メッセージイベント` };
  return message;
}
