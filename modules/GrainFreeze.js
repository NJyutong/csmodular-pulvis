export const GrainFreezeModule = {
    "type": "GrainFreeze",
    "displayName": "Pulvis Grain Freeze",
    "displayNameI18n": {
        "en": "Pulvis Grain Freeze",
        "zh": "微粒 · 颗粒冻结",
        "ru": "Пульвис · Гранулярная заморозка"
    },
    "category": "fx",
    "status": "passable",
    "pulvisStudio": true,
    "pulvisVersion": "0.0.6",
    "width": 500,
    "height": 300,
    "gridHeight": 20,
    "originalName": "GrainFreeze",
    "defaultParams": [],
    "tooltip": "Records an 8 s live ring for granular playback. Freeze stops recording; Capture copies the current ring into a private snapshot table. Choose Live or Snapshot independently of Sample WAV slots. Reverse changes grain playback direction. Feedback (0–0.95) feeds wet grains back into recording and limits stored peaks to ±1; 0 is the clean linear default. Up to 64 grains at once.",
    "tooltipI18n": {
        "en": "Records an 8 s live ring for granular playback. Freeze stops recording; Capture copies the current ring into a private snapshot table. Choose Live or Snapshot independently of Sample WAV slots. Reverse changes grain playback direction. Feedback (0–0.95) feeds wet grains back into recording and limits stored peaks to ±1; 0 is the clean linear default. Up to 64 grains at once.",
        "zh": "录入 8 秒实时环形缓冲供颗粒播放。冻结会停止录音；“捕捉快照”把当前缓冲复制到 Freeze 私有表。实时／快照来源独立于 Sample 的 WAV 槽。反向会改变颗粒播放方向。反馈（0–0.95）把湿声颗粒回送录音，并将写入峰值限制在 ±1；默认 0 保持干净线性。最多同时 64 个颗粒。",
        "ru": "Записывает 8-секундный кольцевой буфер для гранул. «Стоп» останавливает запись; «Снимок» копирует буфер в отдельную таблицу Freeze. Источники «Вход/Снимок» не связаны со слотами WAV модуля Sample. «Назад» меняет направление гранул. Обратная связь (0–0,95) возвращает влажный сигнал в запись и ограничивает пики записи уровнем ±1; значение 0 сохраняет чистый линейный тракт. До 64 гранул одновременно."
    },
    "params": [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18
    ],
    "inputs": [
        101,
        102,
        103,
        104,
        105,
        106,
        107,
        108,
        109,
        110,
        111,
        112,
        113,
        115,
        116,
        117
    ],
    "outputs": [
        201,
        202
    ],
    "components": [
        {
            "componentType": "TextLabel",
            "id": "900",
            "x": 16,
            "y": 21,
            "text": "LIVE RING (8s) · connect audio in first",
            "textI18n": {
                "en": "LIVE RING (8s) · connect audio in first",
                "zh": "实时环形缓冲（8秒）· 先连接音频输入",
                "ru": "БУФЕР 8 С · сначала подключите аудиовход"
            },
            "fontSize": 10
        },
        {
            "componentType": "TextLabel",
            "id": "901",
            "x": 256,
            "y": 21,
            "text": "Workflow: Record → Freeze → Capture → Snapshot",
            "textI18n": {
                "en": "Workflow: Record → Freeze → Capture → Snapshot",
                "zh": "流程：录入 → 冻结 → 捕捉快照 → 切至快照",
                "ru": "Поток: Запись → Стоп → Снимок → Источник"
            },
            "fontSize": 10
        },
        {
            "componentType": "Line",
            "id": "920",
            "x": 12,
            "y": 94,
            "length": 476,
            "orientation": "Horizontal",
            "width": 1,
            "color": "#1e293b"
        },
        {
            "componentType": "TextLabel",
            "id": "910",
            "x": 18,
            "y": 104,
            "text": "Live Ring Buffer & Grain Core",
            "textI18n": {
                "en": "Live Ring Buffer & Grain Core",
                "zh": "实时环形缓冲与颗粒核",
                "ru": "Кольцевой буфер и ядро гранул"
            },
            "fontSize": 11
        },
        {
            "componentType": "TextLabel",
            "id": "911",
            "x": 264,
            "y": 104,
            "text": "Pitch Scatter, Wet Mix & Timing",
            "textI18n": {
                "en": "Pitch Scatter, Wet Mix & Timing",
                "zh": "音高散布、干湿混音与时序",
                "ru": "Высота, микс и тайминг"
            },
            "fontSize": 11
        },
        {
            "componentType": "Knob",
            "id": "1",
            "x": 18,
            "y": 181,
            "size": "medium",
            "min": 0,
            "max": 24,
            "defaultValue": 12,
            "csoundName": "Density"
        },
        {
            "componentType": "TextLabel",
            "id": "300",
            "x": 18,
            "y": 168,
            "text": "Grains/s",
            "textI18n": {
                "en": "Grains/s",
                "zh": "颗粒/秒",
                "ru": "Гранул/с"
            },
            "fontSize": 10
        },
        {
            "componentType": "Input",
            "id": "102",
            "x": 73,
            "y": 184,
            "jackType": "control",
            "bandwidth": "static",
            "ConnectorName": "Grains/s CV",
            "connectorNameI18n": {
                "en": "Grains/s CV",
                "zh": "颗粒/秒 调制输入",
                "ru": "Модуляция: Гранул/с"
            }
        },
        {
            "componentType": "Knob",
            "id": "2",
            "x": 94,
            "y": 181,
            "size": "medium",
            "min": 2,
            "max": 400,
            "defaultValue": 80,
            "csoundName": "Size"
        },
        {
            "componentType": "TextLabel",
            "id": "301",
            "x": 94,
            "y": 168,
            "text": "Size ms",
            "textI18n": {
                "en": "Size ms",
                "zh": "粒长 ms",
                "ru": "Длина, мс"
            },
            "fontSize": 10
        },
        {
            "componentType": "Input",
            "id": "103",
            "x": 149,
            "y": 184,
            "jackType": "control",
            "bandwidth": "static",
            "ConnectorName": "Size ms CV",
            "connectorNameI18n": {
                "en": "Size ms CV",
                "zh": "粒长 ms 调制输入",
                "ru": "Модуляция: Длина, мс"
            }
        },
        {
            "componentType": "Knob",
            "id": "3",
            "x": 18,
            "y": 229,
            "size": "medium",
            "min": 0,
            "max": 127,
            "defaultValue": 32,
            "csoundName": "Position"
        },
        {
            "componentType": "TextLabel",
            "id": "302",
            "x": 18,
            "y": 216,
            "text": "Lookback",
            "textI18n": {
                "en": "Lookback",
                "zh": "回看位置",
                "ru": "В прошлое"
            },
            "fontSize": 10
        },
        {
            "componentType": "Input",
            "id": "104",
            "x": 73,
            "y": 232,
            "jackType": "control",
            "bandwidth": "static",
            "ConnectorName": "Lookback CV",
            "connectorNameI18n": {
                "en": "Lookback CV",
                "zh": "回看位置 调制输入",
                "ru": "Модуляция: В прошлое"
            }
        },
        {
            "componentType": "Knob",
            "id": "4",
            "x": 94,
            "y": 229,
            "size": "medium",
            "min": 0,
            "max": 127,
            "defaultValue": 8,
            "csoundName": "PosJitter"
        },
        {
            "componentType": "TextLabel",
            "id": "303",
            "x": 94,
            "y": 216,
            "text": "Lookback jit.",
            "textI18n": {
                "en": "Lookback jit.",
                "zh": "回看抖动",
                "ru": "Разбр. буф."
            },
            "fontSize": 10
        },
        {
            "componentType": "Input",
            "id": "105",
            "x": 149,
            "y": 232,
            "jackType": "control",
            "bandwidth": "static",
            "ConnectorName": "Lookback jit. CV",
            "connectorNameI18n": {
                "en": "Lookback jit. CV",
                "zh": "回看抖动 调制输入",
                "ru": "Модуляция: Разбр. буф."
            }
        },
        {
            "componentType": "Knob",
            "id": "5",
            "x": 264,
            "y": 133,
            "size": "medium",
            "min": -48,
            "max": 48,
            "defaultValue": 0,
            "snapping": true,
            "showZeroIndicator": true,
            "csoundName": "Pitch"
        },
        {
            "componentType": "TextLabel",
            "id": "304",
            "x": 264,
            "y": 120,
            "text": "Pitch st",
            "textI18n": {
                "en": "Pitch st",
                "zh": "音高（半音）",
                "ru": "Высота, пт"
            },
            "fontSize": 10
        },
        {
            "componentType": "Input",
            "id": "106",
            "x": 319,
            "y": 136,
            "jackType": "control",
            "bandwidth": "static",
            "ConnectorName": "Pitch st CV",
            "connectorNameI18n": {
                "en": "Pitch st CV",
                "zh": "音高（半音） 调制输入",
                "ru": "Модуляция: Высота, пт"
            }
        },
        {
            "componentType": "Knob",
            "id": "6",
            "x": 340,
            "y": 133,
            "size": "medium",
            "min": 0,
            "max": 24,
            "defaultValue": 0,
            "csoundName": "PitchJitter"
        },
        {
            "componentType": "TextLabel",
            "id": "305",
            "x": 340,
            "y": 120,
            "text": "Pitch jitter",
            "textI18n": {
                "en": "Pitch jitter",
                "zh": "音高抖动 st",
                "ru": "Разбр. выс."
            },
            "fontSize": 10
        },
        {
            "componentType": "Input",
            "id": "107",
            "x": 395,
            "y": 136,
            "jackType": "control",
            "bandwidth": "static",
            "ConnectorName": "Pitch jitter CV",
            "connectorNameI18n": {
                "en": "Pitch jitter CV",
                "zh": "音高抖动 st 调制输入",
                "ru": "Модуляция: Разбр. выс."
            }
        },
        {
            "componentType": "ButtonIncDec",
            "id": "7",
            "x": 170,
            "y": 185,
            "width": 58,
            "items": "Hann,Triangle,Blackman",
            "itemsI18n": {
                "en": "Hann,Triangle,Blackman",
                "zh": "汉宁窗,三角窗,布莱克曼窗",
                "ru": "Ханн,Треуг.,Блэкман"
            },
            "initialIndex": 0,
            "indexValue": true,
            "csoundName": "Window"
        },
        {
            "componentType": "TextLabel",
            "id": "306",
            "x": 170,
            "y": 168,
            "text": "Window",
            "textI18n": {
                "en": "Window",
                "zh": "颗粒包络",
                "ru": "Окно"
            },
            "fontSize": 10
        },
        {
            "componentType": "Input",
            "id": "108",
            "x": 231,
            "y": 184,
            "jackType": "control",
            "bandwidth": "static",
            "ConnectorName": "Window CV",
            "connectorNameI18n": {
                "en": "Window CV",
                "zh": "颗粒包络 调制输入",
                "ru": "Модуляция: Окно"
            }
        },
        {
            "componentType": "Knob",
            "id": "8",
            "x": 264,
            "y": 229,
            "size": "medium",
            "min": 0,
            "max": 127,
            "defaultValue": 64,
            "csoundName": "Pan"
        },
        {
            "componentType": "TextLabel",
            "id": "307",
            "x": 264,
            "y": 216,
            "text": "Pan",
            "textI18n": {
                "en": "Pan",
                "zh": "声像",
                "ru": "Панорама"
            },
            "fontSize": 10
        },
        {
            "componentType": "Input",
            "id": "109",
            "x": 319,
            "y": 232,
            "jackType": "control",
            "bandwidth": "static",
            "ConnectorName": "Pan CV",
            "connectorNameI18n": {
                "en": "Pan CV",
                "zh": "声像 调制输入",
                "ru": "Модуляция: Панорама"
            }
        },
        {
            "componentType": "Knob",
            "id": "9",
            "x": 340,
            "y": 181,
            "size": "medium",
            "min": 0,
            "max": 127,
            "defaultValue": 64,
            "csoundName": "Spread"
        },
        {
            "componentType": "TextLabel",
            "id": "308",
            "x": 340,
            "y": 168,
            "text": "Pan spread",
            "textI18n": {
                "en": "Pan spread",
                "zh": "声像扩展",
                "ru": "Разбр. пан."
            },
            "fontSize": 10
        },
        {
            "componentType": "Input",
            "id": "110",
            "x": 395,
            "y": 184,
            "jackType": "control",
            "bandwidth": "static",
            "ConnectorName": "Pan spread CV",
            "connectorNameI18n": {
                "en": "Pan spread CV",
                "zh": "声像扩展 调制输入",
                "ru": "Модуляция: Разбр. пан."
            }
        },
        {
            "componentType": "ButtonIncDec",
            "id": "10",
            "x": 18,
            "y": 137,
            "width": 58,
            "items": "Record,Freeze",
            "itemsI18n": {
                "en": "Record,Freeze",
                "zh": "录入,冻结",
                "ru": "Запись,Стоп"
            },
            "initialIndex": 0,
            "binaryThreshold": true,
            "csoundName": "Freeze"
        },
        {
            "componentType": "TextLabel",
            "id": "309",
            "x": 18,
            "y": 120,
            "text": "Freeze",
            "textI18n": {
                "en": "Freeze",
                "zh": "冻结",
                "ru": "Заморозка"
            },
            "fontSize": 10
        },
        {
            "componentType": "Input",
            "id": "111",
            "x": 79,
            "y": 136,
            "jackType": "control",
            "bandwidth": "static",
            "ConnectorName": "Freeze CV",
            "connectorNameI18n": {
                "en": "Freeze CV",
                "zh": "冻结 调制输入",
                "ru": "Модуляция: Заморозка"
            }
        },
        {
            "componentType": "Knob",
            "id": "11",
            "x": 264,
            "y": 181,
            "size": "medium",
            "min": 0,
            "max": 127,
            "defaultValue": 127,
            "csoundName": "Mix"
        },
        {
            "componentType": "TextLabel",
            "id": "310",
            "x": 264,
            "y": 168,
            "text": "Wet mix",
            "textI18n": {
                "en": "Wet mix",
                "zh": "干湿比",
                "ru": "Микс"
            },
            "fontSize": 10
        },
        {
            "componentType": "Input",
            "id": "112",
            "x": 319,
            "y": 184,
            "jackType": "control",
            "bandwidth": "static",
            "ConnectorName": "Wet mix CV",
            "connectorNameI18n": {
                "en": "Wet mix CV",
                "zh": "干湿比 调制输入",
                "ru": "Модуляция: Микс"
            }
        },
        {
            "componentType": "Knob",
            "id": "12",
            "x": 416,
            "y": 181,
            "size": "medium",
            "min": -24,
            "max": 12,
            "defaultValue": -3,
            "snapping": true,
            "showZeroIndicator": true,
            "csoundName": "Level"
        },
        {
            "componentType": "TextLabel",
            "id": "311",
            "x": 416,
            "y": 168,
            "text": "Output dB",
            "textI18n": {
                "en": "Output dB",
                "zh": "输出电平 dB",
                "ru": "Уровень, дБ"
            },
            "fontSize": 10
        },
        {
            "componentType": "Input",
            "id": "113",
            "x": 471,
            "y": 184,
            "jackType": "control",
            "bandwidth": "static",
            "ConnectorName": "Output dB CV",
            "connectorNameI18n": {
                "en": "Output dB CV",
                "zh": "输出电平 dB 调制输入",
                "ru": "Модуляция: Уровень, дБ"
            }
        },
        {
            "componentType": "Knob",
            "id": "13",
            "x": 416,
            "y": 133,
            "size": "medium",
            "min": 0,
            "max": 65534,
            "defaultValue": 1,
            "csoundName": "Seed"
        },
        {
            "componentType": "TextLabel",
            "id": "312",
            "x": 416,
            "y": 120,
            "text": "Seed",
            "textI18n": {
                "en": "Seed",
                "zh": "随机种子",
                "ru": "Зерно"
            },
            "fontSize": 10
        },
        {
            "componentType": "Knob",
            "id": "14",
            "x": 340,
            "y": 229,
            "size": "medium",
            "min": 0,
            "max": 100,
            "defaultValue": 0,
            "csoundName": "TimeJitter"
        },
        {
            "componentType": "TextLabel",
            "id": "313",
            "x": 340,
            "y": 216,
            "text": "Time jitter %",
            "textI18n": {
                "en": "Time jitter %",
                "zh": "时间散布 %",
                "ru": "Разбр. вр."
            },
            "fontSize": 10
        },
        {
            "componentType": "Input",
            "id": "115",
            "x": 395,
            "y": 232,
            "jackType": "control",
            "bandwidth": "static",
            "ConnectorName": "Time jitter % CV",
            "connectorNameI18n": {
                "en": "Time jitter % CV",
                "zh": "时间散布 % 调制输入",
                "ru": "Модуляция: Разбр. вр."
            }
        },
        {
            "componentType": "ButtonIncDec",
            "id": "15",
            "x": 416,
            "y": 233,
            "width": 58,
            "items": "Forward,Reverse",
            "itemsI18n": {
                "en": "Forward,Reverse",
                "zh": "正向,反向",
                "ru": "Вперёд,Назад"
            },
            "initialIndex": 0,
            "binaryThreshold": true,
            "csoundName": "Reverse"
        },
        {
            "componentType": "TextLabel",
            "id": "314",
            "x": 416,
            "y": 216,
            "text": "Direction",
            "textI18n": {
                "en": "Direction",
                "zh": "播放方向",
                "ru": "Направл."
            },
            "fontSize": 10
        },
        {
            "componentType": "Input",
            "id": "116",
            "x": 477,
            "y": 232,
            "jackType": "control",
            "bandwidth": "static",
            "ConnectorName": "Direction CV",
            "connectorNameI18n": {
                "en": "Direction CV",
                "zh": "播放方向 调制输入",
                "ru": "Модуляция: Направл."
            }
        },
        {
            "componentType": "ButtonIncDec",
            "id": "16",
            "x": 170,
            "y": 137,
            "width": 58,
            "items": "Live,Snapshot",
            "itemsI18n": {
                "en": "Live,Snapshot",
                "zh": "实时,快照",
                "ru": "Вход,Снимок"
            },
            "initialIndex": 0,
            "binaryThreshold": true,
            "csoundName": "Source"
        },
        {
            "componentType": "TextLabel",
            "id": "315",
            "x": 170,
            "y": 120,
            "text": "Source",
            "textI18n": {
                "en": "Source",
                "zh": "播放来源",
                "ru": "Источник"
            },
            "fontSize": 10
        },
        {
            "componentType": "Knob",
            "id": "17",
            "x": 170,
            "y": 229,
            "size": "medium",
            "min": 0,
            "max": 0.95,
            "defaultValue": 0,
            "csoundName": "Feedback"
        },
        {
            "componentType": "TextLabel",
            "id": "316",
            "x": 170,
            "y": 216,
            "text": "Feedback",
            "textI18n": {
                "en": "Feedback",
                "zh": "反馈",
                "ru": "Обратная связь"
            },
            "fontSize": 10
        },
        {
            "componentType": "Input",
            "id": "117",
            "x": 225,
            "y": 232,
            "jackType": "control",
            "bandwidth": "static",
            "ConnectorName": "Feedback CV",
            "connectorNameI18n": {
                "en": "Feedback CV",
                "zh": "反馈 调制输入",
                "ru": "Модуляция: Обратная связь"
            }
        },
        {
            "componentType": "ButtonText",
            "id": "18",
            "x": 94,
            "y": 137,
            "width": 68,
            "height": 16,
            "text": "Capture snapshot",
            "textI18n": {
                "en": "Capture snapshot",
                "zh": "捕捉快照",
                "ru": "Сохранить снимок"
            },
            "initialState": false,
            "mode": "momentary",
            "returnState": false,
            "csoundName": "Capture"
        },
        {
            "componentType": "TextLabel",
            "id": "317",
            "x": 94,
            "y": 120,
            "text": "Snapshot",
            "textI18n": {
                "en": "Snapshot",
                "zh": "快照",
                "ru": "Память"
            },
            "fontSize": 10
        },
        {
            "componentType": "Line",
            "id": "926",
            "x": 12,
            "y": 266,
            "length": 476,
            "orientation": "Horizontal",
            "width": 1,
            "color": "#1e293b"
        },
        {
            "componentType": "TextLabel",
            "id": "932",
            "x": 264,
            "y": 275,
            "text": "8s Ring · Stereo Out →",
            "textI18n": {
                "en": "8s Ring · Stereo Out →",
                "zh": "8秒环 · 立体声输出 →",
                "ru": "Буфер 8 с · Стерео →"
            },
            "fontSize": 10
        },
        {
            "componentType": "Input",
            "id": "101",
            "x": 68,
            "y": 274,
            "jackType": "audio",
            "bandwidth": "static",
            "ConnectorName": "Audio in",
            "connectorNameI18n": {
                "en": "Audio in",
                "zh": "音频输入",
                "ru": "Аудиовход"
            }
        },
        {
            "componentType": "TextLabel",
            "id": "601",
            "x": 22,
            "y": 275,
            "text": "Audio in",
            "textI18n": {
                "en": "Audio in",
                "zh": "音频输入",
                "ru": "Аудиовход"
            },
            "fontSize": 10
        },
        {
            "componentType": "Output",
            "id": "201",
            "x": 426,
            "y": 274,
            "jackType": "audio",
            "bandwidth": "static",
            "ConnectorName": "L",
            "connectorNameI18n": {
                "en": "L",
                "zh": "左",
                "ru": "Л"
            }
        },
        {
            "componentType": "TextLabel",
            "id": "701",
            "x": 412,
            "y": 275,
            "text": "L",
            "textI18n": {
                "en": "L",
                "zh": "左",
                "ru": "Л"
            },
            "fontSize": 10
        },
        {
            "componentType": "Output",
            "id": "202",
            "x": 468,
            "y": 274,
            "jackType": "audio",
            "bandwidth": "static",
            "ConnectorName": "R",
            "connectorNameI18n": {
                "en": "R",
                "zh": "右",
                "ru": "П"
            }
        },
        {
            "componentType": "TextLabel",
            "id": "702",
            "x": 454,
            "y": 275,
            "text": "R",
            "textI18n": {
                "en": "R",
                "zh": "右",
                "ru": "П"
            },
            "fontSize": 10
        }
    ]
};
