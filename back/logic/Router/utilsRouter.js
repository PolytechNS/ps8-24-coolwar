export function addCors(
    response,
    methods = ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"]
) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", methods.join(", "));
    response.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With, Content-Type, Authorization"
    );
    response.setHeader("Access-Control-Allow-Credentials", "true");
}

