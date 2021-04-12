import { useEffect, useState } from "react";
import { fetchData, loadNextCharacters } from "./api/DataFetcher" 
import { Button } from "react-bootstrap";
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter } from 'react-bootstrap-table2-filter';
import { Loading } from "./LoadingComponent";


export default function AllCharactersComponent(){
    //all data fetched
    const[allCharactersData, setAllCharactersData] = useState([]);
    //checks if data is fetched, or is still being fetched (true- not fetched, false- fetched)
    const[isLoading, setIsLoading] = useState(false);
    //checks if all characters are loaded, to change loading button to "All characters loaded!"
    //and stop the program from fetching non-existing characters
    const[areAllLoaded, setAllLoaded] = useState(false);
    //number of all fetched characters, actually allCharactersData.length, but I found it more elegant
    const[numberOfCharactersLoaded, setNumberOfCharactersLoaded] = useState(0);
    //data that is actually shown. allCharactersData, or all characters 
    //starring in given Star Wars episode (selected by radio buttons on top of the page)
    const[filmFilteredCharactersData, setFilmFilteredCharacters] = useState([]);
    //check if the film filter is applie
    const[whichFilmFiltered, setWhichFilmFiltered] = useState(-1);

    useEffect(() => {
        fetchData().then((data) => {setAllCharactersData(data["results"]); setFilmFilteredCharacters(data["results"])});
        setNumberOfCharactersLoaded(n => n + 10);
        window.addEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        async function load(){
            let loaded = await loadNextCharacters(numberOfCharactersLoaded);
            //filters null value (which is sent instead of an object, if fetch didn't work)
            let loadedWithoutNulls = loaded.filter(x => x)
            //check if all characters are loaded. Why <4 instead of <5? because of this... https://swapi.dev/api/people/17
            if(loadedWithoutNulls.length < 4){
                setAllLoaded(true);
            }
            setAllCharactersData(allCharactersData => [...[allCharactersData], loadedWithoutNulls].flat())
            //forces 3rd useEffect() (for whichFilmFiltered) to fire off, so when user loads
            //more characters with film filter applied, new characters are loaded and filtered right away
            setFilmFilteredCharacters(allCharactersData)
            setWhichFilmFiltered(whichFilmFiltered);
            setIsLoading(false);
        }
        if(isLoading){
                load();
                setNumberOfCharactersLoaded(n => n + 5);
        }
    }, [isLoading]);

    useEffect(() => {
        //happens if we click already clicked radio button, due to it's onClick. Removes film filter, loads all data
        if(whichFilmFiltered === -1){
            setFilmFilteredCharacters(allCharactersData);
        }
        //filters characters depending on the film episode selected
        else{
            var inFilm = [];
            for (let x = 0; x < allCharactersData.length; x++){
                for(let y = 0; y < allCharactersData[x]["films"].length; y++){
                    if(allCharactersData[x]["films"][y] === "http://swapi.dev/api/films/" + whichFilmFiltered + "/"){
                        inFilm.push(allCharactersData[x]);
                    }
                }
            }
            setFilmFilteredCharacters(inFilm);
        }
    }, [whichFilmFiltered]);


    const loadMoreCharacters = () => {if(!areAllLoaded) setIsLoading(true);}
    

    //handles scroll (Sherlock!) to check whether we are on the bottom of the page, and if yes, 
    //load more characters, instead of pressing button.
    let handleScroll = (event) => {
        let scrollingElement = event.target.scrollingElement;
        if(scrollingElement.scrollTop + scrollingElement.clientHeight >= scrollingElement.scrollHeight){
            setIsLoading(true);
        }
    }

    const numberToFilmNameMap = new Map([
        [1, "A New Hope"],
        [2, "The Empire Strikes Back"],
        [3, "Return of the Jedi"],
        [4, "The Phantom Menace"],
        [5, "Attack of the Clones"],
        [6, "Revenge of the Sith"]
        ])
    
    //declaration of columns for table, with filters type set
    const columns = [{
        dataField: 'name',
        text: 'Name',
        filter: textFilter(),
        headerStyle: {textAlign: 'center' }
      }, {
        dataField: 'gender',
        text: 'Gender',
        filter: selectFilter({
            options: {
                "male": "male",
                "female": "female",
                "n/a": "n/a",
                "hermaphrodite": "hermaphrodite",
            },
            placeholder: "all",
        }),
        headerStyle: {textAlign: 'center'}
      }, {
        dataField: 'birth_year',
        text: 'Birth Year',
        headerStyle: {textAlign: 'center' }
        }
      ];

    //function handling row expansion -> shows information about name, height, and what films give character played in
    const expandRow = {
    renderer: row => (
        <div className="ml-2 my-2 ">
                <p>Hey! I'm {row["name"]}. My height is {row["height"]} and I played in {row["films"].length } Star Wars 
                {row["films"].length === 1 ? "episode" : "episodes"}, which {row["films"].length === 1 ? "is" : "are"}:</p>
                <ul>
                    {row["films"].map(film => {
                        return(
                            <li>{numberToFilmNameMap.get(parseInt(film.split("/").slice(-2)[0]))}</li>
                        )
                    })}
                </ul>
        </div>
    ),
    onlyOneExpanding: true
    };

    //if the initial data fetch isn't finished, show loading information in the middle of the screen
    if(filmFilteredCharactersData.length === 0){
        return(
            <div className="mx-3 my-3 justify-content-sm-center" style={{top: "50%", left:"50%", position:"fixed"}}>
                <Loading />
            </div>
        )
    }
    else{
    return(
        <div onScroll={handleScroll}>
            Select films to filter
            <div style={{border: "solid 1px", borderRadius: "15px"}}>
                {Array.from({length: 6}, (_, i) => i + 1).map((value)=> {
                    return(
                        <div key={"filmFilter" + value} style={{display: "inline-block"}} className="mr-3 ml-3">
                            <input type="radio" id={"filmFilter" + value}
                             value={"filmFilter" + value} 
                             name="filmFilter"
                             checked={whichFilmFiltered === value}
                             onChange={() => {}}
                             onClick={() =>{
                                 // if it's already chosen, unchoose it (by changing whichFilmFiltered <checked> of radio button is set to false)
                                if(whichFilmFiltered === value){
                                    setWhichFilmFiltered(-1);
                                }else{
                                    setWhichFilmFiltered(value);
                                }
                             }} 
                             /><label htmlFor={"filmFilter" + value}>{ numberToFilmNameMap.get(value) }</label>
                        </div>
                    )
                })}
            </div>
            <br />

            <BootstrapTable
                keyField='name' 
                data={ filmFilteredCharactersData.map(character => {if(character !== null) return( character ); else return {} })} 
                columns={ columns } 
                expandRow={ expandRow }
                filter={ filterFactory() }
                filterPosition="top"
                striped
                hover
                />

            <Button variant="info" size="md" className="mb-5" disabled={isLoading || areAllLoaded} 
                onClick={!isLoading ? loadMoreCharacters : null} block> 
                    {areAllLoaded ?  "All characters loaded!" :  !isLoading? "Load more characters..." : "Loading ..."}
            </Button>
        </div>
    );
    }
}