# Horizoverlay Reborn

[English](README.md) · [简体中文](README_zhCN.md) · [正體中文](README_zhHK.md) · Português · [Français](README_frFR.md)

Um medidor de dano horizontal para Final Fantasy XIV, que mostra o DPS e o HPS do grupo inteiro numa fileira de cartões. Uma reconstrução do [Horizoverlay](https://github.com/bsides/horizoverlay).

![](screenshots/overlay-byrole.png)

## Instalação

Baixe o zip em [Releases](https://github.com/garfieldzasv/horizoverlay-reborn/releases) e descompacte, ou clone este repositório e use a pasta `build/`.

1. No OverlayPlugin, crie um overlay do tipo MiniParse
2. Aponte a URL para o `index.html` usando o caminho `file://` completo
3. Desligue o **Enable clickthru** desse overlay, senão o botão direito não abre as configurações
4. Clique com o botão direito no overlay para abrir as configurações

Largura da janela: uma fileira de 4 precisa de 759px, 6 precisam de 1138px, 8 precisam de 1517px, 12 precisam de 2276px, 24 precisam de 4551px. Os cartões quebram linha quando não cabem.

O ACTWebSocket também funciona, é só acrescentar `?HOST_PORT=ws://127.0.0.1:10501/` à URL.

## Funcionalidades

Clique com o botão direito para abrir as configurações. Tudo vale na hora e se salva sozinho.

<img src="screenshots/config.png" width="420">

* Cinco idiomas de interface: inglês, português, chinês simplificado, chinês tradicional e francês
* Três temas de cor: por função, preto & branco, e por função detalhada
* A metade direita do cartão é DPS; a esquerda alterna entre HPS, taxa de crítico, taxa de acerto direto, taxa de crítico direto e o código do job
* Duas barras de participação, uma de DPS e outra de HPS
* Ordem, ícone do job, maior golpe e destaque, cada um com seu interruptor
* Barra do combate com duração e DPS total
* De 1 a 24 combatentes, com opção de incluir chocobos, egis e outras unidades sem job
* Seu próprio cartão fixado em branco; dá também para mostrar só você, ou borrar o nome dos outros
* Zoom de 0,5x a 2x
* Modo config, uma prévia com dados falsos para ajustar tudo fora de combate
* Webhook do Discord, que publica a luta no seu canal

O tema detalhado, uma cor por subfunção:

![](screenshots/overlay-byjob.png)

Preto & branco:

![](screenshots/overlay-blackwhite.png)

Modo config:

![](screenshots/setup-mode.png)

## O que mudou em relação ao original

* Fonte monoespaçada embutida, então os dígitos param de tremer a cada atualização do DPS
* Cartões dimensionados para números de seis dígitos
* Os cartões quebram linha em vez de serem cortados sem aviso
* A porcentagem de dano em texto saiu, no lugar entrou uma segunda barra para a cura
* A metade esquerda é selecionável; o original só oferecia HPS
* Cartões, barras e banners alinham as bordas inclinadas sozinhos
* Um tema a mais, que separa o DPS em corpo a corpo, ranged e caster
* 59 ícones de job, incluindo o Beastmaster <img src="screenshots/bst-icon.png" width="18"> do patch 7.56
* Pets usam um ícone de invocação em cinza neutro, no lugar do ícone de rede desconectada em preto
* Página de configurações refeita
* Totalmente offline; nada é buscado na rede em tempo de execução

O original, com fonte proporcional e cartões mais estreitos:

![](screenshots/upstream-1300px.png)

Agora seis dígitos cabem:

![](screenshots/overlay-6digit.png)

Mesmos 900px, mesmos oito jogadores. O original perde o primeiro e o último cartão:

![](screenshots/upstream-900px-clipped.png)

Agora quebra em duas fileiras:

![](screenshots/wrap-900px.png)

## Perguntas frequentes

**O botão direito não faz nada.** Confira se o Enable clickthru está desligado. Dá também para acrescentar `#/config` à URL e abrir as configurações direto.

**As configurações somem quando reinicio.** O `localStorage` fica bloqueado num caminho `file://`; sirva a pasta descompactada por HTTP local.

**Uma porcentagem marca 0% para todo mundo.** Sua versão do ACT não fornece esse campo. Escolha outra.

**Um ícone de job virou um carbúnculo.** O nome daquela unidade não bateu com nenhum nome de pet conhecido. Nada quebra.

Para o resto, [abra uma issue](https://github.com/garfieldzasv/horizoverlay-reborn/issues).

## Compilando

Precisa de Node.js.

```bash
npm install
npm run build
```

Para desenvolver use `npm start` e acrescente `?mock=1#/` à URL para dados falsos. O [DEVLOG.md](DEVLOG.md) cobre como acrescentar um tema de cor e onde ficam a geometria do cartão e a escala tipográfica.

## Licença e créditos

Derivado de [bsides/horizoverlay](https://github.com/bsides/horizoverlay), Copyright 2017 Rafael "BSIDES" Pereira, Apache-2.0, e publicado sob a mesma licença. O [NOTICE](NOTICE) lista o que mudou.

A Maple Mono NF CN embutida vem de [subframe7536/maple-font](https://github.com/subframe7536/maple-font) sob a SIL Open Font License 1.1.

Os ícones de job derivam de arte de FINAL FANTASY XIV. FINAL FANTASY é marca registrada da Square Enix Holdings Co., Ltd. Este projeto não tem vínculo com a Square Enix nem endosso dela.
