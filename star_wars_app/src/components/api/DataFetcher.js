import { API_URL } from "./ApiAddress";


    //TODO zwraca 10 pierwszych tylko

export const fetchData = async() => {
    const firstCharacters = await fetch(API_URL + "people", {
        method:"GET",
        headers: {"Content-Type": "application/json",}
    });
    return firstCharacters.json();
}

export const loadNextCharacters = async(latest) =>{
    try{
    //I want to fetch only next 5 characters, so for example if I get
    //latest as 10, im creating list [11,12,13,14,15], and fetch 
    //information for these indexes
    let indexes = [...Array(5).keys()].map(y => latest+y+1);
    const loadedCharacters = await Promise.all(
        indexes.map(id => fetch(API_URL + "people/" + id, {
            method:"GET",
            headers: {"Content-Type": "application/json",}
        }).then(response => response.ok ? response.json() : null)
        )
        // .then(async(data) => {
        //     if(data.ok){
        //         data = await data.json();
        //         useCallback(data);
        //     }
        //     else{
        //         console.log("Fetch error, not 2xx response");
        //     }
        // }))
    )
    return loadedCharacters;
    } catch(error){
        console.log('Program encountered an error', error)
    }
}

