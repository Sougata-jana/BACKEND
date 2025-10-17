import { Router } from "express";
import { 
    addComment, 
    deleteComment, 
    getVideoComments, 
    updateComment 
} from "../controllers/comment.controllers.js";
import { verifyJWt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWt) // Apply verifyJWt middleware to all routes in this file

router.route("/:videoId").get(getVideoComments).post(addComment)

router.route("/c/:commentId")
    .delete(deleteComment)
    .patch(updateComment)

export default router;
