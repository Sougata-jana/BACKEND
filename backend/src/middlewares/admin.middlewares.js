import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyAdmin = asyncHandler(async (req, res, next) => {
    // Check if user exists (should be set by verifyJWt middleware)
    if (!req.user) {
        throw new ApiError(401, "Unauthorized request");
    }

    // Check if user is admin
    if (!req.user.isAdmin) {
        throw new ApiError(403, "Access denied. Admin privileges required.");
    }

    next();
});
