class ApiError extends Error {// hm javascript ke built-in- error class ko inherit kr rhe h
    constructor(    // jb bhi new ApiError() chalaoge tb constructor call hoga
        statusCode,       //HTTP status (400, 404, 500)
        message= "Something went wrong",   //error message
        errors = [],      //kabhi mulitple error hote h eg "email req", "password too short" unko store krne k liye
        stack = ""        //error kha kha se hokr gya, ye debugging me useful hota h
    ){// he we overwrite the things writtn in constructer
        
        super(message)// super() parent class ka constructor call krta h,mtlb JS  ke original Error constructor ko call krta h
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors

        if(stack){// means agr manually stack bheja gya h to this.stack = stack o/w automatic generate kro
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor) //this=>current obj, this.constructor means curent class constructor mtlb ApiError
        }//current error ka clean stack trace generate kro
    }
}

export {ApiError}

// ye hm custom error class banaye h taki backend me errors ko properly handle kr paye


