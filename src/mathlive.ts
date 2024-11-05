import { MathfieldElement } from 'mathlive';
export { initMathLive }
import { isMobile } from "./utils"
import * as prettier from "prettier";
import * as prettierPluginLatex from "prettier-plugin-latex";

declare global {
    var mathVirtualKeyboard: any;
    var MathfieldElement:any;
    var siyuan:any;
  }

function initMathLive(){
    MathfieldElement.fontsDirectory = null;
    MathfieldElement.soundsDirectory = null;
    var mf = new MathfieldElement();
    mf.smartMode = true;
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
        initMathLiveRender(protyleUtil, title);
    }
}

function initMathLiveRender(util:HTMLElement, title:HTMLElement) {
    // var originMathBlock = event.target;
    setTimeout(() => { renderMathLive(false, util, title); }, 10);
};


function renderMathLive(naiveDom:boolean,originMathBlock:HTMLElement, titleBlock:HTMLElement,debug:boolean=false){
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

    initMacros(MathLiveBlock)
    addShortcut(MathLiveBlock)

    addMathLiveListener(latexBlock,MathLiveBlock);
    titleBlock.dispatchEvent(new MouseEvent("mousedown", {
        view: window,
        bubbles: true,
        cancelable: true
    }));
    titleBlock.dispatchEvent(new MouseEvent("mouseup", {
        view: window,
        bubbles: true,
        cancelable: true
    }));
}

function addMathLiveListener(latexBlock:HTMLTextAreaElement,MathLiveBlock:any){
    var tempLatex = MathLiveBlock.value;
    var liveCall:boolean = false;
    //初始化输入事件
    let evt =  new Event('input', {
        bubbles: true,
        cancelable: true
      })
    MathLiveBlock.addEventListener("input", async () => {
        //替换标记宏
        var expendLatex = MathLiveBlock.getValue("latex-expanded");
        
        var originLatex = expendLatex.replace(/\{\\textcolor\{#6495ed\}\{(.+?)\}\}/g, "\\mark{$1}").replace(/\\textcolor\{#6495ed\}\{(.+?)\}/g, "\\mark{$1}");
        var formattedLatex = "$" + originLatex + "$";
        formattedLatex = await prettier.format(
            "$" + originLatex + "$",
            {
                printWidth: 80,
                useTabs: true,
                tabWidth: 2,
                parser: "latex-parser",
                plugins: [prettierPluginLatex]
            }
        );
        latexBlock.value = formattedLatex.slice(1,-1);
        if (tempLatex === MathLiveBlock.value) {
            tempLatex = MathLiveBlock.value;
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
        MathLiveBlock.setValue(latexBlock.value)
    }
    );
}

function initkeyboardBlock():HTMLElement{
    var keyboardBlock = document.createElement("div");
    keyboardBlock.style.height = "auto";
    if (!isMobile) mathVirtualKeyboard.container = keyboardBlock;
    return keyboardBlock
}

function initMathLiveBlock(latexBlock:HTMLTextAreaElement):HTMLTextAreaElement{
    var mathLiveBlock:any = document.createElement("math-field")
    // 初始化样式
    mathLiveBlock.style.cssText = `
    width: -webkit-fill-available; 
    font-size: 1.7em; 
    color: var(--b3-protyle-inline-strong-color); 
    background-color: var(--b3-theme-background);
    `
    // mathLiveBlock.style.fontSize = "1.25em";
    
    mathLiveBlock.value = latexBlock.value;
    return mathLiveBlock;
}

function initMacros(mathLiveBlock:any){
    console.log(mathLiveBlock.macros)
    mathLiveBlock.macros = {
        ...mathLiveBlock.macros,
        mark: {
            args: 1,
            def: "{\\color{#6495ed}#1}",
            captureSelection: false,
        },
        rm: "\\mathrm#1",
    };
    var tempMacro = JSON.parse(window.siyuan.config.editor.katexMacros || "{}");
    tempMacro["\\placeholder"] = "\\phantom";
    tempMacro["\\ensuremath"] = "#1"
    window.siyuan.config.editor.katexMacros = JSON.stringify(tempMacro);
}

function initStyle() {
    // 白天黑夜模式，0是白，1是黑
    var mode = siyuan.config.appearance.mode;
    var mathlive_css = document.createElement("style");
    mathlive_css.id = "mathEnhance"
    mathlive_css.innerHTML = `
#mathlive-suggestion-popover{
    z-index: 200 !important;
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
    if (isMobile){
        mathlive_css.innerHTML = mathlive_css.innerHTML+
        `
        .ML__keyboard.is-visible{
            top: 50%;
        }`
    }
    document.head.appendChild(mathlive_css);
    // document.body.style.setProperty("--keycap-height", "3em");
    document.body.style.setProperty("--keycap-font-size", "1.2em");
    document.body.style.setProperty("--contains-highlight-background-color", mode ? "hsl(212, 40%, 30%)" : "hsl(212, 40%, 90%)");
    document.body.style.setProperty("--keycap-shift-font-size", "1.2em");
    document.body.style.setProperty("--keyboard-padding-top", "-2px");
}

function addShortcut(mathLiveBlock:any){
    mathLiveBlock.keybindings = removeObjByPropertyVal(mathLiveBlock.keybindings, "key","alt+d")
    mathLiveBlock.keybindings = [
        ...mathLiveBlock.keybindings,
        {
            "key": "alt+d",
            "ifMode": "math",
            "command": [
                "insert",
                "\\mark{#@}"
            ]
        }
    ]
}

function removeObjByPropertyVal(objList:any,propName:string, propVal:any) { // propName为要判断的属性名，propVal为要判断的属性值
    for (var i = 0; i < objList.length; i++) {
      if (objList[i][propName] == propVal) { // 判断该属性值是否符合要求
        objList.splice(i, 1); // 使用splice()方法删除该object
        i--; // 因为删除后后面的元素会向前移动，所以要将i减1
      }
    }
    return objList
  }
  