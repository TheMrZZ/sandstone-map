"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.findClosestColor = exports.ALL_COLORS = void 0;
var BASE_COLORS = [
    { R: 127, G: 178, B: 56 },
    { R: 247, G: 233, B: 163 },
    { R: 199, G: 199, B: 199 },
    { R: 255, G: 0, B: 0 },
    { R: 160, G: 160, B: 255 },
    { R: 167, G: 167, B: 167 },
    { R: 0, G: 124, B: 0 },
    { R: 255, G: 255, B: 255 },
    { R: 164, G: 168, B: 184 },
    { R: 151, G: 109, B: 77 },
    { R: 112, G: 112, B: 112 },
    { R: 64, G: 64, B: 255 },
    { R: 143, G: 119, B: 72 },
    { R: 255, G: 252, B: 245 },
    { R: 216, G: 127, B: 51 },
    { R: 178, G: 76, B: 216 },
    { R: 102, G: 153, B: 216 },
    { R: 229, G: 229, B: 51 },
    { R: 127, G: 204, B: 25 },
    { R: 242, G: 127, B: 165 },
    { R: 76, G: 76, B: 76 },
    { R: 153, G: 153, B: 153 },
    { R: 76, G: 127, B: 153 },
    { R: 127, G: 63, B: 178 },
    { R: 51, G: 76, B: 178 },
    { R: 102, G: 76, B: 51 },
    { R: 102, G: 127, B: 51 },
    { R: 153, G: 51, B: 51 },
    { R: 25, G: 25, B: 25 },
    { R: 250, G: 238, B: 77 },
    { R: 92, G: 219, B: 213 },
    { R: 74, G: 128, B: 255 },
    { R: 0, G: 217, B: 58 },
    { R: 129, G: 86, B: 49 },
    { R: 112, G: 2, B: 0 },
    { R: 209, G: 177, B: 161 },
    { R: 159, G: 82, B: 36 },
    { R: 149, G: 87, B: 108 },
    { R: 112, G: 108, B: 138 },
    { R: 186, G: 133, B: 36 },
    { R: 103, G: 117, B: 53 },
    { R: 160, G: 77, B: 78 },
    { R: 57, G: 41, B: 35 },
    { R: 135, G: 107, B: 98 },
    { R: 87, G: 92, B: 92 },
    { R: 122, G: 73, B: 88 },
    { R: 76, G: 62, B: 92 },
    { R: 76, G: 50, B: 35 },
    { R: 76, G: 82, B: 42 },
    { R: 142, G: 60, B: 46 },
    { R: 37, G: 22, B: 16 },
    { R: 189, G: 48, B: 49 },
    { R: 148, G: 63, B: 97 },
    { R: 92, G: 25, B: 29 },
    { R: 22, G: 126, B: 134 },
    { R: 58, G: 142, B: 140 },
    { R: 86, G: 44, B: 62 },
    { R: 20, G: 180, B: 133 },
];
function getColorVariants(color) {
    function applyMultiplier(multiplier) {
        return {
            R: Math.floor(color.R * multiplier / 255),
            G: Math.floor(color.G * multiplier / 255),
            B: Math.floor(color.B * multiplier / 255)
        };
    }
    return [
        applyMultiplier(180),
        applyMultiplier(220),
        applyMultiplier(255),
        applyMultiplier(135),
    ];
}
exports.ALL_COLORS = BASE_COLORS.flatMap(getColorVariants);
var ALL_COLORS_WITH_IDS = __spreadArray([], exports.ALL_COLORS.entries()).map(function (_a) {
    var i = _a[0], color = _a[1];
    return ({ color: color, id: i + 4 });
});
function getSimilarity(color1, color2) {
    // https://stackoverflow.com/a/9085524
    var rMean = (color1.R + color2.R) / 2;
    var rDelta = color1.R - color2.R;
    var gDelta = color1.G - color2.G;
    var bDelta = color1.B - color2.B;
    return (((512 + rMean) * Math.pow(rDelta, 2)) >> 8) + 4 * Math.pow(gDelta, 2) + (((767 - rMean) * Math.pow(bDelta, 2)) >> 8);
}
var cache = new Map();
function findClosestColor(color) {
    var colorStr = JSON.stringify(color);
    // If in cache, return it
    var cachedColor = cache.get(colorStr);
    if (cachedColor) {
        return cachedColor;
    }
    /*
     * Not in cache.
     * Find the closest color, then return it.
     */
    var bestIndex = 0;
    var bestSimilarity = getSimilarity(color, exports.ALL_COLORS[0]);
    for (var i = 1; i < ALL_COLORS_WITH_IDS.length; i += 1) {
        var mcColor = exports.ALL_COLORS[i];
        var similarity = getSimilarity(color, mcColor);
        if (similarity < bestSimilarity) {
            bestIndex = i;
            bestSimilarity = similarity;
        }
    }
    var result = ALL_COLORS_WITH_IDS[bestIndex];
    // Set in cache
    cache.set(colorStr, result);
    return result;
}
exports.findClosestColor = findClosestColor;
