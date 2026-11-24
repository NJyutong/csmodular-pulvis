export const GrainSampleModule = {
    "type": "GrainSample",
    "displayName": "Pulvis Grain Sample",
    "displayNameI18n": {
        "en": "Pulvis Grain Sample",
        "zh": "微粒 · 颗粒采样",
        "ru": "Пульвис · Гранулярный сэмпл"
    },
    "category": "sample",
    "status": "passable",
    "pulvisStudio": true,
    "pulvisVersion": "0.0.6",
    "width": 500,
    "height": 300,
    "gridHeight": 20,
    "originalName": "GrainSample",
    "defaultParams": [],
    "tooltip": "Standalone WAV source. Right-click to load a WAV into the selected slot; an empty slot is silent. Scan moves through the file (percent per second; Hold pauses it). Reverse plays grains backward. Timing scatter varies trigger times independently from Position jitter while keeping mean density. Up to 64 grains at once. Small jacks beside knobs add modulation.",
    "tooltipI18n": {
        "en": "Standalone WAV source. Right-click to load a WAV into the selected slot; an empty slot is silent. Scan moves through the file (percent per second; Hold pauses it). Reverse plays grains backward. Timing scatter varies trigger times independently from Position jitter while keeping mean density. Up to 64 grains at once. Small jacks beside knobs add modulation.",
        "zh": "独立 WAV 声源，无需音频输入。右键导入当前槽的 WAV；空槽无声。“扫描”让位置在文件中移动，锁定会暂停。反向会倒放颗粒。时间散布独立于位置抖动改变触发时刻，同时保持平均粒速。最多同时 64 个颗粒；可调制控件旁的小插孔可叠加控制信号。",
        "ru": "Самостоятельный WAV-источник, аудиовход не нужен. ПКМ — загрузить файл в выбранный слот; пустой слот молчит. «Скан.» двигает позицию по файлу (% в секунду; фиксация останавливает ход). Обратное направление проигрывает гранулы назад. Разброс времени отдельно от позиции меняет запуски, сохраняя среднюю плотность. До 64 гранул. Малые гнёзда принимают CV."
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
        15,
        16,
        17
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
        115,
        116,
        118
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
            "text": "WAV ENGINE (8 slots) · right-click → Load WAV",
            "textI18n": {
                "en": "WAV ENGINE (8 slots) · right-click → Load WAV",
                "zh": "WAV 采样引擎（8槽）· 右键 → 导入 WAV",
                "ru": "СЭМПЛЕР (8 слотов) · ПКМ → загрузить WAV"
            },
            "fontSize": 10
        },
        {
            "componentType": "TextLabel",
            "id": "901",
            "x": 256,
            "y": 21,
            "text": "1. Pick slot (1–8)  2. Right-click load  3. Scan",
            "textI18n": {
                "en": "1. Pick slot (1–8)  2. Right-click load  3. Scan",
                "zh": "1. 选槽 (1–8)  2. 右键导入 WAV  3. 调节扫描",
                "ru": "1. Слот (1–8)  2. ПКМ: загрузить WAV  3. Скан"
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
            "text": "WAV Slot Scan & Grain Core",
            "textI18n": {
                "en": "WAV Slot Scan & Grain Core",
                "zh": "WAV 采样扫描与颗粒核",
                "ru": "Слот WAV, скан и ядро гранул"
            },
            "fontSize": 11
        },
        {
            "componentType": "TextLabel",
            "id": "911",
            "x": 264,
            "y": 104,
            "text": "Pitch Scatter & Stereo Output",
            "textI18n": {
                "en": "Pitch Scatter & Stereo Output",
                "zh": "音高散布与立体声场输出",
                "ru": "Разброс высоты и стереовыход"
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
            "x": 94,
            "y": 133,
            "size": "medium",
            "min": 0,
            "max": 127,
            "defaultValue": 32,
            "csoundName": "Position"
        },
        {
            "componentType": "TextLabel",
            "id": "302",
            "x": 94,
            "y": 120,
            "text": "Position",
            "textI18n": {
                "en": "Position",
                "zh": "采样位置",
                "ru": "Позиция"
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
            "ConnectorName": "Position CV",
            "connectorNameI18n": {
                "en": "Position CV",
                "zh": "采样位置 调制输入",
                "ru": "Модуляция: Позиция"
            }
        },
        {
            "componentType": "Knob",
            "id": "4",
            "x": 340,
            "y": 133,
            "size": "medium",
            "min": 0,
            "max": 127,
            "defaultValue": 8,
            "csoundName": "PosJitter"
        },
        {
            "componentType": "TextLabel",
            "id": "303",
            "x": 340,
            "y": 120,
            "text": "Pos. jitter",
            "textI18n": {
                "en": "Pos. jitter",
                "zh": "位置抖动",
                "ru": "Разбр. поз."
            },
            "fontSize": 10
        },
        {
            "componentType": "Input",
            "id": "105",
            "x": 395,
            "y": 136,
            "jackType": "control",
            "bandwidth": "static",
            "ConnectorName": "Pos. jitter CV",
            "connectorNameI18n": {
                "en": "Pos. jitter CV",
                "zh": "位置抖动 调制输入",
                "ru": "Модуляция: Разбр. поз."
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
            "x": 416,
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
            "x": 416,
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
            "x": 471,
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
            "y": 181,
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
            "y": 168,
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
            "y": 184,
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
            "text": "Hold pos.",
            "textI18n": {
                "en": "Hold pos.",
                "zh": "锁定位置",
                "ru": "Фикс. поз."
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
            "ConnectorName": "Hold pos. CV",
            "connectorNameI18n": {
                "en": "Hold pos. CV",
                "zh": "锁定位置 调制输入",
                "ru": "Модуляция: Фикс. поз."
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
            "defaultValue": -12,
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
            "x": 390,
            "y": 229,
            "size": "medium",
            "min": 0,
            "max": 65534,
            "defaultValue": 1,
            "csoundName": "Seed"
        },
        {
            "componentType": "TextLabel",
            "id": "312",
            "x": 390,
            "y": 216,
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
            "min": 1,
            "max": 8,
            "defaultValue": 1,
            "csoundName": "Slot"
        },
        {
            "componentType": "TextLabel",
            "id": "313",
            "x": 18,
            "y": 120,
            "text": "Slot",
            "textI18n": {
                "en": "Slot",
                "zh": "采样槽",
                "ru": "Слот"
            },
            "fontSize": 10
        },
        {
            "componentType": "Knob",
            "id": "15",
            "x": 170,
            "y": 133,
            "size": "medium",
            "min": -100,
            "max": 100,
            "defaultValue": 0,
            "snapping": true,
            "showZeroIndicator": true,
            "csoundName": "Scan"
        },
        {
            "componentType": "TextLabel",
            "id": "314",
            "x": 170,
            "y": 120,
            "text": "Scan %/s",
            "textI18n": {
                "en": "Scan %/s",
                "zh": "扫描 %/秒",
                "ru": "Скан %/с"
            },
            "fontSize": 10
        },
        {
            "componentType": "Input",
            "id": "118",
            "x": 225,
            "y": 136,
            "jackType": "control",
            "bandwidth": "static",
            "ConnectorName": "Scan %/s CV",
            "connectorNameI18n": {
                "en": "Scan %/s CV",
                "zh": "扫描 %/秒 调制输入",
                "ru": "Модуляция: Скан %/с"
            }
        },
        {
            "componentType": "Knob",
            "id": "16",
            "x": 288,
            "y": 229,
            "size": "medium",
            "min": 0,
            "max": 100,
            "defaultValue": 0,
            "csoundName": "TimeJitter"
        },
        {
            "componentType": "TextLabel",
            "id": "315",
            "x": 288,
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
            "x": 343,
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
            "id": "17",
            "x": 142,
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
            "id": "316",
            "x": 142,
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
            "x": 203,
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
            "text": "WAV Stereo Out (L / R) →",
            "textI18n": {
                "en": "WAV Stereo Out (L / R) →",
                "zh": "WAV 立体声输出 (左 / 右) →",
                "ru": "Стерео WAV (Л / П) →"
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
