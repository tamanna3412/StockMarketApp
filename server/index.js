import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import session from "express-session";
import env from "dotenv";

env.config();

const app = express();
const port = 3000;

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

db.connect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      secure: false,
      sameSite: 'Lax',
      maxAge: 1000 * 60 * 60 * 1     
    })
);
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Credentials", true);
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
});

function isEmpty(obj) {
    for (const prop in obj) {
      if (Object.hasOwn(obj, prop)) {
        return false;
      }
    }
  
    return true;
}

app.get("/checkLoggedInUser", (req, res)=>{
  if(req.session.isLoggedIn){
    res.send({isLoggedIn:true, user:req.session.user});
  }
  else{
  res.send({isLoggedIn:false})}
})

app.get("/login", async (req, res)=>{
    
    const response = {error:'',name:'',email:'',isLoggedIn:false}
    try
    {
        // fetch name and email for given username and password
        const result = await db.query("SELECT email, name from credentials WHERE (username,password) in (($1,$2))",[req.query.username,req.query.password]);
        
        if(result.rows.length===1)
        {
          response.name = result.rows[0]['name'];
          response.email = result.rows[0]['email'];
          response.isLoggedIn = true;
          req.session.isLoggedIn = true;
          req.session.user = {name:response.name, email:response.email}
        }
        else
        {
            response.error = 'Username and Password not found';
        }
    }
    catch(err){
      console.log(err);
    }

    res.send(response)
});

app.post("/register", async(req, res)=>{
    try{
    console.log("post register request")
    let reqBody = req.body;
    let respnseMessage = {error:'',name:'',email:'',isLoggedIn:false}
    if(!(isEmpty(reqBody))){
        const checkIfExist = await db.query("SELECT username,email from credentials WHERE username = $1 OR email = $2",[reqBody.UserName, reqBody.Email])
        console.log("rowCount : "+checkIfExist.rowCount)
        
        if(checkIfExist.rowCount===0){
            const newUser = await db.query('INSERT INTO credentials (name, username, password, email) VALUES ($1,$2,$3,$4) RETURNING *',[`${reqBody.FirstName} ${reqBody.LastName}`,reqBody.UserName, reqBody.PassWord, reqBody.Email])
            if(newUser.rows.length===1){
                console.log(newUser.rows[0])
                respnseMessage.name = newUser.rows[0].name
                respnseMessage.email = newUser.rows[0].email
                respnseMessage.isLoggedIn = true
                req.session.isLoggedIn = true;
                req.session.user = {name:respnseMessage.name, email:respnseMessage.email}   
            }
        }
        else{
            let sqlResponse = checkIfExist.rows[0]
            if(sqlResponse.username===reqBody.UserName){
                respnseMessage.error = 'Username not available'
            }
            else{
                respnseMessage.error = 'Email already registered'
            }
        }
        
    }
    else respnseMessage.error = 'Request body is empty'
    res.send(respnseMessage)
    }
    catch(err){
        console.log(err);
    }
});

app.get("/user",async (req,res)=>{
    try
    {
        if(req.session.isLoggedIn){
            const email = req.session.user.email
            const queryTable = await db.query('SELECT * from Equity WHERE email = $1',[email]);
            if(queryTable.rowCount !=null)
            {
                res.send({email:email, name:req.session.user.name, data : queryTable.rows, isLoggedIn:true})
            }
        }
        else{
            res.send({isLoggedIn:false})
        }
    }
    catch(err)
    {
        console.log(err);
    }
})

app.get("/logout", (req, res) => {
    req.session.destroy((err)=>{
      if(err)
      console.log(err)
      else
      {
        res.send({result:"ok"})
      }
    })
});

app.post("/buy", async (req, res)=>{
    try{    
        if(req.session.isLoggedIn)
        {
            if(!(isEmpty(req.body)))
            {
                const addNewData = await db.query("INSERT INTO equity (email, company, ticker, shares, average_amount) VALUES ($1,$2,$3,$4,$5)",[req.body.email,req.body.company, req.body.ticker, req.body.newShares, req.body.newAmount]);
                if(addNewData.rowCount===1)
                {
                    res.send({isLoggedIn:true, result:'success'})
                }
            }
            else{
                res.send({isLoggedIn:true, result:'failure: empty request body'})
            }
        }
        else{
        // go to homepage
        res.send({isLoggedIn:false})
        }
    }
    catch(err){
      console.log(err);
    }
})

app.patch("/buy", async (req, res)=>{
    try{    
        if(req.session.isLoggedIn)
        {
            if(!(isEmpty(req.body)))
            {
                const fetchData = await db.query("SELECT shares, average_amount from equity WHERE email = ($1) AND ticker = ($2)",[req.body.email, req.body.ticker])
                const prevData = fetchData.rows[0]
                let prevAmount = prevData.average_amount.slice(1)
                let newShares = req.body.newShares*1 + prevData.shares*1
                let newAmount = ((prevData.shares*prevAmount + req.body.newShares*req.body.newAmount)/newShares).toFixed(2)
                
                const updateData = await db.query("UPDATE equity SET shares = $1, average_amount = $2 WHERE ticker = $3 AND email = $4",[newShares, newAmount, req.body.ticker, req.body.email])
                if(updateData.rowCount===1)
                {
                    res.send({isLoggedIn:true, result:'success'})
                }
            }
            else{
                console.log("empty body")
                res.send({isLoggedIn:true, result:'failure: empty request body'})
            }
        }
        else{
        // go to homepage
        res.send({isLoggedIn:false})
        }
    }
    catch(err){
      console.log(err);
    }
})

app.patch("/sell", async (req, res)=>{
    try{    
        if(req.session.isLoggedIn)
        {
            if(!(isEmpty(req.body)))
            {
                const fetchData = await db.query("SELECT shares from equity WHERE email = ($1) AND ticker = ($2)",[req.body.email, req.body.ticker])
                const prevData = fetchData.rows[0]
                let newShares = prevData.shares*1 - req.body.newShares*1
                
                const updateData = await db.query("UPDATE equity SET shares = $1 WHERE ticker = $2 AND email = $3",[newShares, req.body.ticker, req.body.email])
                if(updateData.rowCount===1)
                {
                    res.send({isLoggedIn:true, result:'success'})
                }
            }
            else{
                res.send({isLoggedIn:true, result:'failure: empty request body'})
            }
        }
        else{
        // go to homepage
        res.send({isLoggedIn:false})
        }
    }
    catch(err){
      console.log(err);
    }
})

app.delete("/sell", async (req, res)=>{
    try{    
        if(req.session.isLoggedIn)
        {
            if(!(isEmpty(req.body)))
            {
                const removeData = await db.query("DELETE from equity WHERE email = ($1) AND ticker = ($2)",[req.body.email, req.body.ticker]);
                if(removeData.rowCount===1)
                {
                    res.send({isLoggedIn:true, result:'success'})
                }
            }
            else{
                res.send({isLoggedIn:true, result:'failure: empty request body'})
            }
        }
        else{
        // go to homepage
        res.send({isLoggedIn:false})
        }
    }
    catch(err){
      console.log(err);
    }
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});