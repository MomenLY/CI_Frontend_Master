export function OnionTruncate(str:string, num_chars:number) {
     let result = '';
  let count = 0;
  
  for (let i = 0; i < str.length; i++) {
    result += str[i];
    count++;
    
    if (count >= num_chars) {
      break;
    }
  }
  
  if (count < str.length) {
    result += '...';
  }
  
  return result;
}

export const isDefaultLobby = (lobbyName) => {
    return lobbyName === "defaultLobby"
}
