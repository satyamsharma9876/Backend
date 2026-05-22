class ApiResponse {
    constructor(statusCode, data, message= "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400// agr status code 400 se choti h to req successful mani jayegi o/w success= false
    }
}

export { ApiResponse }
