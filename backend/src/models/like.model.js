import mongoose, {Schema, Types,} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const likeSchema = new Schema({
    comment:{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    video:{
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    likeBy:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    tweet:{
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    },
    isLike:{
        type: Boolean,
        default: true // true = like, false = dislike
    }

},{timestamps:true})

likeSchema.plugin(mongooseAggregatePaginate)
export const Like = mongoose.model("Like", likeSchema)