class ApiResponse {
    constructor(
        statusCode, data, message = "Successs"
    ) {

        this.statusCode = statusCode
        this.message = message
        this.data = data
        this.success = statusCode < 400
    }
}