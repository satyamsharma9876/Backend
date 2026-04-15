import {v2 as cloudinary} from "cloudinary"
import fs from "fs"// fs is the file system helps to resd write,etc when to manage file sys use fs


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET);


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        //upload the fil on cloudinary
            const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);// got printed 2 times for avatar and for coverImage
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
         //console.log("Cloudinary Error:", error);
        fs.unlinkSync(localFilePath)// remove the locally saved file as the upload 
        // operation got failed
        return null;        
    }
}

export {uploadOnCloudinary}

