import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import UserStockData from './UserStockDetails';
import SearchBar from './SearchBar';
import UserSearch from './UserSearch';
import "./User.css";


const User = () => {
  const location = useLocation();
  const { user } = location.state || {}; // fallback in case of direct access
  const [roiData, changeRoiData] = useState('')
  const [searchedData, setSearchedData] = useState(false)
  const [symbol, setSymbol] = useState('');

  if (!user) return (
  <div className="grid-container">
    <h3>ticker</h3>
    <h3>currentRate</h3>
    <div><button>Buy</button></div>
    <div>
        <div>quantity @ average</div>
        <div>quantity * average</div>
    </div>
    <div>
        <div>profit/loss</div>
        <div>quantity*(profit/loss)</div>
    </div>
    <div><button>Sell</button></div>
    </div>
  );

  console.log(user);

  function Investment(props){
    changeRoiData(`Your return on Investment is ${props}`);
  }

  function TickerSearch(props){
    console.log(props)
    setSymbol(props);
    setSearchedData(true);
  }

  function RemoveTickerSearch(){
    setSearchedData(false);
  }

  return (
    <div>
      <h1>Hi {user.name}!</h1>
      <SearchBar search={TickerSearch}/>
      <div className='stockData'>
        {/* <div className='storedData'>
          <h2>{roiData}</h2>
          { (user.data.length===0) ? <p>you do not have any stock</p> : <UserStockData stockDetails={user.data} invest={Investment}/>}
        </div> */}
        {(searchedData) ? <UserSearch stockDetails={user.data} companyDetails={symbol} removeData={RemoveTickerSearch}/>: <div className='storedData'>
          <h2>{roiData}</h2>
          { (user.data.length===0) ? <p>you do not have any stock</p> : <UserStockData stockDetails={user.data} invest={Investment} search={TickerSearch}/>}
        </div>}
        {/* <div className='searchData'>{searchedData && <UserSearch companyDetails={symbol} />}</div> */}
      </div>
    </div>
  );
};

export default User;