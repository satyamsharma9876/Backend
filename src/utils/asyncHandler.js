const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}




export {asyncHandler}



// const asyncHandler = () => {}
// const asyncHandler = (func) => {}//curly braces ke undar ek or fun likh diya or curly braces hta dia or async banane k liye async keyword lga dia
// const asyncHandler = (func) => async () => {}

// const asyncHandler = (fn) => async(req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             sucess: false,
//             message: error.message
//         })
//     }
// }
// //how to convert this exact code into promises is written above

