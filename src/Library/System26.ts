
//26进制字母[A-Z]，转10进制
export function toNumber(n){
    var s = '';
    while (n > 0){
        var m = n % 26;
        if (m == 0) m = 26;
        s = String.fromCharCode(m + 64) + s;
        n = (n - m) / 26;
    }
    return s;
}

//10进制，转26进制[A-Z]
export function fromNumber(s){
    if (!s) return 0;
    var n = 0;
    for (var i = s.length - 1, j = 1; i >= 0; i--, j *= 26){
        var c = s[i].toUpperCase();
        if (c < 'A' || c > 'Z') return 0;
        n += (c.charCodeAt() - 64) * j;
    }
    return n;
}
