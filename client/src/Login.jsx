import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

function LoginSection(){

    const [incorrectPassword, setIncorrectPassword] = useState(true);
    const [[userId,pass],setFormValue] = useState(['',''])
    const [register, setRegister] = useState(false)
    const navigate = useNavigate();
    const backendBaseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL;

    const handleSubmit = async (e)=>{
        e.preventDefault();
        setIncorrectPassword(true);
        setFormValue(['','']);
        console.log(e.target.username.value)
        console.log(e.target.password.value)
        if(e.target.password.value)
        {
            try{    
                const requestParameters = await fetch(`${backendBaseUrl}/login?` + new URLSearchParams({
                    username: e.target.username.value,
                    password: e.target.password.value,
                }).toString(),{
                    method: 'GET',
                    credentials: 'include'
                })
            
                const checkResponse = await requestParameters.json();
                console.log(checkResponse);

                if(checkResponse.error!=''){
                    setIncorrectPassword(false);        
                }
                else{
                    navigate('/user');
                }
                
            }
            catch(error){
                console.log(error)
            }
        }
    }

    function RegisterationForm(){
        //setRegister(true)
        <form>
            <label htmlFor="FirstName">First Name </label>
            <input type="text" placeholder="First Name" id="FirstName" name="FirstName" autoComplete="false" required/>
            <label htmlFor="LastName">Last Name </label>
            <input type="text" placeholder="Last Name" id="LastName" name="LastName" autoComplete="false" required/>
            <label htmlFor="Email">Email </label>
            <input type="text" placeholder="Email" id="Email" name="Email" autoComplete="false" required/>
            <label htmlFor="UserName">Username </label>
            <input type="text" placeholder="First Name" id="FirstName" name="FirstName" autoComplete="false" required/>
            <label htmlFor="Password">Password </label>
            <input type="text" placeholder="First Name" id="FirstName" name="FirstName" autoComplete="false" required/>
            <label htmlFor="Ticker">ticker </label>
            <input type="text" placeholder="First Name" id="FirstName" name="FirstName" autoComplete="false" required/>
            <label htmlFor="Company">company </label>
            <input type="text" placeholder="First Name" id="FirstName" name="FirstName" autoComplete="false" required/>
            <label htmlFor="NofShares">No. of shares </label>
            <input type="text" placeholder="First Name" id="FirstName" name="FirstName" autoComplete="false" required/>
            <label htmlFor="Average">Average </label>
            <input type="text" placeholder="First Name" id="FirstName" name="FirstName" autoComplete="false" required/>
        </form>
    }




return(
    (!register) ? 
    (<div>
    <h4>Sign in to view your portfolio</h4>
    <form onSubmit={handleSubmit}>
    
    <label htmlFor="username">Username </label>
    <div>
    <input type="text" placeholder="username" id="username" name="username" onChange={e=> setFormValue([e.target.value,pass])} autoComplete="false" required/>
    </div>
    <label htmlFor="password">Password </label>
    <div>
    <input type="password" placeholder="password" id="password" name="password" onChange={e=> setFormValue([userId,e.target.value])} autoComplete="false"/>
    </div>
    {/* <a href="#">Forgot password?</a> */}
    <div hidden={incorrectPassword} style={{color:'red'}}><p>Invalid Credentials</p></div>
    <div><button type="submit">Sign In</button></div>
    </form>
    {/* <p>or continue with</p>
    <button>Google</button> */}
    <p>Not Registered? <a href="#" onClick={RegisterationForm}>Register Now</a></p>
</div>)
:
(<div></div>)

)
}

export default LoginSection;