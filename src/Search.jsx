import './Search.css'
import React, {useState, useRef, useEffect, useMemo} from 'react';
import debounce from 'lodash.debounce';

const useDebounce = (callback) => {
    const ref = useRef();
  
    useEffect(() => {
      ref.current = callback;
    }, [callback]);
  
    const debouncedCallback = useMemo(() => {
      const func = () => {
        ref.current?.();
      };
  
      return debounce(func, 100);
    }, []);
  
    return debouncedCallback;
  };


const AUTOCOMPLETE_API_ACCESS_TOKEN = "8fb3d500fc324fb8b14685bde781a1ef";

const Search = ({ goToPoint }) =>
{
  const [value, setValue] = useState();
  const [searchValue, setSearchValue] = useState();

  const [previousValue, setPreviousValue] = useState();
  const [entries, setEntries] = useState([]);
  const [markerDropped, setMarkerDropped] = useState(false);

  const debouncedRequest = useDebounce(() => 
  {
    var query = value;

    query = query.replaceAll(' ', '%20');
    var request_url = "https://api.geoapify.com/v1/geocode/autocomplete?text=" + query + "&filter=countrycode:nz&limit=40&format=json&apiKey=" + AUTOCOMPLETE_API_ACCESS_TOKEN;

    fetch(request_url)
      .then((res) => res.json())
      .then((data) =>
      {
        // Handle auto complete results
        if(data !== null && data.results !== null)
        {
          // Only allow auckland results
          var aucklandResults = [];

          data.results.forEach((result, index) =>
          {
            if(result.state.toUpperCase() === 'AUCKLAND')
                aucklandResults.push(result);
          });

          if(aucklandResults.length > 0)
              setEntries(aucklandResults);
          else if(!value.startsWith(previousValue))
              setEntries([]);
        }
      })
      .catch((err) =>
      {
      });
  });

  const inputChangeHandler = (event) =>
  {
    setPreviousValue(value);
    const eventValue = event.target.value;
    setValue(eventValue);

    if(eventValue === null || eventValue.length == 0)
    {
        setSearchValue("");
        setEntries([]);
    }
    else
    {
        setSearchValue(eventValue);
        debouncedRequest();
    }
  };

  const autocompleteClickHandler = (entry) =>
  {
    let lon = entry.lon;
    let lat = entry.lat;
    console.log(entry)
    console.log(lat)
    // Update search box
    setSearchValue(entry.address_line1 + ", " + entry.address_line2);

    // Clear autocomplete entries
    setEntries([]);
    goToPoint(lat,lon);
  };

  return (
        <div className='searchBarBody'>
            <div className='searchBar'>
                <input placeholder='Enter Your Address' onChange={inputChangeHandler} value={searchValue}/>
            </div>

            <div className='searchResults'>
              {
                entries?.map(entry =>
                (
                
                      <div key={entry.address_line1 + ", " + entry.address_line2} className="autocomplete-entry" onClick={() => autocompleteClickHandler(entry)}>
                        {entry.address_line1 + ", " + entry.address_line2}
                      </div>
                   
                ))
              }
            </div>
        </div>
    );
}

export default Search