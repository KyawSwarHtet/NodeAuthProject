const mongoose = require("mongoose");
const { Schema } = mongoose

const UserSchema = new Schema(
    {
        
        username: {
            type: String,
            require: true
        },
        email: {
            type: String,
            require:true
        },
         password: {
            type: String,
            require:true
        },
          login: {
            type: Boolean,
            require: true,
            default: false
        },
           gender: {
      type: String,
      default: "",
    },
           address: {
               type: String,
            default:""
        },
           profilePicture: {
               type: [],
               require: true,
            default:""
        },
         
    }, {
        timestamps:true
    }
)
const UserModel = mongoose.model("user", UserSchema)
module.exports = UserModel