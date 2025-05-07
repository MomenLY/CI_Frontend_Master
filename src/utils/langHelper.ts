export const saveLanguageToStorage = (languageId) => {
  try { localStorage.setItem('lng', languageId); } catch (error) { console.log(error); }
}

export const getLanguageFromStorage = () => {
  let lng = 'en';
  try { 
    lng = localStorage.getItem('lng'); 
  } catch (error) { 
    console.log(error); 
  }
  return lng;
}