
export const useDraw = () => {

}

export interface DrawStoke {
    width: number
    color: string
    points: point[]
}

export interface point {
    x: number, y: number
}
export function decode(base64: string) {
    // 对base64转编码
    var decode = atob(base64);
    // 编码转字符串
    var str = decodeURI(decode);
    return str;
}

export interface DrawData {
    version: number
    stokes: DrawStoke[]
    config: {
        color: string
        width: number,
        background: string
    }
}