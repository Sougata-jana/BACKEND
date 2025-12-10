import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                message: "BuzzTube API is running successfully",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || "development"
            },
            "Health check successful"
        )
    )
})

export { healthCheck }
