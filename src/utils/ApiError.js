class ApiError extends Error {
    constructor(
        statusCode,       //HTTP status (400, 404, 500)
        message= "Something went wrong",   //error message
        errors = [],      //detailed errors (array)
        stack = ""        //debugging info
    ){// he we overwrite the things writtn in constructer
        
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor) 
        }
    }
}

export {ApiError}
