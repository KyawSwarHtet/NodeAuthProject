const mongoose = require("mongoose")

const { Schema } = mongoose;

const PostSchema = new Schema(
    {
        username: {
            type: String,
            require: true,
            default:"username"
        },
        title: {
            type: String,
            require: true,
            max: 50
        },
        description: {
            type: String,
            require:true

        },
        age: {
            type: Number,
            require: true,
          max:3
        },
        profileImg: {
            type: String,
            require:true
        }

    }, {
        timestamps:true
    }
)
module.exports = mongoose.model("posts",PostSchema)