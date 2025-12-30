import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const subscriptionSchema = new Schema({
subscriber:{
    type:Schema.Types.ObjectId, // one who is subscribing
    ref:"User",
    required:true
},
channel:{
    type:Schema.Types.ObjectId, // the channel being subscribed to
    ref:"User",
    required:true
},
notificationsEnabled:{
    type:Boolean,
    default:true // Enable notifications by default when subscribing
}
},{timestamps:true})

subscriptionSchema.plugin(mongooseAggregatePaginate)

export const Subscription = mongoose.model("Subscription", subscriptionSchema)