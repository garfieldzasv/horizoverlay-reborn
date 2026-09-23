# Horizoverlay Reborn

[English](README.md) · [简体中文](README_zhCN.md) · 正體中文 · [Português](README_ptBR.md) · [Français](README_frFR.md)

FF14 的 ACT 橫向懸浮窗，一排卡片顯示全隊的 DPS 和 HPS。基於 [Horizoverlay](https://github.com/bsides/horizoverlay) 重做。

![](screenshots/zhHK/overlay-byrole.png)

## 安裝

1. 在 OverlayPlugin 裡新建一個 MiniParse 類型的懸浮窗
2. URL 填：

   ```
   https://garfieldzasv.github.io/horizoverlay-reborn/
   ```

3. 關掉這個懸浮窗的「滑鼠穿透 / Enable clickthru」，不然右鍵呼不出設定
4. 在懸浮窗上按右鍵，打開設定頁

不想依賴網路的話，到 [Releases](https://github.com/garfieldzasv/horizoverlay-reborn/releases) 下載 zip 解壓縮。較新的 OverlayPlugin（整合包裡一般都是）在 URL 輸入框旁邊有個 `...` 按鈕，點它直接選取解壓出來的 `index.html` 即可，不用自己拼路徑。舊版本則手動填 `index.html` 的完整 `file://` 位址。本機和線上是同一份產物，不過線上那份設定儲存得更可靠，因為瀏覽器會擋掉 `file://` 下的 `localStorage`。

視窗寬度：一行放下 4 個人需要 759px，6 個人 1138px，8 個人 1517px，12 個人 2276px，24 個人 4551px。放不下會自動折行。

也支援 ACTWebSocket，URL 後面加 `?HOST_PORT=ws://127.0.0.1:10501/`。這種用法請用本機那份，https 頁面不一定允許連明文 `ws://`。

## 功能

右鍵打開設定頁，所有改動即時生效並自動儲存。

<img src="screenshots/zhHK/config.png" width="420">

* 五種介面語言：英語、葡萄牙語、簡體中文、正體中文、法語
* 三套顏色主題：職業特有、黑白色調、細分職業
* 卡片右半格是 DPS，左半格可切換 HPS、暴擊率、直擊率、直暴率或職業縮寫
* DPS 和 HPS 兩條佔比橫條
* 排名序號、職業圖示、最強一擊、高亮色塊，各自可開關
* 總覽橫幅顯示戰鬥時間和總 DPS，也可以顯示極限技造成的傷害
* 顯示人數 1 到 24，可選是否顯示陸行鳥、召喚獸等無職業單位
* 自己的卡片固定為白色；也可以只顯示自己，或者模糊掉別人的名字
* 整體縮放 0.5 到 2 倍
* 配置模式，用模擬數據預覽，沒開打也能調
* Discord Webhook，一鍵把戰績發到頻道，可選擇把角色名換成 Player 1、2、3 再發

細分職業主題，五職能各一色：

![](screenshots/zhHK/overlay-byjob.png)

黑白色調：

![](screenshots/zhHK/overlay-blackwhite.png)

配置模式：

![](screenshots/zhHK/setup-mode.png)

## 和原版的區別

* 內建等寬中日文字型，DPS 刷新時數字不再左右抖
* 卡片按 6 位數預留寬度
* 放不下會折行，不會靜默裁掉卡片
* 去掉傷害佔比的百分比數字，改成第二條橫條顯示 HPS 佔比
* 左半格可切換，原版只有 HPS 一項
* 卡片、橫幅和佔比條自動斜邊對齊
* 多一套細分職業主題，把輸出拆成近戰、遠敏、法系
* 職業圖示補到 59 個，含 7.56 的馴獸師 <img src="screenshots/bst-icon.png" width="18">
* 寵物改用召喚獸圖示和中性灰，原版顯示成斷網圖示加純黑
* 設定頁重做
* 不請求任何第三方位址，也沒有統計程式碼，字型和圖示全部內建（原版的線上頁內嵌了 Google Analytics）

原版用比例字型，卡片也窄：

![](screenshots/upstream-1300px.png)

現在六位數也放得下：

![](screenshots/zhHK/overlay-6digit.png)

同樣 900px 寬、同樣 8 個人，原版把首尾兩張卡裁掉了：

![](screenshots/upstream-900px-clipped.png)

現在折成兩行：

![](screenshots/zhHK/wrap-900px.png)

## 常見問題

**右鍵沒反應。** 確認「滑鼠穿透 / Enable clickthru」是關閉的。也可以在 URL 末尾加 `#/config` 直接打開設定頁。

**設定改了但重啟就丟。** `localStorage` 在 `file://` 下被擋了。改用線上位址，或者用本機 HTTP 服務指向解壓出來的目錄。

**某個百分比全是 0%。** 你這個版本的 ACT 沒提供那個欄位，換一項。

**職業圖示變成寶石獸。** 那個單位沒匹配上已知的寵物名，不影響使用。

其他問題和建議請 [開 issue](https://github.com/garfieldzasv/horizoverlay-reborn/issues)。

## 建置

需要 Node.js。

```bash
npm install
npm run build
```

開發用 `npm start`，URL 加 `?mock=1#/` 可以灌模擬數據。改主題、幾何和字級的做法見 [DEVLOG.md](DEVLOG.md)。

## 授權與來源

衍生自 [bsides/horizoverlay](https://github.com/bsides/horizoverlay)，Copyright 2017 Rafael "BSIDES" Pereira，Apache-2.0，本專案沿用同一授權。改動清單見 [NOTICE](NOTICE)。

內建的 Maple Mono CN 來自 [subframe7536/maple-font](https://github.com/subframe7536/maple-font)，SIL Open Font License 1.1，只重新打包為 woff2，字型本身未作改動。

職業圖示取自 FINAL FANTASY XIV。FINAL FANTASY 是 Square Enix Holdings Co., Ltd. 的註冊商標，本專案與 Square Enix 無關聯，也未獲其背書。
