// enUS is the source of truth: the original overlay was written in English and
// every other block here is a translation of it, so a new string goes in enUS
// first. Keys are never renamed -- the numbering is historical and gappy, and
// renumbering would silently blank a label in the four locales that lag behind.
//
// ACT's own UI is English-only, so option names the user has to go and find in
// ACT ("Enable clickthru") stay in English inside every translation. Job and
// stat names follow each language's official FFXIV client where one exists;
// there is no Portuguese client, so pt-BR keeps the English terms its players
// actually use ("job", "DPS").

const locale = {
  enUS: {
    initial: {
      help:
        'Right click here to show Settings. Be sure "Enable clickthru" in ACT is off.',
    },
    config: {
      setupTitle: 'Setup Mode',
      backTitle: 'Back to overlay',
      nameHelp:
        'Your name in the combatant list:',
      themeTitle: 'Color Theme',
      themeOption1: 'Color By Role',
      themeOption2: 'Black & White',
      themeOption3: 'Color By Role (detailed)',
      sectionCard: 'Combatant card',
      sectionBanner: 'Encounter bar',
      sectionRoster: 'Who is listed',
      sectionSelf: 'You & streaming',
      toggleOption1: 'Rank #',
      toggleOption2: 'Job Icon',
      toggleOption3: 'HPS',
      leftStatTitle: 'Left column',
      leftStatCrit: 'Crit rate',
      leftStatDhit: 'DH rate',
      leftStatCdh: 'CDH rate',
      leftStatJob: 'Job',
      toggleOption4: 'Highlight',
      toggleOption5: 'Highlight yourself',
      toggleOption6: 'Duration',
      toggleOption7: 'Total DPS',
      toggleOption8: 'HPS Bar',
      toggleOption15: 'DPS Bar',
      toggleOption16: 'Crit / DH / CDH',
      toggleOption17: 'Death marker',
      toggleOption18: 'Limit break damage',
      toggleOption11: 'Max Hit',
      toggleOption12: 'Show "jobless" Combatants',
      toggleOption13: 'Enable streamer mode (blur all names)',
      toggleOption14: 'Only show your DPS',
      maxCombatantsTitle: 'Max Combatants',
      zoomTitle: 'Zoom Scale',
      resetTitle: 'Reset',
      discordTitle: 'Discord Webhook URL',
      discordToggle: 'Show send button',
      discordAnonymous: 'Send names as Player 1, 2, 3',
      discordHelp: 'Get this from your Discord channel',
      // Hover text for the handful of options whose name does not say enough on
      // its own. Each describes what the switch actually does; a line that only
      // restates the label is worse than none, because it costs a hover to find
      // that out. hintAnonymous also names what has to be set first, which is
      // the other thing this page keeps out of sight.
      hintHighlight:
        'Shades the two number cells, one side darker than the other, so the eye lands on the one that matters for that job. Healers get it the other way round.',
      hintJobless:
        'Lists chocobos, egis, turrets and anything else ACT reports without a job. Off by default because they take up card slots.',
      hintSolo:
        'Hides everyone else and leaves only your own card. Needs the character name above to be right, or it cannot tell which card is yours.',
      hintStreamer:
        'Blurs everyone else\'s name into a shadow; yours stays readable. For streaming, where party names would otherwise be on screen.',
      hintAnonymous:
        'Replaces every name in the report with Player 1, 2, 3 -- numbered by finishing position, not by who they are. Needs a webhook address above.',
      hintCharacterName:
        'How the overlay picks your card out of the list. ACT usually reports you as YOU, and then whatever you put here is what your card shows. If ACT reports your real character name instead, this has to match it exactly, or the overlay cannot tell which card is yours.',
      localeTitle: 'Language',
      help:
        'Everything saves automatically.<br /><strong>Right click</strong> to open this window',
    },
    setupMode: {
      sampleZone: 'Dummy',
      instructionsTitle:
        '<strong>Right click anywhere this window to open settings!</strong>',
      instructions:
        'This is NOT real data, this is just a mock so you can place and setup this overlay the way you want. Go hit a dummy or engage in real combat to get real data here. <br />Also, please resize this window to something like the width of the settings window.',
    },
  },
  jaJP: {
    initial: {
      help:
        'ここを右クリックすると設定が開きます。ACTの "Enable clickthru" がオフになっていることを確認してください。',
    },
    config: {
      setupTitle: '設定モード',
      backTitle: 'オーバーレイに戻る',
      nameHelp:
        'メンバー一覧での自分の名前：',
      themeTitle: 'カラーテーマ',
      themeOption1: 'ロール別',
      themeOption2: 'モノクロ',
      themeOption3: 'ロール別（詳細）',
      sectionCard: 'メンバーカード',
      sectionBanner: '戦闘情報バー',
      sectionRoster: '表示するメンバー',
      sectionSelf: '自分と配信',
      toggleOption1: '順位',
      toggleOption2: 'ジョブアイコン',
      toggleOption3: 'HPS',
      leftStatTitle: '左側の表示',
      leftStatCrit: 'クリティカル率',
      leftStatDhit: 'ダイレクトヒット率',
      leftStatCdh: 'クリダイ率',
      leftStatJob: 'ジョブ',
      toggleOption4: 'ハイライト',
      toggleOption5: '自分をハイライト',
      toggleOption6: '戦闘時間',
      toggleOption7: '合計DPS',
      toggleOption8: 'HPSバー',
      toggleOption15: 'DPSバー',
      toggleOption16: 'クリティカル / DH / クリダイ',
      toggleOption17: '戦闘不能マーク',
      toggleOption18: 'リミットブレイクのダメージ',
      toggleOption11: '最大ダメージ',
      toggleOption12: 'ジョブなしのメンバーを表示',
      toggleOption13: '配信者モード（他人の名前をぼかす）',
      toggleOption14: '自分のDPSのみ表示',
      maxCombatantsTitle: '最大表示人数',
      zoomTitle: '表示倍率',
      resetTitle: 'リセット',
      discordTitle: 'Discord Webhook URL',
      discordToggle: '送信ボタンを表示',
      discordAnonymous: '名前を Player 1, 2, 3 に置き換えて送信',
      discordHelp: 'Discordのチャンネル設定から取得できます',
      // Hover text for the handful of options whose name does not say enough on
      // its own. Each describes what the switch actually does; a line that only
      // restates the label is worse than none, because it costs a hover to find
      // that out. hintAnonymous also names what has to be set first, which is
      // the other thing this page keeps out of sight.
      hintHighlight:
        'DPS と HPS の 2 マスに濃淡をつけ、そのジョブで見るべき方へ視線が向くようにします。ヒーラーは左右が逆になります。',
      hintJobless:
        'チョコボ、エギ、タレットなど、ACT がジョブなしで報告するメンバーも表示します。カードの枠を使うため既定ではオフです。',
      hintSolo:
        '自分のカードだけを残し、他のメンバーを隠します。上のキャラクター名が正しくないと、どれが自分のカードか判別できません。',
      hintStreamer:
        '他人の名前を影のようにぼかします。自分の名前はそのままです。配信でパーティメンバーの名前を映したくないとき用。',
      hintAnonymous:
        'レポート内の名前をすべて Player 1, 2, 3 に置き換えます。順位による番号で、個人とは結び付きません。上の Webhook URL が必要です。',
      hintCharacterName:
        'オーバーレイが一覧の中から自分のカードを見分けるために使います。ACT は通常こちらを YOU として報告するので、その場合はここに入れた名前がそのままカードに表示されます。ACT が本当のキャラクター名を報告する設定の場合は、完全に一致させないと自分のカードを判別できません。',
      localeTitle: '言語',
      help:
        '変更は自動的に保存されます。<br /><strong>右クリック</strong>でこのウィンドウが開きます',
    },
    setupMode: {
      sampleZone: '木人',
      instructionsTitle:
        '<strong>このウィンドウ内を右クリックすると設定が開きます！</strong>',
      instructions:
        'これは実際の計測結果ではなく、オーバーレイの位置や表示内容を調整するためのサンプルです。実際のデータを表示するには、木人を殴るか戦闘に参加してください。<br />また、このウィンドウの幅は設定ウィンドウと同じくらいに調整することをおすすめします。',
    },
  },
  ptBR: {
    initial: {
      help:
        'Clique com o botão direito para configurar. Certifique-se que "Enable clickthru" no ACT está desligado.',
    },
    config: {
      setupTitle: 'Modo Config',
      backTitle: 'Voltar ao overlay',
      nameHelp:
        'Seu nome na lista de combatentes:',
      themeTitle: 'Cor do Tema',
      themeOption1: 'Cor por função',
      themeOption2: 'Preto & Branco',
      themeOption3: 'Cor por função (detalhado)',
      sectionCard: 'Cartão do combatente',
      sectionBanner: 'Barra do combate',
      sectionRoster: 'Quem aparece',
      sectionSelf: 'Você e streaming',
      toggleOption1: 'Ordem #',
      toggleOption2: 'Ícone',
      toggleOption3: 'HPS',
      leftStatTitle: 'Coluna esquerda',
      leftStatCrit: 'Taxa de crit',
      leftStatDhit: 'Taxa de DH',
      leftStatCdh: 'Taxa de CDH',
      leftStatJob: 'Job',
      toggleOption4: 'Destaque',
      toggleOption5: 'Destacar você',
      toggleOption6: 'Duração',
      toggleOption7: 'DPS Total',
      toggleOption8: 'Barra HPS',
      toggleOption15: 'Barra DPS',
      toggleOption16: 'Crítico / DH / CDH',
      toggleOption17: 'Marca de morte',
      toggleOption18: 'Dano do limit break',
      toggleOption11: 'Maior golpe',
      toggleOption12: 'Mostrar combatentes sem job',
      toggleOption13: 'Modo streamer (borrar os nomes)',
      toggleOption14: 'Mostrar apenas o seu DPS',
      maxCombatantsTitle: 'Máx. de combatentes',
      zoomTitle: 'Escala de Zoom',
      resetTitle: 'Resetar',
      discordTitle: 'Discord Webhook URL',
      discordToggle: 'Mostrar botão de envio',
      discordAnonymous: 'Enviar nomes como Player 1, 2, 3',
      discordHelp: 'Pegue no seu canal do Discord',
      // Hover text for the handful of options whose name does not say enough on
      // its own. Each describes what the switch actually does; a line that only
      // restates the label is worse than none, because it costs a hover to find
      // that out. hintAnonymous also names what has to be set first, which is
      // the other thing this page keeps out of sight.
      hintHighlight:
        'Sombreia as duas células de número, um lado mais escuro que o outro, para o olho cair na que importa para aquele job. Para healers é ao contrário.',
      hintJobless:
        'Lista chocobos, egis, torretas e qualquer outro que o ACT reporte sem job. Desligado por padrão porque ocupam espaço de card.',
      hintSolo:
        'Esconde todos os outros e deixa só o seu card. Precisa que o nome do personagem acima esteja certo, senão não dá para saber qual card é o seu.',
      hintStreamer:
        'Borra o nome dos outros até virar sombra; o seu continua legível. Para live, onde os nomes do grupo apareceriam na tela.',
      hintAnonymous:
        'Troca todo nome no relatório por Player 1, 2, 3 -- numerados pela posição final, não por quem são. Precisa de um endereço de webhook acima.',
      hintCharacterName:
        'Como a overlay acha o seu card na lista. O ACT normalmente reporta você como YOU, e aí o que estiver aqui é o que aparece no seu card. Se o ACT reportar seu nome real de personagem, isto precisa bater exatamente, senão a overlay não sabe qual card é o seu.',
      localeTitle: 'Língua',
      help:
        'Tudo salva automaticamente.<br /><strong>Botão direito</strong> abre essa janela.',
    },
    setupMode: {
      sampleZone: 'Dummy',
      instructionsTitle:
        '<strong>Botão direito por aqui para abrir as configurações!</strong>',
      instructions:
        'O que é mostrado no modo de configuração não são dados reais, serve apenas para que você configure e posicione esse overlay como quiser antes de ir para o combate real. Se quiser dados reais, inicie um combate, seja real ou num Dummy. <br />Aproveite para também redimensionar essa janela pra algo mais largo que alto, como a janela de configurações.',
    },
  },
  zhCN: {
    initial: {
      help:
        '在此处右击打开设置菜单。请确认插件设置中“鼠标穿透(Enable clickthru)”已关闭。',
    },
    config: {
      setupTitle: '配置模式',
      backTitle: '返回悬浮窗',
      nameHelp:
        '你在名单里的名字：',
      themeTitle: '颜色主题',
      themeOption1: '职业特有',
      themeOption2: '黑白色调',
      themeOption3: '细分职业',
      sectionCard: '角色卡片',
      sectionBanner: '总览横幅',
      sectionRoster: '名单范围',
      sectionSelf: '个人与直播',
      toggleOption1: '排名 #',
      toggleOption2: '职业图标',
      toggleOption3: 'HPS',
      leftStatTitle: '左侧显示',
      leftStatCrit: '暴击率',
      leftStatDhit: '直击率',
      leftStatCdh: '直暴率',
      leftStatJob: '职业',
      toggleOption4: '高亮色块',
      toggleOption5: '凸显个人数据',
      toggleOption6: '战斗时间',
      toggleOption7: '总DPS',
      toggleOption8: 'HPS占比条',
      toggleOption15: 'DPS占比条',
      toggleOption16: '暴直信息',
      toggleOption17: '死亡标记',
      toggleOption18: '极限技伤害',
      toggleOption11: '最强伤害',
      toggleOption12: '显示无职业单位',
      toggleOption13: '直播模式（模糊他人ID）',
      toggleOption14: '只显示你的DPS',
      maxCombatantsTitle: '最多显示人数',
      zoomTitle: '缩放尺寸',
      resetTitle: '初始化',
      discordTitle: 'Discord Webhook 链接',
      discordToggle: '显示发送按钮',
      discordAnonymous: '角色名发送为 Player 1、2、3',
      discordHelp: '从你的Discord频道中获取',
      // Hover text for the handful of options whose name does not say enough on
      // its own. Each describes what the switch actually does; a line that only
      // restates the label is worse than none, because it costs a hover to find
      // that out. hintAnonymous also names what has to be set first, which is
      // the other thing this page keeps out of sight.
      hintHighlight:
        '给 DPS 和 HPS 两格加一层深浅分段的底色，把视线引向该职业更该看的那一格。治疗职业会反过来强调左半格。',
      hintJobless:
        '把陆行鸟、召唤兽、炮塔这类 ACT 报上来但没有职业的单位也列出来。默认关闭，因为它们会占掉卡片位置。',
      hintSolo:
        '只留下你自己的卡片，其他人全部隐藏。需要上面的角色名填对，否则认不出哪张是你。',
      hintStreamer:
        '把别人的名字模糊成一团阴影，你自己的照常显示。给直播用，免得队友 ID 出现在画面上。',
      hintAnonymous:
        '发送时把报告里的所有名字换成 Player 1、2、3，按名次编号而不是按身份。需要先填上面的 Webhook 地址。',
      hintCharacterName:
        '悬浮窗靠它在名单里认出哪张卡是你。ACT 通常把自己报成 YOU，这时你填什么卡上就显示什么；如果 ACT 报的是真实角色名，这里必须填得一模一样，否则认不出来。',
      localeTitle: '模板语言',
      help:
        '所有内容都将自动保存。<br /><strong>右击模板界面</strong>打开本窗口。',
    },
    setupMode: {
      sampleZone: '木人',
      instructionsTitle:
        '<strong>在本窗口的任意位置右击打开配置菜单！</strong>',
      instructions:
        '这不是真正的统计数据，只是一个让你在配置模板显示内容时参考的样例。打木桩或者进入真正的战斗才能把真实数据显示在这里。<br />另外，请将这个窗口的尺寸调整到和设置窗口差不多大小方便使用。',
    },
  },
  zhHK: {
    initial: {
      help:
        '在此處右擊打開設定選單。請確認外掛程式設定中「滑鼠穿透(Enable clickthru)」已關閉。',
    },
    config: {
      setupTitle: '配置模式',
      backTitle: '返回懸浮窗',
      nameHelp:
        '你在名單裡的名字：',
      themeTitle: '顏色主題',
      themeOption1: '職業特有',
      themeOption2: '黑白色調',
      themeOption3: '細分職業',
      sectionCard: '角色卡片',
      sectionBanner: '總覽橫幅',
      sectionRoster: '名單範圍',
      sectionSelf: '個人與直播',
      toggleOption1: '排名 #',
      toggleOption2: '職業圖示',
      toggleOption3: 'HPS',
      leftStatTitle: '左側顯示',
      leftStatCrit: '暴擊率',
      leftStatDhit: '直擊率',
      leftStatCdh: '直暴率',
      leftStatJob: '職業',
      toggleOption4: '高亮色塊',
      toggleOption5: '凸顯個人數據',
      toggleOption6: '戰鬥時間',
      toggleOption7: '總DPS',
      toggleOption8: 'HPS佔比條',
      toggleOption15: 'DPS佔比條',
      toggleOption16: '暴直資訊',
      toggleOption17: '死亡標記',
      toggleOption18: '極限技傷害',
      toggleOption11: '最強傷害',
      toggleOption12: '顯示無職業單位',
      toggleOption13: '直播模式（模糊他人ID）',
      toggleOption14: '只顯示你的DPS',
      maxCombatantsTitle: '最多顯示人數',
      zoomTitle: '縮放尺寸',
      resetTitle: '初始化',
      discordTitle: 'Discord Webhook 連結',
      discordToggle: '顯示發送按鈕',
      discordAnonymous: '角色名發送為 Player 1、2、3',
      discordHelp: '從你的Discord頻道中獲取',
      // Hover text for the handful of options whose name does not say enough on
      // its own. Each describes what the switch actually does; a line that only
      // restates the label is worse than none, because it costs a hover to find
      // that out. hintAnonymous also names what has to be set first, which is
      // the other thing this page keeps out of sight.
      hintHighlight:
        '給 DPS 和 HPS 兩格加一層深淺分段的底色，把視線引向該職業更該看的那一格。治療職業會反過來強調左半格。',
      hintJobless:
        '把陸行鳥、召喚獸、砲塔這類 ACT 報上來但沒有職業的單位也列出來。預設關閉，因為它們會佔掉卡片位置。',
      hintSolo:
        '只留下你自己的卡片，其他人全部隱藏。需要上面的角色名填對，否則認不出哪張是你。',
      hintStreamer:
        '把別人的名字模糊成一團陰影，你自己的照常顯示。給直播用，免得隊友 ID 出現在畫面上。',
      hintAnonymous:
        '傳送時把報告裡的所有名字換成 Player 1、2、3，按名次編號而不是按身分。需要先填上面的 Webhook 位址。',
      hintCharacterName:
        '懸浮視窗靠它在名單裡認出哪張卡是你。ACT 通常把自己報成 YOU，這時你填什麼卡上就顯示什麼；如果 ACT 報的是真實角色名，這裡必須填得一模一樣，否則認不出來。',
      localeTitle: '模板語言',
      help:
        '所有內容都將自動儲存。<br /><strong>右擊模板介面</strong>打開本視窗。',
    },
    setupMode: {
      sampleZone: '木人',
      instructionsTitle:
        '<strong>在本視窗的任意位置右擊打開設定選單！</strong>',
      instructions:
        '這不是真正的統計數據，只是一個讓你在配置模板顯示內容時參考的樣例。打木樁或者進入真正的戰鬥才能把真實數據顯示在這裡。<br />另外，請將這個視窗的尺寸調整到和設定視窗差不多大小方便使用。',
    },
  },
  frFR: {
    initial: {
      help:
        'Clic droit ici pour afficher les Paramètres. Vérifiez bien que l\'option "Enable clickthru" est désactivée dans ACT.',
    },
    config: {
      setupTitle: 'Mode Config',
      backTitle: "Retour à l'overlay",
      nameHelp:
        'Votre nom dans la liste des combattants :',
      themeTitle: 'Thème des couleurs',
      themeOption1: 'Couleur par rôle',
      themeOption2: 'Noir & blanc',
      themeOption3: 'Couleur par rôle (détaillé)',
      sectionCard: 'Carte du combattant',
      sectionBanner: 'Barre de combat',
      sectionRoster: 'Qui est affiché',
      sectionSelf: 'Vous et le streaming',
      toggleOption1: 'Rang',
      toggleOption2: 'Icône de Job',
      toggleOption3: 'HPS',
      leftStatTitle: 'Colonne gauche',
      leftStatCrit: 'Taux de crit',
      leftStatDhit: 'Taux de DH',
      leftStatCdh: 'Taux de CDH',
      leftStatJob: 'Job',
      toggleOption4: 'Surbrillance',
      toggleOption5: 'Se mettre en évidence',
      toggleOption6: 'Durée',
      toggleOption7: 'DPS Total',
      toggleOption8: 'Barre HPS',
      toggleOption15: 'Barre DPS',
      toggleOption16: 'Critique / DH / CDH',
      toggleOption17: 'Marque de mort',
      toggleOption18: 'Dégâts de limit break',
      toggleOption11: 'Coup le plus fort',
      toggleOption12: 'Afficher les combattants sans job',
      toggleOption13: 'Mode streamer (flouter les noms)',
      toggleOption14: 'Afficher uniquement votre DPS',
      maxCombatantsTitle: 'Combattants max',
      zoomTitle: 'Échelle de zoom',
      resetTitle: 'Réinitialiser',
      discordTitle: 'Discord Webhook URL',
      discordToggle: "Afficher le bouton d'envoi",
      discordAnonymous: 'Envoyer les noms en Player 1, 2, 3',
      discordHelp: "Obtenez l'adresse depuis votre canal Discord",
      // Hover text for the handful of options whose name does not say enough on
      // its own. Each describes what the switch actually does; a line that only
      // restates the label is worse than none, because it costs a hover to find
      // that out. hintAnonymous also names what has to be set first, which is
      // the other thing this page keeps out of sight.
      hintHighlight:
        'Ombre les deux cases de chiffres, un côté plus sombre que l\'autre, pour que l\'œil tombe sur celle qui compte pour ce job. L\'inverse pour les soigneurs.',
      hintJobless:
        'Affiche chocobos, égis, tourelles et tout ce qu\'ACT signale sans job. Désactivé par défaut car ils prennent des places de carte.',
      hintSolo:
        'Masque tous les autres et ne laisse que votre carte. Le nom de personnage ci-dessus doit être correct, sinon impossible de savoir laquelle est la vôtre.',
      hintStreamer:
        'Brouille le nom des autres en une ombre ; le vôtre reste lisible. Pour le streaming, où les noms du groupe seraient sinon à l\'écran.',
      hintAnonymous:
        'Remplace chaque nom du rapport par Player 1, 2, 3 -- numérotés par position finale, pas par identité. Nécessite une adresse de webhook ci-dessus.',
      hintCharacterName: "Comment l'overlay repère votre carte dans la liste. ACT vous signale généralement comme YOU, et alors ce que vous mettez ici est ce qu'affiche votre carte. Si ACT signale votre vrai nom de personnage, ceci doit y correspondre exactement, sinon l'overlay ne peut pas savoir quelle carte est la vôtre.",
      localeTitle: 'Langue',
      help:
        'Tout est sauvegardé automatiquement.<br /><strong>Clic droit</strong> pour ouvrir cette fenêtre',
    },
    setupMode: {
      sampleZone: 'Mannequin',
      instructionsTitle:
        "<strong>Clic droit n'importe où dans cette fenêtre pour ouvrir les paramètres !</strong>",
      instructions:
        "Il ne s'agit PAS de vraies données, mais d'une simulation qui vous permet de placer et de configurer l'overlay comme vous le souhaitez. Allez frapper un mannequin ou engagez un combat réel pour obtenir de vraies données ici. <br />Veuillez également redimensionner cette fenêtre pour qu'elle corresponde à la largeur de la fenêtre des paramètres.",
    },
  },
}
export default locale
