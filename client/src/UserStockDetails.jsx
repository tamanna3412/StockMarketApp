import React, {useEffect, useState} from "react";
import axios from "axios";

function UserStockData(props){

    const tickers = props.stockDetails.map(e => e.ticker).join(',');
    const [stateData, changeData] = useState([]);
    const [apiData, setApiData] = useState(false)
    const apiKey = import.meta.env.VITE_APP_API_KEY;
    const baseUrl = import.meta.env.VITE_APP_API_BASE_URL;

    const retriveData = async (e) =>{
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
            
            let ri = 0;
            let decimalPlace = 0
            let decimalP = 0
            changeData(props.stockDetails.map(t=>{
                let realTimeData = response.data.data.find(e => e.symbol==t.ticker)
                let currentRate = (realTimeData.close == '') ? parseFloat(realTimeData.previous_close):parseFloat(realTimeData.close)
                //decimalPlaceC = Math.max(currentRate.toString().split(".")[1].length,0)
                let decimalPlaceC = currentRate.toString().split(".")[1]
                decimalPlace = (decimalPlaceC)?decimalPlaceC.length:0
                decimalP = Math.max(decimalP, decimalPlace);
                let change = currentRate - parseFloat(t.average_amount.slice(1))
                let invested = t.shares * parseFloat(t.average_amount.slice(1))
                let totalChange = change*t.shares
                ri = ri+totalChange;
                return ({
                    ticker: t.ticker,
                    average: t.average_amount.slice(1), 
                    shares: t.shares,
                    invested: invested,
                    currentRate: currentRate,
                    change : change.toFixed(decimalPlace),
                    totalChange : totalChange.toFixed(decimalPlace)
                })
            }))


            props.invest(ri.toFixed(decimalP))
            setApiData(true);
        }
        catch(err)
        {
            console.log(err);
        }
    }

    useEffect(()=>{

        retriveData(tickers);

        const intervalId = setInterval(() => {
            retriveData(tickers);
        }, 60 * 1000); // 5 minutes
      
        return () => clearInterval(intervalId); 
    },[])

    function handleInfo(t){
        //event.preventDefault();
        console.log(t)
        props.search({ticker: t, company:''});

    }
    if(apiData)
    {
        return (<div>
            {
                stateData.map((e,i)=>{
                    return (<div className="grid-container" key={i}>
                <h3 className="rowOne">{e.ticker}</h3>
                <h3 className="rowTwo">{e.currentRate}</h3>
        
                <div id="info"><button onClick={()=>{handleInfo(e.ticker)}}>Info</button></div>
                <div className="rowOne">
                    <div>{e.shares} @ {e.average}</div>
                    <div>{e.invested}</div>
                </div>
                <div className="rowTwo">
                    <div>{e.change}</div>
                    <div>{e.totalChange}</div>
                </div>
                {/* <div><button>Sell</button></div> */}
                </div>)
                })
            }
        </div>)
    }

}

export default UserStockData;