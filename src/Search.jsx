import './Search.css'
import React, {useState} from 'react';

const AUTOCOMPLETE_API_ACCESS_TOKEN = "8fb3d500fc324fb8b14685bde781a1ef";

function Search()
{
  const [entries, setEntries] = useState([]);

  const inputChangeHandler = (event) => 
  {
    var query = event.target.value;

    query = query.replaceAll(' ', '%20');
    var request_url = "https://api.geoapify.com/v1/geocode/autocomplete?text=" + query + "&filter=countrycode:nz&format=json&apiKey=" + AUTOCOMPLETE_API_ACCESS_TOKEN;

    fetch(request_url)
      .then((res) => res.json())
      .then((data) =>
      {
        // Handle auto complete results
        if(data === null || data.results === null)
          setEntries([]);
        else
          setEntries(data.results);

        console.log(data.results);
      });
  }

  return (
        <div>
            <div>
                <input placeholder='Enter Your Address' onChange={inputChangeHandler}/>
            </div>

            {entries.map(entry =>
            (
                <div key={entry.address_line1 + ", " + entry.address_line2} className="autocomplete-entry">
                    {entry.address_line1 + ", " + entry.address_line2}
                </div>
            )
            )}
        </div>
    );
}

export default Search