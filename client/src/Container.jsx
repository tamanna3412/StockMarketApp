import React, {useEffect, useState} from "react";
import axios from "axios";
import LoginSection from "./Login";
import "./app.css";

function Container(){
    const [apiResOne, setApiResOne] = useState(false);
    const [apiResTwo, setApiResTwo] = useState(false);
    const [[topGainers, topLosers, highestTraded], setTopGainers] = useState([[],[],[]]);
    const [tickerData, setTickerData] = useState([]);
    const apiKey = import.meta.env.VITE_APP_API_KEY;
    const baseUrl = import.meta.env.VITE_APP_API_BASE_URL;

    const tryGettingData = async ()=>{
        try{
            const response = await axios.get(baseUrl,{
                params:{
                    function: "TOP_GAINERS_LOSERS",
                    apikey :apiKey
                }
            });

            let trending = response.data
            console.log(trending)
            if(trending){
                let tg = trending.top_gainers.slice(0,5).map(e=> {
                    return ({
                        ticker : e.ticker.replace(/[^a-zA-Z ]/g, ""),
                        close : e.price
                    })
                })
                let tl = trending.top_losers.slice(0,5).map(e=> {
                    return ({
                        ticker : e.ticker.replace(/[^a-zA-Z ]/g, ""),
                        close : e.price
                    })
                })
                let ht = trending.most_actively_traded.slice(0,5).map(e=> {
                    return ({
                        ticker : e.ticker.replace(/[^a-zA-Z ]/g, ""),
                        close : e.price
                    })
                })

                setTopGainers([tg, tl, ht])
                setApiResOne(true)
            }
        }
        catch(err){
        console.log(err);
        }
    }

    const realTimeData = async (ss)=>{
        try{
            console.log("symbol: "+ss)
            const response = await axios.get(baseUrl,{
                params:{
                    function:"REALTIME_BULK_QUOTES",
                    symbol:ss,
                    entitlement:"realtime",
                    apikey:apiKey
                }
            });
            // let realData = response.data.data;
            let realData = response.data;
            console.log(realData)
            if(realData)
            {
                realData = realData.data;

                if(realData.length>0)
                {

                    setTickerData(()=>{
                        return (realData.map((e)=> {
                            return ({
                                ticker : e.symbol,
                                close : e.close
                            })
                        }))
                    })

                    let topG = topGainers.map(e=>{
                        let price = realData.find(d => d.symbol===e.ticker)
                        if(price != null){
                            let close = (price.close==="")? price.previous_close:price.close;
                         return ({
                            ticker : e.ticker,
                            close : close
                        })}
                        else{
                        return ({
                            ticker : e.ticker,
                            close : e.close
                        })}
                    })

                    let topL = topLosers.map(e=>{
                        let price = realData.find(d => d.symbol===e.ticker)
                        if(price != null){
                            let close = (price.close==="")? price.previous_close:price.close;
                         return ({
                            ticker : e.ticker,
                            close : close
                        })}
                        else{
                        return ({
                            ticker : e.ticker,
                            close : e.close
                        })}
                    })

                    let topHT = highestTraded.map(e=>{
                        let price = realData.find(d => d.symbol===e.ticker)
                        if(price != null){
                            let close = (price.close==="")? price.previous_close:price.close;
                         return ({
                            ticker : e.ticker,
                            close : close
                        })}
                        else{
                        return ({
                            ticker : e.ticker,
                            close : e.close
                        })}
                    })

                    setTopGainers([topG,topL,topHT])

                    setApiResTwo(true)
                }
            }
        }
        catch(err){
            console.log(err);
        }
    }


    useEffect(()=>{
        tryGettingData();
    },[]);

    useEffect(()=>{
        let ss = topGainers.map(t=>t.ticker).join(',') +","+ topLosers.map(t=>t.ticker).join(',') +","+ highestTraded.map(t=>t.ticker).join(',')
        console.log("UseEffect")
        realTimeData(ss);
        const intervalId = setInterval(() => {
            realTimeData(ss);
        }, 60 * 1000);
        return () => clearInterval(intervalId);
    },[apiResOne]);

    if(apiResTwo){
    return(
    <div className="container">
        <div className="heading market">
            <h1>Welcome to United States Stock Market Portfolio</h1>
            <div className="marketData">
                <div className="topGainer">
                <h3>Top Gainers</h3>
                {
                topGainers.map((e, i)=> <div key={i}>{e.ticker} : {e.close}</div>)
                }
                </div>
                <div className="topLoser">
                <h3>Top Losers</h3>
                {
                topLosers.map((e, i)=> <div key={i}>{e.ticker} : {e.close}</div>)
                }
                </div>
                <div className="highestTraded">
                <h3>Highest Traded</h3>
                {
                highestTraded.map((e, i)=> <div key={i}>{e.ticker} : {e.close}</div>)
                }
                </div>
            </div>
        </div>
        <div className="login">
            <LoginSection />
        </div>
    </div>
    );
}
}

export default Container;