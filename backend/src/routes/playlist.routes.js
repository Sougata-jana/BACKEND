import { Router } from "express";
import { 
    addVideoToPlaylist, 
    createPlaylist, 
    deletePlaylist, 
    getPlaylistById, 
    getUserPlaylists, 
    removeVideoFromPlaylist, 
    updatePlaylist 
} from "../controllers/playlist.controllers.js";
import { verifyJWt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWt) // Apply verifyJWt middleware to all routes in this file

router.route("/").post(createPlaylist)

router.route("/user/:userId").get(getUserPlaylists)

router.route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist)

router.route("/add/:playlistId/:videoId").post(addVideoToPlaylist)
router.route("/remove/:playlistId/:videoId").delete(removeVideoFromPlaylist)

export default router;
