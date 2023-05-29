import {Plugin, showMessage, confirm, Dialog, Menu, isMobile, openTab, adaptHotkey} from "siyuan";
import "./index.scss";
import { openMathlive,initMathLive } from "./mathlive";

const STORAGE_NAME = "menu-config";
const TAB_TYPE = "custom_tab";
const DOCK_TYPE = "dock_tab";

export default class PluginSample extends Plugin {

    private customTab: () => any;

    onload() {
        this.eventBus.on("open-noneditableblock", openMathlive);
        initMathLive()
        
        this.data[STORAGE_NAME] = {readonlyText: "Readonly"};
    }
    onunload() {
        console.log(this.i18n.byePlugin);
        this.eventBus.off("open-noneditableblock", openMathlive);
    }
}
