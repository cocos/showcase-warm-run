
const win = window as any;

export const languages = {
    "buff": {
        "freeze": "freeze",
    },
    "fightUI": {
        "txt": "Press and hold the screen to speed up",
    },
    "relive": {
        "txt": "s post automatic exit",
        "btnLb": 'Direct reactivation'
    },
    "setting": {
        "btnLabel": "whosyourdaddy",
        "level id": "Enter level id",
    },
    "home": {
        "height": "Best in history:"
    },
    "settlement": {
        'height': "All-time high score:"
    }

};

if (!win.languages) {
    win.languages = {};
}

win.languages.en = languages;