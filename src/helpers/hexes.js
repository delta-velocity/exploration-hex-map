function pixelToHex(x, y, size) {

    // Reverse the transformations from hexToPixel
    const q = (2.0 / 3.0) * x / size;
    const r = (-1.0 / 3.0) * x / size + Math.sqrt(3) / 3 * y / size;
    return { x: q, y: r };
}

function hexRound(q, r) {
    var s = -q - r;
    var rx = Math.round(q);
    var ry = Math.round(r);
    var rz = Math.round(s);

    var x_diff = Math.abs(rx - q);
    var y_diff = Math.abs(ry - r);
    var z_diff = Math.abs(rz - s);

    if (x_diff > y_diff && x_diff > z_diff)
        rx = -ry - rz;
    else if (y_diff > z_diff)
        ry = -rx - rz;
    return { q: rx, r: ry };
}

function selectHexagon(x, y, size, offsetX, offsetY) {
    // Account for panning offset
    x -= offsetX;
    y -= offsetY;
    const fractionalHex = pixelToHex(x, y, size);
    const q_r = hexRound(fractionalHex.x, fractionalHex.y)
    return q_r;
}

export { pixelToHex, hexRound, selectHexagon }