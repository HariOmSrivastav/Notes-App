require("dotenv").config();

const config = require('./config.json')
const mongoose = require("mongoose")

mongoose.connect(config.connectionString)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err.message);
  });

const User = require("./models/user.model")
const Note = require("./models/note.model")


const express = require('express')

const cors = require('cors');
// const { default: mongoose } = require("mongoose");

const app = express();

const jwt = require('jsonwebtoken')
const { authenticateToken } = require("./utilities");
const userModel = require("./models/user.model");

app.use(express.json()) ;

app.use(
    cors({
        origin : "*",
    })
)

app.get("/" , (req,res)=>{
    res.json({data: "hello"});
});

//Create Account
app.post("/create-account" , async(req,res)=>{

    const { fullName, email, password } = req.body;

    if(!fullName){
        return res.status(400).json({error : true , message : "Full Name is Required"});
    }

    if(!email){
        return res.status(400).json({error : true , message : "Email is Required"})
    }

    if(!password){
        return res.status(400).json({error : true , message: "Password is Required"})
    }

    const isUser = await User.findOne({email : email});

    if(isUser){
        return res.json({
            error: true,
            message : "User Already Exist",
        })
    }

    const user = new User({
        fullName,
        email,
        password,
    })

    await user.save();

    const accessToken = jwt.sign({user} , process.env.ACCESS_TOKEN_SECRET,{
        expiresIn : "3600m"
    })

    return res.json({
        error : false,
        user,
        accessToken,
        message : "Registration Successful"
    })

})

//Login
app.post("/login" , async(req,res) => {
    const {email , password} = req.body ;

    if(!email){
        return res.status(400).json({message : "Email is required"})
    }

    if(!password){
        return res.status(400).json({message : "Password is required"})
    }

    const userInfo = await User.findOne({email})
    if(!userInfo){
        return res.status(400).json({message : "User not Found"})
    }

    if(userInfo.email === email && userInfo.password === password){
        const user = {user : userInfo};
        const accessToken = jwt.sign(user , process.env.ACCESS_TOKEN_SECRET,{
            expiresIn : "3600m"
        });

        return res.json({
            error : false,
            message : "Login Successful",
            email,
            accessToken,
            user : userInfo
        })
    }
    else{
        return res.status(400).json({
            error : true,
            message : "Invalid Credentials"
        })
    }

})

//Get User
app.get("/get-user" ,authenticateToken, async(req,res)=>{
    const {user} = req.user;

    const isUser = await User.findOne({_id : user._id})

    if(!isUser){
        return res.sendStatus(401)
    }

    return res.json({
        user : {
             fullName : isUser.fullName ,
             email : isUser.email ,
             _id : isUser._id ,
             createdOn : isUser.createdOn,},
        message : "",
    })
})

//Add-Note
app.post("/add-note", authenticateToken, async(req, res) => {
    const { title, content, tags } = req.body;
    const { user } = req.user;
    
    if(!title) {
        return res.status(400).json({error: true, message: "Title is required"});
    }

    if(!content) {
        return res.status(400).json({error: true, message: "Content is Required"});
    }

    try {
        console.log("User from token:", user); // Debug log
        
        if (!user._id) {
            return res.status(400).json({
                error: true,
                message: "User ID not found in token"
            });
        }

        const note = new Note({
            title,
            content,
            tags: tags || [],
            userId: user._id,
        });

        const savedNote = await note.save();
        console.log("Saved note:", savedNote); // Debug log

        return res.json({
            error: false,
            note: savedNote,
            message: "Note added successfully"
        });
    } catch(error) {
        console.error("Error details:", error); // Detailed error logging
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
            details: error.message  // Adding error details to response
        });
    }
});

//Edit Note
app.put("/edit-note/:noteId", authenticateToken, async(req, res) => {
    const noteId = req.params.noteId
    const {title, content , tags , isPinned} = req.body;
    const {user}  = req.user

    if(!title && !content && !tags){
        return res.status(400).json({error : true , message : "No changes provided"});
    }

    try{
        const note = await Note.findOne({_id : noteId , userId : user._id})

        if(!note){
            return res.status(400).json({error : true  , message : 'Note not found'})
        }

        if (title) note.title = title;
        if (content) note.content = content;
        if (tags) note.tags = tags ;
        if (isPinned) note.isPinned = isPinned;

        await note.save();

        return res.json({
            error : false,
            note,
            message : "Note Updated Successfully"
        })
    }catch(error){
        return res.status(500).json({
            error : true,
            message : "Internal Server Error",
        })
    }
})

//Get All Notes
app.get("/get-all-notes" , authenticateToken , async(req,res)=>{
   const {user} = req.user;

   try{
    const notes = await Note.find({userId : user._id}).sort({isPinned : -1});

    return res.json({
        error : false,
        notes,
        message : "All Notes retrieved successfully",
    });
   }catch(error){
    return res.status(500).json({
        error : true,
        message : "Internal Server Error"
    })
   }
})

//Delete All Notes 
app.delete("/delete-note/:noteId" , authenticateToken , async(req,res)=>{
    const noteId = req.params.noteId;
    const {user} = req.user

    try{
        const note = await Note.findOne({_id : noteId , userId : user._id});
        
        if(!note){
            return res.status(404).json({error : true , message : "Note not found"})
        }

        await Note.deleteOne({_id : noteId , userId : user._id})

        return res.json({
            error : false,
            message : "Note deleted successfully"
        })
    }catch(error){
        return res.status(500).json({
            error : true,
            message : "Internal Server Error"
        })
    }
})

//Upadate isPinned Value
app.put("/update-note-pinned/:noteId" , authenticateToken , async(req,res)=>{

    // const { title, content, tags } = req.body;
    const noteId = req.params.noteId;
    const {isPinned} = req.body;
    const {user} = req.user;

    // if(!title && !content && !tags){
    //     return res.status(400).json({error : true , messsage : "No changes provided"})
    // }

    try{

        const note = await Note.findById({_id : noteId , userId : user._id})

        if(!note){
            return res.status(400).json({error : true , message : "Note not found" })
        }

        note.isPinned = isPinned;

        await note.save()
        
        return res.json({
            error : false,
            note,
            message : "Note Updated Successfully"
        })

    }catch(error){
        return res.status(500).json({
            error : true,
            message : "Internal Server Error"
        })
    }

})

// Search Notes
app.get("/search-notes" , authenticateToken , async(req,res)=>{
    const {user} = req.user ;
    const {query} = req.query ;

    if(!query){
        return res.status(400).json({error : true , message : "Search Query is required"});
    }

    try{
        const matchingNotes = await Note.find({
            userId : user._id,
            $or : [
                {title: { $regex : new RegExp(query,"i")}},
                {content : {$regex : new RegExp(query, "i")}},
            ]  
        })
        return res.json({
            error : false,
            notes : matchingNotes,
            message : "Notes matching the search query retrieved successfully",
        })
    }catch(error){
        return res.status(500).json({
            error : true,
            message : "Internal Server Error",
        }) 
    }
})

app.listen(8000 , ()=>{
    console.log("Server Running on the port 8000")
});

module.exports = app;