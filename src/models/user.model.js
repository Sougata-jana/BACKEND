import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
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
    avtar:{
        type:String, //cloudinary url
        required:true,
    },
    coverImage:{
        tpye:String, //cloudinary url
    },
    watchHistroy:{
        type:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ]
    },
    password:{
        type:String,
        required:[true, "password is required"],
    },
    refreshtoken:{
        type:String
    }
},{timestamps:true})


userSchema.pre("save", async function (next){
    if(!this.isModified("password"))  return next()

        this.password = await bcrypt.hash(this.password, 10)
        next()
})

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    jwt.sign(
        {
            _id : this._id,
            email: this.email,
            usernmae: this.usernmae,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
           expiresIn: process.env.ACCESS_TOKEN_SECRET_EXPIRES
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    jwt.sign(
        {
            _id : this._id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
           expiresIn: process.env.REFRESH_TOKEN_SECRET_EXPIRES
        }
    )
}
export const user = mongoose.model('User',userSchema )