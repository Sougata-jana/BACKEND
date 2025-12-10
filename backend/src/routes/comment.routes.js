import { Router } from "express";
import { 
    addComment, 
    deleteComment, 
    getVideoComments, 
    updateComment 
} from "../controllers/comment.controllers.js";
import { verifyJWt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/:videoId")
    .get(getVideoComments)
    .post(verifyJWt, addComment)

router.route("/c/:commentId")
    .delete(verifyJWt, deleteComment)
    .patch(verifyJWt, updateComment)

export default router;
