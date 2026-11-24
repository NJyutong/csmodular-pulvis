export const GrainOscModule = {
    "type": "GrainOsc",
    "displayName": "Pulvis Grain Osc",
    "displayNameI18n": {
        "en": "Pulvis Grain Osc",
        "zh": "微粒 · 颗粒振荡器",
        "ru": "Пульвис · Гранулярный осциллятор"
    },
    "category": "osc",
    "status": "passable",
    "pulvisStudio": true,
    "pulvisVersion": "0.0.6",
    "width": 500,
    "height": 300,
    "gridHeight": 20,
    "originalName": "GrainOsc",
    "defaultParams": [],
    "tooltip": "Grain generator with a built-in wave (sine, triangle, saw or square), no input needed. Pitch 0 = 220 Hz (A3). Phase warp reshapes phase progression within each cycle; phase jitter varies each grain start. Time scatter independently varies trigger times while keeping their mean rate. Seed repeats both random sequences. Right-click for pitch quantization, tempo sync, and spectrum view. Up to 64 grains at once.",
    "tooltipI18n": {
        "en": "Grain generator with a built-in wave (sine, triangle, saw or square), no input needed. Pitch 0 = 220 Hz (A3). Phase warp reshapes phase progression within each cycle; phase jitter varies each grain start. Time scatter independently varies trigger times while keeping their mean rate. Seed repeats both random sequences. Right-click for pitch quantization, tempo sync, and spectrum view. Up to 64 grains at once.",
        "zh": "内置正弦、三角、锯齿或方波的颗粒发生器，无需输入。音高 0 = 220 Hz（A3）。相位扭曲改变周期内的相位推进；相位抖动改变每颗粒起始相位。时间散布独立改变触发时刻，同时保持平均粒速。Seed 可复现两组随机序列。右键菜单支持音高量化（锁定到调）、节拍同步与频谱视图。最多同时 64 个颗粒。",
        "ru": "Генератор гранул со встроенной синусоидой, треугольником, пилой или меандром. Высота 0 = 220 Гц (A3). Деформация меняет ход фазы, разброс фазы — старт гранулы. Разброс времени независимо меняет моменты запуска, сохраняя среднюю плотность. Seed повторяет обе случайные последовательности. ПКМ — квантизация высоты, синхронизация BPM и спектр. До 64 гранул одновременно."
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
        12,
        13,
        14,
        15
    ],
    "inputs": [
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
        113,
        115
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
            "text": "WAVE: 0 sine · 1 tri · 2 saw · 3 square",
            "textI18n": {
                "en": "WAVE: 0 sine · 1 tri · 2 saw · 3 square",
                "zh": "波形：0 正弦 · 1 三角 · 2 锯齿 · 3 方波",
                "ru": "Волна: 0 син · 1 треуг · 2 пила · 3 меандр"
            },
            "fontSize": 10
        },
        {
            "componentType": "TextLabel",
            "id": "901",
            "x": 256,
            "y": 21,
            "text": "Pitch 0 = 220 Hz (A3) · ▲ marks 0 center",
            "textI18n": {
                "en": "Pitch 0 = 220 Hz (A3) · ▲ marks 0 center",
                "zh": "音高 0 = 220 Hz（A3）· ▲ 指示零位",
                "ru": "Высота 0 = 220 Гц (A3) · ▲ метка нуля"
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
            "text": "Carrier Tone Warp & Grain Core",
            "textI18n": {
                "en": "Carrier Tone Warp & Grain Core",
                "zh": "载波音色扭曲与颗粒核",
                "ru": "Осциллятор, фаза и ядро гранул"
            },
            "fontSize": 11
        },
        {
            "componentType": "TextLabel",
            "id": "911",
            "x": 264,
            "y": 104,
            "text": "Phase/Pitch Jitter & Stereo Out",
            "textI18n": {
                "en": "Phase/Pitch Jitter & Stereo Out",
                "zh": "相位音高抖动与立体声输出",
                "ru": "Разброс фазы/высоты и стерео"
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
            "max": 48,
            "defaultValue": 24,
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
            "x": 94,
            "y": 133,
            "size": "medium",
            "min": 0,
            "max": 127,
            "defaultValue": 0,
            "csoundName": "PhaseWarp"
        },
        {
            "componentType": "TextLabel",
            "id": "302",
            "x": 94,
            "y": 120,
            "text": "Phase warp",
            "textI18n": {
                "en": "Phase warp",
                "zh": "相位扭曲",
                "ru": "Деф. фазы"
            },
            "fontSize": 10
        },
        {
            "componentType": "Input",
            "id": "104",
            "x": 149,
            "y": 136,
            "jackType": "control",
            "bandwidth": "static",
            "ConnectorName": "Phase warp CV",
            "connectorNameI18n": {
                "en": "Phase warp CV",
                "zh": "相位扭曲 调制输入",
                "ru": "Модуляция: Деф. фазы"
            }
        },
        {
            "componentType": "Knob",
            "id": "4",
            "x": 264,
            "y": 149,
            "size": "medium",
            "min": 0,
            "max": 127,
            "defaultValue": 0,
            "csoundName": "PosJitter"
        },
        {
            "componentType": "TextLabel",
            "id": "303",
            "x": 264,
            "y": 136,
            "text": "Phase jitter",
            "textI18n": {
                "en": "Phase jitter",
                "zh": "相位抖动",
                "ru": "Разбр. фазы"
            },
            "fontSize": 10
        },
        {
            "componentType": "Input",
            "id": "105",
            "x": 319,
            "y": 152,
            "jackType": "control",
            "bandwidth": "static",
            "ConnectorName": "Phase jitter CV",
            "connectorNameI18n": {
                "en": "Phase jitter CV",
                "zh": "相位抖动 调制输入",
                "ru": "Модуляция: Разбр. фазы"
            }
        },
        {
            "componentType": "Knob",
            "id": "5",
            "x": 170,
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
            "x": 170,
            "y": 120,
            "text": "Pitch (0=A3)",
            "textI18n": {
                "en": "Pitch (0=A3)",
                "zh": "音高（0=A3）",
                "ru": "Высота (A3)"
            },
            "fontSize": 10
        },
        {
            "componentType": "Input",
            "id": "106",
            "x": 225,
            "y": 136,
            "jackType": "control",
            "bandwidth": "static",
            "ConnectorName": "Pitch (0=A3) CV",
            "connectorNameI18n": {
                "en": "Pitch (0=A3) CV",
                "zh": "音高（0=A3） 调制输入",
                "ru": "Модуляция: Высота (A3)"
            }
        },
        {
            "componentType": "Knob",
            "id": "6",
            "x": 340,
            "y": 149,
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
            "y": 136,
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
            "y": 152,
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
            "y": 221,
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
            "y": 208,
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
            "y": 224,
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
            "y": 221,
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
            "y": 208,
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
            "y": 224,
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
            "x": 42,
            "y": 233,
            "width": 58,
            "items": "Follow,Hold",
            "itemsI18n": {
                "en": "Follow,Hold",
                "zh": "跟随,锁定",
                "ru": "Следить,Фикс."
            },
            "initialIndex": 0,
            "binaryThreshold": true,
            "csoundName": "Freeze"
        },
        {
            "componentType": "TextLabel",
            "id": "309",
            "x": 42,
            "y": 216,
            "text": "Hold warp",
            "textI18n": {
                "en": "Hold warp",
                "zh": "锁定扭曲",
                "ru": "Фикс. фазы"
            },
            "fontSize": 10
        },
        {
            "componentType": "Input",
            "id": "111",
            "x": 103,
            "y": 232,
            "jackType": "control",
            "bandwidth": "static",
            "ConnectorName": "Hold warp CV",
            "connectorNameI18n": {
                "en": "Hold warp CV",
                "zh": "锁定扭曲 调制输入",
                "ru": "Модуляция: Фикс. фазы"
            }
        },
        {
            "componentType": "Knob",
            "id": "12",
            "x": 416,
            "y": 221,
            "size": "medium",
            "min": -24,
            "max": 12,
            "defaultValue": -12,
            "snapping": true,
            "showZeroIndicator": true,
            "csoundName": "Level"
        },
        {
            "componentType": "TextLabel",
            "id": "311",
            "x": 416,
            "y": 208,
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
            "y": 224,
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
            "y": 149,
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
            "y": 136,
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
            "x": 18,
            "y": 133,
            "size": "medium",
            "min": 0,
            "max": 3,
            "defaultValue": 0,
            "csoundName": "Wave"
        },
        {
            "componentType": "TextLabel",
            "id": "313",
            "x": 18,
            "y": 120,
            "text": "Wave",
            "textI18n": {
                "en": "Wave",
                "zh": "波形",
                "ru": "Волна"
            },
            "fontSize": 10
        },
        {
            "componentType": "Knob",
            "id": "15",
            "x": 142,
            "y": 229,
            "size": "medium",
            "min": 0,
            "max": 100,
            "defaultValue": 0,
            "csoundName": "TimeJitter"
        },
        {
            "componentType": "TextLabel",
            "id": "314",
            "x": 142,
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
            "x": 197,
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
            "text": "Grain Stereo Out (L / R) →",
            "textI18n": {
                "en": "Grain Stereo Out (L / R) →",
                "zh": "颗粒立体声输出 (左 / 右) →",
                "ru": "Стереовыход (Л / П) →"
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
