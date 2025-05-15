
import mongoose, {Schema} from "mongoose";

const userSchema = new Schema({
    usernmae:{
        type:Stirng,
        required:true,
        unique:true,
        trim:true,
        index:true,
        lowercase:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true,
    },
   fullname: {
        type:String,
        required:true,
        trim:true,
        index:true,
    },
    password:{
        type:String,
        required:true,
    },
    avtar:{
        type:String,
        
    }
},{timestamps:true})


export const user = mongoose.model('User',userSchema )