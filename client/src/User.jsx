import React, { useState , useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import UserStockData from './UserStockDetails';
import SearchBar from './SearchBar';
import UserSearch from './UserSearch';
import "./User.css";


const User = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({})
  const [roiData, changeRoiData] = useState('')
  const [serverResponse, setServerResponse] = useState(false)
  const [searchedData, setSearchedData] = useState(false)
  const [symbol, setSymbol] = useState('');
  const broadCast = import.meta.env.VITE_APP_PERSISTENT_SESSION
  const backendBaseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL;
  const channel = new BroadcastChannel(broadCast);

  async function UserDetails(){
    try{
      const userStock = await fetch(`${backendBaseUrl}/user`,{
        method: 'GET',
        credentials: 'include'
      })
      const checkResponse = await userStock.json();
      console.log(checkResponse)
      if(checkResponse.isLoggedIn){
        setUser({name:checkResponse.name, email: checkResponse.email, data:checkResponse.data})
        setServerResponse(true)
      }
      else{
        navigate('/');
      }
    }
    catch(err){
      console.log(err)
    }
  }

  useEffect(()=>{
    UserDetails();
  },[])

  useEffect(()=>{
    channel.onmessage = (event) => {
      if (event.data.type === 'LOGOUT') {
        setServerResponse(false)
        setUser({})
        navigate('/');
      } 
    };
  
    return () => channel.close();
  },[])

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

  async function logoutUser(){
    try{    
      const requestParameters = await fetch(`${backendBaseUrl}/logout`,{
        method: 'GET',
        credentials: 'include'
      })
  
      const checkResponse = await requestParameters.json();
      console.log(checkResponse);
      if(checkResponse.result==='ok'){
        setServerResponse(false)
        setUser({})
        channel.postMessage({type:'LOGOUT'});
        navigate('/');
      }
    }
    catch(error){
        console.log(error)
    }
  }

if(serverResponse){
  return (
    <div className='User'>
      <button className = "x" onClick={logoutUser}>logout</button>
      <h1>Hi {user.name}!</h1>
      <SearchBar search={TickerSearch}/>
      <div className='stockData'>
        {
          (searchedData) ? <UserSearch stockDetails={user} companyDetails={symbol} removeData={RemoveTickerSearch}/>: <div className='storedData'>
          <h2>{roiData}</h2>
          { (user.data.length===0) ? <p>you do not have any stock</p> : <UserStockData stockDetails={user.data} invest={Investment} search={TickerSearch}/>}</div>
        }
      </div>
    </div>
  );
}
};

export default User;