import React, { useState } from 'react';
import axios from "axios";
import "./SearchBar.css";

function SearchBar(props){
    const [searchItems, setSearchItems] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const apiKey = import.meta.env.VITE_APP_API_KEY;
    const baseUrl = import.meta.env.VITE_APP_API_BASE_URL;

    const handleClick = (c)=>{
        var sym = c.target.className.toString().split(" ")[0]
        //console.log(sym)
        setInputValue(sym);
        setSearchItems([]);
    }

    const handleSearch = async ()=>{
        //console.log(inputValue);
        console.log(inputValue.trim())
        const enteredValue = inputValue.trim();
        if(enteredValue)
        {
            const isValidCompany = await symbolSearch(enteredValue);
            if(isValidCompany.length>0)
            {
                props.search(isValidCompany[0])
            }
            else{
                // implement for random company or ticker search
            }
            // const isEnteredValueValid = await companyData(enteredValue);
            // if(JSON.stringify(isEnteredValueValid) != '{}')
            // {
            //     props.search(isEnteredValueValid)
            // }
            // else{
            //     // implement for random company or ticker search
            // }
        }
        setSearchItems([]);
        setInputValue('');
    }

    // const companyData = async (e)=>{
    //     try{
    //         const response = await axios.get(baseUrl,{
    //             params:{
    //                 function:"OVERVIEW",
    //                 symbol:e,
    //                 entitlement:"realtime",
    //                 apikey:apiKey
    //             }
    //         });
    //         console.log(response.data)
    //         return response.data
            
        
    //     }
    //     catch(err){
    //         console.log(err)
    //     }
    // }

    const symbolSearch = async (company)=>{
        try{
        const response = await axios.get(baseUrl,{
             params:{
                function: "SYMBOL_SEARCH",
                keywords: company,
                apikey:apiKey
            }})
            //console.log(response);
            const result = response.data.bestMatches.filter(a=>a['4. region']=="United States"&&a['3. type']=="Equity").map(e=>{return {
                            ticker: e['1. symbol'],
                            company: e['2. name']}})
            console.log(result);
            return result;
        }
        catch(err){
            console.log(err)
        }
    }
    const handleChange = async (e)=>{
        const company = e.target.value.trim();
        setInputValue(e.target.value)
        if(company.length>2)
        {
            // const response = await axios.get(baseUrl,{
            //  params:{
            //     function: "SYMBOL_SEARCH",
            //     keywords: company,
            //     apikey:apiKey
            // }})
            // //console.log(response);
            // const result = response.data.bestMatches.filter(a=>a['4. region']=="United States"&&a['3. type']=="Equity").map(e=>{return {
            //                 ticker: e['1. symbol'],
            //                 company: e['2. name']}})
            const result = await symbolSearch(company);
            console.log(result);
            if(result.length>0){
                const suggestion = result.map((s,i)=>{
                    return (<div className={`${s.ticker} suggestion`} key={i} onClick={handleClick}><div className={`${s.ticker} leftAlign`}>{s.ticker}</div><div className={`${s.ticker} rightAlign`}>{s.company}</div></div>)
                })
                console.log(suggestion)
                setSearchItems(suggestion);
            }
        }
        else{
            setSearchItems([]);
        }
    }
    return (<div className="tbSuggestParent">
    <input type="text" id="search-input" placeholder="ticker or company" size={300} onChange={handleChange} value={inputValue}/>
    <button onClick={handleSearch}>Search</button>
    <div id="suggestions-container">
      {searchItems}
    </div>
  </div>)
}

export default SearchBar;