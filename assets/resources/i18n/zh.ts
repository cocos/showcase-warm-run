
const win = window as any;

export const languages = {
    "buff": {
        "freeze": "冻结",
    },
    "fightUI": {
        "txt": "按住屏幕加速快跑",
    },
    "relive": {
        "txt": "秒后自动退出",
        "btnLb": '直接复活'
    },
    "setting": {
        "btnLabel": "无敌模式",
        "chooseLevel": "输入关卡id",
    },
    "home": {
        "height": "历史最佳:"
    },
    "settlement": {
        'height': "历史最高分："
    },


};

if (!win.languages) {
    win.languages = {};
}

win.languages.zh = languages;