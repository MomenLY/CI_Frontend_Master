export function OnionTruncate(str:string, num_chars:number) {
    let result = '';
    let count = 0;
    let i = 0;
    
    while (count < num_chars && i < str.length) {
        if (str[i] !== ' ') {
            result += str[i];
            count++;
        }
        i++;
    }
    
    if (i < str.length) {
        result += '...';
    }
    
    return result;
}