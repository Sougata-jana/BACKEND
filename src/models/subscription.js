import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({
subscriber:{
    type:Schema.Types.ObjectId, // one who is subscribing
    ref:"User",
    required:true
},
chanel:{
    trype:Schema.Types.ObjectId, // the channel being subscribed to
    ref:"User",
    required:true
}
},{Timestamps:true})

export const subscription = mongoose.model("subscription", subscriptionSchema)