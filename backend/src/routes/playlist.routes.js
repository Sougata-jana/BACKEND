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

router.route("/").post(verifyJWt, createPlaylist)

router.route("/user/:userId").get(getUserPlaylists)

router.route("/:playlistId")
    .get(getPlaylistById)
    .patch(verifyJWt, updatePlaylist)
    .delete(verifyJWt, deletePlaylist)

router.route("/add/:playlistId/:videoId").post(verifyJWt, addVideoToPlaylist)
router.route("/remove/:playlistId/:videoId").delete(verifyJWt, removeVideoFromPlaylist)

export default router;
