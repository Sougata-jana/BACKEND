import { Router } from "express";
import {
    createBookmark,
    getUserBookmarks,
    getVideoBookmarks,
    updateBookmark,
    deleteBookmark,
    getBookmarkStats,
    getUserTags
} from "../controllers/bookmark.controllers.js";
import { verifyJWt } from "../middlewares/auth.middlewares.js";

const router = Router();

// Apply authentication to all routes
router.use(verifyJWt);

// User bookmarks
router.route("/").get(getUserBookmarks);
router.route("/stats").get(getBookmarkStats);
router.route("/tags").get(getUserTags);

// Video bookmarks
router.route("/video/:videoId").get(getVideoBookmarks);
router.route("/video/:videoId").post(createBookmark);

// Single bookmark operations
router.route("/:bookmarkId")
    .patch(updateBookmark)
    .delete(deleteBookmark);

export default router;
