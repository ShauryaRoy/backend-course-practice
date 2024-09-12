import express from "express";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/users.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
const app = express();

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        console.log('User found:', user); // Debugging statement
        const accessToken = await user.generateAccessToken(); // Await the token generation
        console.log('Access Token:', accessToken); // Debugging statement
        const refreshToken = await user.generateRefreshToken(); // Await the token generation
        console.log('Refresh Token:', refreshToken); // Debugging statement

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        console.log('User after saving:', user); // Debugging statement

        return { accessToken, refreshToken };
    } catch (error) {
        console.error('Error generating tokens:', error); // Debugging statement
        throw new ApiError(400, "something went wrong while generating Access and Refresh Token");
    }
}


// get user details from frontend
// validation - not empty
// check if user already exists: username, email
// check for images, check for avatar
// upload them to cloudinary, avatar
// create user object - create entry in db
// remove password and refresh token field from response
// check for user creation
// return res

const registerUser = async (req, res) => {
    const { fullname, email, username, password } = await req.body
    console.log(`emaill: ${email}`)

    if ([fullname, email, username, password].some((fields) => fields?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }
    const ExistedUser = await User.findOne({ $or: [{ username }, { email }] })
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

const loginUser = async (req, res) => {
    const { email, username, password } = req.body

    if (!(username || email)) {
        throw new ApiError(400, "Either email or username  is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "user not found")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "THe password is wrong")
    }

    const { refreshToken, accessToken } = await generateAccessTokenAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //cookie

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser, refreshToken, accessToken
            },
                "User logged in successfully")
        )

}

const logoutUser = async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
        }
    }, {
        new: true
    })
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user logout succcessfully"))
}


export { registerUser, loginUser, logoutUser };







































// import { asyncHandler } from "../utils/asyncHandler.js";


// const registerUser = asyncHandler(async (req, res) => {
//     return res.status(200).json({
//         message: "200"
//     })

// })

// export { registerUser }