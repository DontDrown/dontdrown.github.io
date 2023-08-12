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
  
      return debounce(func, 250);
    }, []);
  
    return debouncedCallback;
  };

const AUTOCOMPLETE_API_ACCESS_TOKEN = "8fb3d500fc324fb8b14685bde781a1ef";

function Search()
{
  const [value, setValue] = useState();
  const [searchValue, setSearchValue] = useState();

  const [entries, setEntries] = useState([]);

  const debouncedRequest = useDebounce(() => 
  {
    var query = value;

    query = query.replaceAll(' ', '%20');
    var request_url = "https://api.geoapify.com/v1/geocode/autocomplete?text=" + query + "&filter=countrycode:nz&format=json&apiKey=" + AUTOCOMPLETE_API_ACCESS_TOKEN;

    fetch(request_url)
      .then((res) => res.json())
      .then((data) =>
      {
        console.log(data.results);

        // Handle auto complete results
        if(data === null || data.results === null)
          setEntries([]);
        else
          setEntries(data.results);
      });
  });

  const inputChangeHandler = (event) =>
  {
    const value = event.target.value;
    setValue(value);
    setSearchValue(value);

    debouncedRequest();
  };

  const autocompleteClickHandler = (entry) =>
  {
    var lon = entry.lon1;
    var lat = entry.lan1;

    // Update search box
    setSearchValue(entry.address_line1 + ", " + entry.address_line2);
  };

  return (
        <div>
            <div>
                <input placeholder='Enter Your Address' onChange={inputChangeHandler} value={searchValue}/>
            </div>

            {entries.map(entry =>
            (
                <div key={entry.address_line1 + ", " + entry.address_line2} className="autocomplete-entry" onClick={() => autocompleteClickHandler(entry)}>
                    {entry.address_line1 + ", " + entry.address_line2}
                </div>
            )
            )}
        </div>
    );
}

export default Search