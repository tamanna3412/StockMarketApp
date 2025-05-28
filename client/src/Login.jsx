import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

function LoginSection(){

    const [incorrectPassword, setIncorrectPassword] = useState({invisibility:true,message:''});
    const [[userId,pass],setFormValue] = useState(['',''])
    const [register, setRegister] = useState(false)
    const [passCheck, setPassCheck] = useState(true)
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

                if(checkResponse.error!==''){
                    setIncorrectPassword({invisibility:false, message:'Invalid Credentials'});        
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

    async function RegisterUserCheck(event){
        event.preventDefault();
        const FirstName = document.getElementById('FirstName')
        const LastName = document.getElementById('LastName')
        const Email = document.getElementById('Email')
        const UserName = document.getElementById('UserID')
        const Password = document.getElementById('PassID')
        const ConfirmPassword = document.getElementById('ConfirmPassword')
        
        if(Password.value!==ConfirmPassword.value)
        {
            setPassCheck(false)
            ConfirmPassword.value=''
        }
        else{
            setPassCheck(true)
            // call backend
            const requestBody = {
                FirstName : FirstName.value,
                LastName : LastName.value,
                Email : Email.value,
                UserName : UserName.value,
                PassWord : Password.value
            }
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            const registerUser = await fetch('http://localhost:3000/register',{
                method: 'POST',
                credentials: 'include',
                headers:myHeaders,
                body: JSON.stringify(requestBody)
            })
            const response = await registerUser.json();
            console.log(response);
            if(response.error!==''){
                setIncorrectPassword({invisibility:false, message:`${response.error}`})
            }
            else{
                navigate("/user")
            }
        }
    }

    function RegisterationForm(){
        setRegister(true)
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
    <div hidden={incorrectPassword.invisibility} style={{color:'red'}}><p>{incorrectPassword.message}</p></div>
    <div><button type="submit">Sign In</button></div>
    </form>
    {/* <p>or continue with</p>
    <button>Google</button> */}
    <p>Not Registered? <a href="#" onClick={RegisterationForm}>Register Now</a></p>
</div>)
:
(<div>
    <form onSubmit={RegisterUserCheck}>
        <div>
            <div>
            <label htmlFor="FirstName">First Name </label>
            <input type="text" placeholder="First Name" id="FirstName" name="FirstName" autoComplete="false" required/>
            </div>
            <div>
            <label htmlFor="LastName">Last Name </label>
            <input type="text" placeholder="Last Name" id="LastName" name="LastName" autoComplete="false" required/>
            </div>
            <div>
            <label htmlFor="Email">Email </label>
            <div><input type="text" placeholder="Email" id="Email" name="Email" autoComplete="false" required/></div>
            </div>
            <div>
            <label htmlFor="UserID">Username </label>
            <input type="text" placeholder="Username" id="UserID" name="Username" autoComplete="false" required/>
            </div>
            <div>
            <label htmlFor="PassID">Password </label>
            <input type="password" placeholder="Password" id="PassID" name="Password" autoComplete="false" required/>
            </div>
            <div>
            <label htmlFor="ConfirmPassword">Confirm Password </label>
            <input type="password" placeholder="Confirm Password" id="ConfirmPassword" name="ConfirmPassword" autoComplete="false" required/>
            </div>
            <p id="PasswordCheck" hidden={passCheck} style={{color:'red'}}>Passwords do not match!</p>
            <br></br>
            <div><button type="submit">Register</button></div>
        </div>
        </form>
</div>)
)
}

export default LoginSection;