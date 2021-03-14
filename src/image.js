"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var jimp_1 = require("jimp");
var jimp_2 = require("jimp");
var colors_1 = require("./colors");
var save_1 = require("./save");
var SCALE = 4;
function scan(image, callback) {
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (col, row, idx) {
        var red = image.bitmap.data[idx + 0];
        var green = image.bitmap.data[idx + 1];
        var blue = image.bitmap.data[idx + 2];
        var color = { R: red, G: green, B: blue };
        callback(color, row, col, idx);
    });
}
function create2dArray(height, width, fill) {
    return (new Array(height)).fill(0).map(function () { return new Array(width).fill(fill); });
}
function imageToMinecraftColors(image) {
    var _a = image.bitmap, height = _a.height, width = _a.width;
    var pixelsColorIds = create2dArray(height, width, 0);
    scan(image, function (color, row, col, idx) {
        var closestColor = colors_1.findClosestColor(color);
        image.bitmap.data[idx + 0] = closestColor.color.R;
        image.bitmap.data[idx + 1] = closestColor.color.G;
        image.bitmap.data[idx + 2] = closestColor.color.B;
        pixelsColorIds[row][col] = closestColor.id <= 127 ? closestColor.id : closestColor.id - 256;
    });
    return { image: image, pixelsColorIds: pixelsColorIds };
}
function imageToMap(image, width, height, preprocess) {
    if (preprocess === void 0) { preprocess = 'scaleToFit'; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (preprocess === 'scaleToFit') {
                        image = image.scaleToFit(128 * width, 128 * height).contain(128 * width, 128 * height);
                    }
                    if (preprocess === 'resize') {
                        image = image.resize(128 * width, 128 * height);
                    }
                    if (preprocess === 'crop') {
                        image = image.cover(128 * width, 128 * height);
                    }
                    image = image.dither16();
                    // Change colors of the image
                    return [4 /*yield*/, imageToMinecraftColors(image)];
                case 1:
                    // Change colors of the image
                    _a.sent();
                    image.write('./new2.png');
                    return [2 /*return*/];
            }
        });
    });
}
var MCImage = /** @class */ (function () {
    function MCImage(path) {
        this.path = path;
    }
    MCImage.prototype.toMaps = function (width, height, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var image, _a, preprocess, dither, normalize, i, allPixelsColorIds, row, _loop_1, col;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, jimp_1["default"].read(this.path)];
                    case 1:
                        image = _b.sent();
                        _a = __assign({ preprocess: 'scaleToFit', dither: 0, normalize: false }, options), preprocess = _a.preprocess, dither = _a.dither, normalize = _a.normalize;
                        if (preprocess === 'scaleToFit') {
                            image = image.scaleToFit(128 * width, 128 * height).contain(128 * width, 128 * height);
                        }
                        if (preprocess === 'resize') {
                            image = image.resize(128 * width, 128 * height);
                        }
                        if (preprocess === 'crop') {
                            image = image.cover(128 * width, 128 * height);
                        }
                        for (i = 0; i < dither; i += 1) {
                            image.dither16();
                        }
                        if (normalize) {
                            image.normalize();
                        }
                        allPixelsColorIds = imageToMinecraftColors(image).pixelsColorIds;
                        row = 0;
                        _b.label = 2;
                    case 2:
                        if (!(row < height)) return [3 /*break*/, 7];
                        _loop_1 = function (col) {
                            var pixelsColorIds, mapNBT;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        pixelsColorIds = allPixelsColorIds.slice(row * 128, (row + 1) * 128).map(function (pixelsRow) { return pixelsRow.slice(col * 128, (col + 1) * 128); });
                                        mapNBT = {
                                            type: 'compound',
                                            name: '',
                                            value: {
                                                data: {
                                                    type: 'compound',
                                                    value: {
                                                        scale: {
                                                            type: 'byte',
                                                            value: 0
                                                        },
                                                        dimension: {
                                                            type: 'byte',
                                                            value: 0
                                                        },
                                                        trackingPosition: {
                                                            type: 'byte',
                                                            value: 0
                                                        },
                                                        locked: {
                                                            type: 'byte',
                                                            value: 1
                                                        },
                                                        height: {
                                                            type: 'short',
                                                            value: 128
                                                        },
                                                        width: {
                                                            type: 'short',
                                                            value: 128
                                                        },
                                                        xCenter: {
                                                            type: 'int',
                                                            value: 0
                                                        },
                                                        zCenter: {
                                                            type: 'int',
                                                            value: 0
                                                        },
                                                        colors: {
                                                            type: 'byteArray',
                                                            value: pixelsColorIds.flat(+Infinity)
                                                        }
                                                    }
                                                }
                                            }
                                        };
                                        return [4 /*yield*/, save_1.saveNBT(mapNBT, "C:\\Users\\Florian\\AppData\\Roaming\\.minecraft\\saves\\Crea1_15\\data\\map_" + (row * width + col) + ".dat")];
                                    case 1:
                                        _c.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        col = 0;
                        _b.label = 3;
                    case 3:
                        if (!(col < width)) return [3 /*break*/, 6];
                        return [5 /*yield**/, _loop_1(col)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        col += 1;
                        return [3 /*break*/, 3];
                    case 6:
                        row += 1;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return MCImage;
}());
var ImageScreen = /** @class */ (function () {
    function ImageScreen(width, height, facing) {
        this.width = width;
        this.height = height;
        this.facing = facing;
    }
    ImageScreen.prototype.setImage = function (image) {
        this.image = image;
        return this;
    };
    /**
     * Place the maps
     */
    ImageScreen.prototype.place = function (coords) {
    };
    return ImageScreen;
}());
/*
 *const image = new MCImage('src/gradient.png')
 *image.toMaps(1, 1, 'scaleToFit').then(() => console.log('over'))
 */
var img = new MCImage('screenshot.png');
img.toMaps(4, 4, { preprocess: 'scaleToFit', dither: 2 });
// nbt.parse(fs.readFileSync('./map_21.dat')).then((result) => console.log(new Set((result.parsed.value.data?.value as any).colors.value)))
var S = 16;
var COLS = 16;
// eslint-disable-next-line no-new
new jimp_2["default"](S * COLS, colors_1.ALL_COLORS.length * S / COLS, function (_, image) {
    for (var i = 0; i < colors_1.ALL_COLORS.length; i += 1) {
        var color = colors_1.ALL_COLORS[i];
        for (var j = 0; j < S; j += 1) {
            for (var h = 0; h < S; h += 1) {
                var row = (Math.floor(i / COLS) * S + j);
                var col = h + (i % COLS) * COLS;
                var idx = (row * image.bitmap.width + col) * 4;
                image.bitmap.data[idx + 0] = color.R;
                image.bitmap.data[idx + 1] = color.G;
                image.bitmap.data[idx + 2] = color.B;
                image.bitmap.data[idx + 3] = 255;
            }
        }
    }
    image.write('./raster.png');
});
