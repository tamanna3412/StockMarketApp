import React, {useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import "./UserSearch.css"

function UserSearch(props){

    const [intraDay, setIntraDay] = useState({});
    const [apiResponseOne, setApiResponseOne] = useState(false);
    const [apiResponseTwo, setApiResponseTwo] = useState(false);
    const [buttonClick, setButtonClick] = useState(false);
    const [companyInfo, setCompanyInfo] = useState({})
    const [transaction, setTransaction] = useState('');
    const [confirmation, askConfirmation] = useState('');
    const [finalRate, setFinalRate] = useState(0);
    const navigate = useNavigate();
    const apiKey = import.meta.env.VITE_APP_API_KEY;
    const baseUrl = import.meta.env.VITE_APP_API_BASE_URL;
    const backendBaseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL;

    const companyRealTimeData = async (e)=>{
        try{

        const response = await axios.get(baseUrl,{
            params:{
                function:"REALTIME_BULK_QUOTES",
                symbol:e,
                entitlement:"realtime",
                apikey:apiKey
            }
        });
        console.log(response.data)
        let data = response.data.data[0];
        if(JSON.stringify(data) != '{}')
        {
            setIntraDay(()=>{
                return ({
                    close : (data.close =='')?parseFloat(data.previous_close):parseFloat(data.close),
                    open : data.open,
                    high : data.high,
                    low : data.low,
                    change : data.change,
                    changePercent : data.change_percent
                })
            })
            setApiResponseTwo(true);
        }

        }
        catch(err){
            console.log(err);
        }

    }

    const companyData = async (e)=>{
        try{
            const response = await axios.get(baseUrl,{
                params:{
                    function:"OVERVIEW",
                    symbol:e,
                    entitlement:"realtime",
                    apikey:apiKey
                }
            });
            console.log(response.data)
            if(JSON.stringify(response.data) != '{}')
            {
                setCompanyInfo(response.data)
                setApiResponseOne(true);
            }
            else{
                removeData();
            }


        }
        catch(err){
            console.log(err)
        }
    }

    function removeData(){
        props.removeData();
    }

    function PortfolioStock(){
        const stock = props.stockDetails.data.find(e => e.ticker===companyInfo.Symbol)
        if(stock){
            return (<div>
            <div>
                <div>Total Invested : {stock.shares*parseFloat(stock.average_amount.slice(1))} ({stock.shares} @ {stock.average_amount})</div>
                <div>Current Value : {stock.shares*intraDay.close}</div>
            </div>
            {(buttonClick) ? Transact(): (<div><button onClick={handleClick}>Buy</button><span>     </span><button onClick={handleClick}>Sell</button></div>)}
            </div>)
        }
        else{
            return (<div>
                {(buttonClick)? Transact():(<div><button onClick={handleClick}>Buy</button></div>)}
            </div>)
        }
    }

    useEffect(()=>{

        companyRealTimeData(props.companyDetails.ticker);
        companyData(props.companyDetails.ticker)
        setButtonClick(false)
        setTransaction('');
        askConfirmation('')
        setFinalRate(0);

        const intervalId = setInterval(() => {
            companyRealTimeData(props.companyDetails.ticker);
        }, 60 * 1000); // 1 minute

        return () => clearInterval(intervalId);
    },[props])

    useEffect(()=>{

        onShareChange()

    },[intraDay, companyInfo])

    function handleClick(e){
        console.log(e.target.innerText);
        setTransaction(e.target.innerText)
        setButtonClick(true);
    }

    async function updateBackend(e){
        e.preventDefault();
        try{
            // call backend
            const requestBody = {
                email : props.stockDetails.email,
                company : companyInfo.Name,
                ticker : companyInfo.Symbol,
                newShares : e.target[0].value,
                newAmount : finalRate,
                transaction : transaction
            };

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            const stock = props.stockDetails.data.find(e => e.ticker===requestBody.ticker);
            let method;
            if(transaction==='Buy'){
                if(stock){
                    method = 'PATCH'
                }
                else{
                    method = 'POST'
                }
                console.log(requestBody)
                const editStock = await fetch(`${backendBaseUrl}/buy`,{
                        method: method,
                        credentials: 'include',
                        headers:myHeaders,
                        body: JSON.stringify(requestBody)
                })
                const respnse = await editStock.json();
                navigate('/')
            }
            else{
                let method;
                if(stock.shares==requestBody.newShares){
                    method = 'DELETE'
                }
                else{
                    method = 'PATCH'
                }
                const editStock = await fetch(`${backendBaseUrl}/sell`,{
                        method: method,
                        credentials: 'include',
                        headers:myHeaders,
                        body: JSON.stringify(requestBody)
                })
                const respnse = await editStock.json();
                navigate('/')
            }
        }
        catch(err)
        {
            console.log(err);
        }
    }

    function onShareChange()
    {

        const inputValue = document.getElementById('quantity');
        if(inputValue){
            console.log(inputValue.value);

            let newRate = intraDay.close;
            let shares = inputValue.value;
            let average = newRate * shares;
            let company = companyInfo.Symbol;
            let prefix = transaction;
            setFinalRate(intraDay.close);
            if(transaction==='Buy')
            {
                if(inputValue.value>=1&&inputValue.value<=500){   
                    askConfirmation(`${prefix} ${shares} ${company} for $${(average).toFixed(2)} (1 @ ${newRate}) ?`)
                }
                else askConfirmation('');
            }
            else{
                let max = props.stockDetails.data.find(e => e.ticker===companyInfo.Symbol).shares
                if(inputValue.value>=1&&inputValue.value<=max){
                    askConfirmation(`${prefix} ${shares} ${company} for $${(average).toFixed(2)} (1 @ ${newRate}) ?`)
                }
                else askConfirmation('');
            }
        }
    }

    function handleCancel(){
        askConfirmation('');
        setButtonClick(false)
    }

    function Transact(){
        let maximum = 500;
        (transaction==='Sell') && (maximum = props.stockDetails.data.find(d => d.ticker===companyInfo.Symbol).shares)
        return (<div><form onSubmit={updateBackend}>
            <label htmlFor="quantity">Quantity: </label>
            <input type="number" min="1" max={maximum} id="quantity" name="quantity" placeholder="No of Shares" onChange={onShareChange} required/><br />
            <p>{confirmation}</p>
            <button type="submit">{transaction}</button></form><button className="cancelButton" onClick={handleCancel}>Cancel</button>
            </div>)
    }
    if(apiResponseOne && apiResponseTwo){
        return (
            <div className="Details">
                <button id = "x" onClick={removeData}>X</button>
                <h4>{companyInfo.Name}</h4>
                <p>{companyInfo.Exchange} : {companyInfo.Symbol}</p>
                <h3>{intraDay.close} <span className="noBold">{companyInfo.Currency}</span></h3>
                <p>{intraDay.change} ({intraDay.changePercent}%)</p>
                <br></br>
                <div className="userSearchGrid">
                    <div className="entryGrid">
                        <div>open : {intraDay.open}</div>
                        <div>high : {intraDay.high}</div>
                        <div>low : {intraDay.low}</div>
                    </div>
                    <div className="entryGrid">
                        <div>52-wk-high : {companyInfo['52WeekHigh']}</div>
                        <div>52-wk-low : {companyInfo['52WeekLow']}</div>
                        <div>Div Yield : {companyInfo['DividendYield']}</div>
                    </div>
                    <div className="entryGrid">
                        <div>Mkt cap : {companyInfo['MarketCapitalization']}</div>
                        <div>P/E Ratio : {companyInfo['PERatio']}</div>
                        <div>EBITDA : {companyInfo['EBITDA']}</div>
                    </div>
                </div>
                <br></br>
                {
                    PortfolioStock()
                }
            </div>
        );
    }
}



export default UserSearch;