import { MathfieldElement } from 'mathlive';
export { initMathLive }
import { isMobile,showMessage } from 'siyuan';

declare global {
    var mathVirtualKeyboard: any;
    var MathfieldElement:any;
    var siyuan:any;
  }

function initMathLive(){
    MathfieldElement.fontsDirectory = null;
    MathfieldElement.soundsDirectory = null;
    new MathfieldElement();
    initStyle()
}

export function openMathlive({detail}: any){
    let protyleUtil = detail['toolbar']["subElement"] as HTMLElement
    console.log(protyleUtil)
    let title = protyleUtil.querySelector(".fn__flex-1.resize__move") as HTMLElement
    console.log(title)
    var innerText = title.innerText
    if (innerText === siyuan.languages["inline-math"] || innerText === siyuan.languages["math"]){
        console.log("捕获点击数学公式事件")
        initMathLiveRender(protyleUtil)
    }
}

function initMathLiveRender(util:HTMLElement) {
    // var originMathBlock = event.target;
    setTimeout(() => { renderMathLive(false, util); }, 10);
};


function renderMathLive(naiveDom:boolean,originMathBlock:HTMLElement,debug:boolean=false){
    // console.log("click!")
    //初始化获得输入框元素
    // initVitrualKeyboard()
    //获取当前屏幕
    let currentScreen:any = document.querySelector(".layout__wnd--active");
    //获取当前页面
    let currentPage = currentScreen.querySelector(
        ".fn__flex-1.protyle:not(.fn__none)"
    );
    var textBlock = originMathBlock.querySelector(":scope > div")
    var latexBlock:HTMLTextAreaElement|null = originMathBlock.querySelector(":scope > div > textarea")

    if (!textBlock ||  !latexBlock){
        console.log("renderMathLive 初始化获得输入框元素错误！")
        console.log(`textBlock ${textBlock} ||  latexBlock ${latexBlock} `)
        return;
    }

    if (debug===true){

        console.log("renderMathLive 初始化获得输入框元素成功！")
        console.log(`textBlock ${textBlock} ||  latexBlock ${latexBlock} `)
    }



    var dyBlock = document.createElement("div")
    dyBlock.id = "mathEnhanceDyBlock"
    var keyboardBlock = initkeyboardBlock()
    var MathLiveBlock = initMathLiveBlock(latexBlock)

    if (naiveDom === true){
        console.log("启动原生渲染！")
        dyBlock.appendChild(MathLiveBlock)
    }
    else{
        dyBlock.appendChild(MathLiveBlock) 
    }
    textBlock.appendChild(dyBlock)
    textBlock.appendChild(keyboardBlock)

    addMathLiveListener(latexBlock,MathLiveBlock);
}

function addMathLiveListener(latexBlock:HTMLTextAreaElement,MathLiveBlock:any){
    var tempLatex = MathLiveBlock.value;
    var liveCall:boolean = false;
    //初始化输入事件
    let evt =  new Event('input', {
        bubbles: true,
        cancelable: true
      })
    MathLiveBlock.addEventListener("input", () => {
        //替换标记宏
        var expendLatex = MathLiveBlock.getValue("latex-expanded");
        
        latexBlock.value = expendLatex.replace(/\{\\textcolor\{#6495ed\}\{(.+?)\}\}/g, "\\mark{$1}").replace(/\\textcolor\{#6495ed\}\{(.+?)\}/g, "\\mark{$1}");
        if (tempLatex === MathLiveBlock.value) {
            tempLatex = MathLiveBlock.value;
            // console.log(tempLatex)
            return
        }
        tempLatex = MathLiveBlock.value;
        liveCall = true;
        latexBlock.dispatchEvent(evt);
    });

    latexBlock.addEventListener("input", (ev) => {
        if (liveCall === true){
            liveCall = false;
            return;
        }
        MathLiveBlock.setValue(latexBlock.value, {suppressChangeNotifications: true})
    }
    );
}

function initkeyboardBlock():HTMLElement{
    var keyboardBlock = document.createElement("div");
    keyboardBlock.style.height = "auto";
    if (!isMobile()) mathVirtualKeyboard.container = keyboardBlock;
    return keyboardBlock
}


function initMathLiveBlock(latexBlock:HTMLTextAreaElement):HTMLTextAreaElement{

    var mathLiveBlock:any = document.createElement("math-field")
    // 初始化样式
    mathLiveBlock.style.cssText = `
    width: -webkit-fill-available; 
    font-size: 1.25em; 
    color: var(--b3-protyle-inline-strong-color); 
    background-color: var(--b3-theme-background);
    `
    // mathLiveBlock.style.fontSize = "1.25em";
    
    mathLiveBlock.value = latexBlock.value;
    mathLiveBlock.macros = {
        ...mathLiveBlock.macros,
        mark: {
            args: 1,
            def: "{\\color{#6495ed}#1}",
            captureSelection: false,
        },
    };
    var tempMacro = JSON.parse(window.siyuan.config.editor.katexMacros || "{}");
    tempMacro["\\placeholder"] = "\\phantom";
    tempMacro["\\ensuremath"] = "#1"
    window.siyuan.config.editor.katexMacros = JSON.stringify(tempMacro);
    return mathLiveBlock;
}

function initStyle() {
    var mathlive_css = document.createElement("style");
    mathlive_css.id = "mathEnhance"
    mathlive_css.innerHTML = `
#mathlive-popover-panel{
    z-index: 200;
}
.ML__keyboard.is-visible{
    height: calc(var(--_keyboard-height) + 10px);
    --keyboard-background: var(--b3-theme-background-light);
    --keyboard-toolbar-text-active: var(--b3-theme-primary);
    --keyboard-toolbar-text: var(--b3-theme-on-background);
    --keycap-text: var(--b3-theme-on-background);
    --keycap-background: var(--b3-theme-background);
    --_variant-panel-background: var(--b3-theme-background-light);
}
.bigfnbutton {
    margin-bottom: 3px;
}
.MLK__keycap {
    margin-bottom: 3px;
}
.MLK__backdrop {
    height: calc(var(--keyboard-height) + 10px);
}

.MLK__rows .bottom {
    justify-content: center !important;
    align-items: center !important;
    padding: 0px;
}

@-moz-document url-prefix() {
    .MLK__rows > .row div {
        width: calc(min(var(--_keycap-max-width), 9%) - var(--_keycap-gap)) !important;
    }

    .MLK__rows > .row .w20{
        width: calc(2 * min(var(--_keycap-max-width), 9%) - var(--_keycap-gap)) !important;
    }

    .MLK__rows > .row .w15{
        width: calc(1.5 * min(var(--_keycap-max-width), 9%) - var(--_keycap-gap)) !important;
    }

    .MLK__rows {
        width: -moz-available !important;
        border-bottom: calc(min(2px, var(--_keycap-max-width)))
    }

    math-field {
        width: -moz-available !important;
    }
}
`;
    document.head.appendChild(mathlive_css);
    // document.body.style.setProperty("--keycap-height", "3em");
    document.body.style.setProperty("--keycap-font-size", "1.2em");
}
