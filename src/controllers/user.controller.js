import express from "express";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/users.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
const app = express();

const registerUser = async (req, res) => {
    const { fullname, email, username, password } = req.body
    console.log(`emaill: ${email}`)

    if ([fullname, email, username, password].some((fields) => fields?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }
    const ExistedUser = User.findOne({ $or: [{ username }, { email }] })
    if (ExistedUser) {
        throw new ApiError(409, "User or email already exist")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.avatar[0]?.paths

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()

    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went eorng while registering new user")
    }
    return res.status(201).json(
        new ApiResponse(200, "User REgistered successfully")
    )

}



export { registerUser };




// import { asyncHandler } from "../utils/asyncHandler.js";


// const registerUser = asyncHandler(async (req, res) => {
//     return res.status(200).json({
//         message: "200"
//     })

// })

// export { registerUser }