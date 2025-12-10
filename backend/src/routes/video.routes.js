import { Router } from "express";
import { 
    deleteVideo, 
    getAllVideos, 
    getVideoById, 
    publishAVideo, 
    togglePublishStatus, 
    updateVideo 
} from "../controllers/video.controllers.js";
import { upload } from "../middlewares/multer.middewares.js";
import { verifyJWt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/")
    .get(getAllVideos)
    .post(
        verifyJWt,
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1
            },
            {
                name: "thumbnail",
                maxCount: 1
            }
        ]),
        publishAVideo
    )

router.route("/:videoId")
    .get(getVideoById)
    .delete(verifyJWt, deleteVideo)
    .patch(verifyJWt, updateVideo)

router.route("/toggle/publish/:videoId")
    .patch(verifyJWt, togglePublishStatus)

export default router;
